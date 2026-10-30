-- Tharsy: execute pelo SQL Editor do seu projeto Supabase.
-- Tabelas públicas contêm somente informações destinadas ao catálogo.
begin;

create table public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.admin_users enable row level security;
create policy "admin reads own authorization" on public.admin_users for select to authenticated using (user_id = (select auth.uid()));
revoke all on public.admin_users from anon, authenticated;
grant select on public.admin_users to authenticated;

create function public.is_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.admin_users where user_id = (select auth.uid()));
$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(btrim(name)) between 1 and 120),
  description text not null default '' check (char_length(description) <= 3000),
  price_cents integer not null check (price_cents > 0 and price_cents <= 99999999),
  category text not null check (category in ('Anéis', 'Brincos', 'Colares', 'Pulseiras', 'Conjuntos')),
  available boolean not null default true,
  featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index products_category_created_idx on public.products (category, created_at desc, id);
create index products_featured_idx on public.products (featured desc, created_at desc, id);
create index products_price_idx on public.products (price_cents, created_at desc, id);
create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  url text not null check (url ~ '^https://' or url ~ '^/images/[a-zA-Z0-9._-]+$'),
  path text unique,
  position smallint not null check (position between 0 and 4),
  created_at timestamptz not null default now(),
  unique (product_id, position)
);
create index product_images_product_idx on public.product_images(product_id);
-- Fila durável: paths aguardando upload ou limpeza, nunca referências em uso.
create table public.storage_cleanup (
  path text primary key check (path !~ '\.\.' and path ~ '^[a-f0-9-]+/[a-f0-9-]+/[a-f0-9-]+\.(webp|jpg)$'),
  created_at timestamptz not null default now()
);
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.storage_cleanup enable row level security;
create policy "public catalogue" on public.products for select to anon, authenticated using (true);
create policy "public product images" on public.product_images for select to anon, authenticated using (true);
create policy "admin products" on public.products for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "admin images" on public.product_images for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "admin cleanup reads unreferenced" on public.storage_cleanup for select to authenticated using (
  (select public.is_admin()) and not exists (select 1 from public.product_images i where i.path = storage_cleanup.path)
  -- Não concorrer com uploads em andamento em outra aba/dispositivo.
  and created_at < now() - interval '15 minutes'
);
create policy "admin queues cleanup" on public.storage_cleanup for insert to authenticated with check ((select public.is_admin()));
create policy "admin removes cleanup" on public.storage_cleanup for delete to authenticated using ((select public.is_admin()));
grant select on public.products, public.product_images to anon, authenticated;
-- Toda escrita usa funções transacionais, não grants diretos nessas duas tabelas.
revoke insert, update, delete on public.products, public.product_images from anon, authenticated;
grant select, insert, delete on public.storage_cleanup to authenticated;

create function public.touch_updated_at() returns trigger language plpgsql set search_path = '' as $$
begin new.updated_at = clock_timestamp(); return new; end;
$$;
create trigger products_touch_updated_at before update on public.products for each row execute function public.touch_updated_at();

create function public.save_product(p_product jsonb) returns uuid
language plpgsql security definer set search_path = '' as $$
declare
  v_id uuid := (p_product->>'id')::uuid;
  v_old public.products%rowtype;
  v_image jsonb;
  v_count integer;
begin
  if not public.is_admin() then raise exception 'acesso negado' using errcode = '42501'; end if;
  v_count := jsonb_array_length(p_product->'images');
  if v_count is null or v_count < 1 or v_count > 5 then raise exception 'selecione de uma a cinco fotos'; end if;
  -- Mesmo ID em retries: não cria duplicatas após resposta de rede perdida.
  perform pg_advisory_xact_lock(hashtextextended(v_id::text, 0));
  select * into v_old from public.products where id = v_id for update;
  if found then
    if v_old.updated_at <> (p_product->>'updated_at')::timestamptz then raise exception 'conflito: produto alterado'; end if;
    update public.products set name = btrim(p_product->>'name'), description = coalesce(p_product->>'description', ''),
      price_cents = (p_product->>'price_cents')::integer, category = p_product->>'category',
      available = (p_product->>'available')::boolean, featured = (p_product->>'featured')::boolean where id = v_id;
  else
    insert into public.products(id, name, description, price_cents, category, available, featured)
    values (v_id, btrim(p_product->>'name'), coalesce(p_product->>'description', ''), (p_product->>'price_cents')::integer,
      p_product->>'category', (p_product->>'available')::boolean, (p_product->>'featured')::boolean);
  end if;
  -- Coloca fotos removidas na fila dentro da mesma transação da alteração.
  insert into public.storage_cleanup(path, created_at)
    select i.path, now() - interval '16 minutes' from public.product_images i where product_id = v_id and i.path is not null
      and not exists(select 1 from jsonb_array_elements(p_product->'images') p where p->>'path' = i.path)
    on conflict(path) do nothing;
  delete from public.product_images where product_id = v_id;
  for v_image in select value from jsonb_array_elements(p_product->'images') loop
    if v_image->>'path' is not null then
      if v_image->>'path' !~ '^[a-f0-9-]+/[a-f0-9-]+/[a-f0-9-]+\.(webp|jpg)$' or split_part(v_image->>'path', '/', 2) <> v_id::text then
        raise exception 'caminho de foto inválido';
      end if;
      if not exists (select 1 from storage.objects where bucket_id = 'product-photos' and name = v_image->>'path') then
        raise exception 'foto não enviada';
      end if;
    end if;
    insert into public.product_images(id, product_id, url, path, position)
      values ((v_image->>'id')::uuid, v_id, v_image->>'url', v_image->>'path', (v_image->>'position')::smallint);
    delete from public.storage_cleanup where path = v_image->>'path';
  end loop;
  return v_id;
end;
$$;

create function public.delete_product(p_id uuid, p_updated_at timestamptz) returns void
language plpgsql security definer set search_path = '' as $$
declare v_current timestamptz;
begin
  if not public.is_admin() then raise exception 'acesso negado' using errcode = '42501'; end if;
  perform pg_advisory_xact_lock(hashtextextended(p_id::text, 0));
  select updated_at into v_current from public.products where id = p_id for update;
  if not found then return; end if;
  if v_current <> p_updated_at then raise exception 'conflito: produto alterado'; end if;
  insert into public.storage_cleanup(path, created_at) select path, now() - interval '16 minutes' from public.product_images
    where product_id = p_id and path is not null on conflict(path) do nothing;
  delete from public.products where id = p_id;
end;
$$;
revoke all on function public.save_product(jsonb), public.delete_product(uuid, timestamptz) from public;
grant execute on function public.save_product(jsonb), public.delete_product(uuid, timestamptz) to authenticated;

insert into storage.buckets(id, name, public, file_size_limit, allowed_mime_types)
values ('product-photos', 'product-photos', true, 1048576, array['image/webp', 'image/jpeg'])
on conflict(id) do nothing;
create policy "public photo reads" on storage.objects for select to anon, authenticated using (bucket_id = 'product-photos');
create policy "admin photo upload" on storage.objects for insert to authenticated with check (
  bucket_id = 'product-photos' and (select public.is_admin()) and (storage.foldername(name))[1] = (select auth.uid())::text
);
create policy "admin photo deletion" on storage.objects for delete to authenticated using (
  bucket_id = 'product-photos' and (select public.is_admin())
  and not exists(select 1 from public.product_images i where i.path = storage.objects.name)
);
commit;
