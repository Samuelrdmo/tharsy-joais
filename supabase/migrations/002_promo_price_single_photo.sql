-- Tharsy: preço promocional e uma única foto por peça.
-- Execute pelo SQL Editor do Supabase depois de 001_catalog.sql. Reexecutável.
begin;

alter table public.products add column if not exists promo_price_cents integer;
alter table public.products drop constraint if exists products_promo_price_check;
alter table public.products add constraint products_promo_price_check
  check (promo_price_cents is null or (promo_price_cents > 0 and promo_price_cents < price_cents));
-- Preço efetivamente cobrado, usado na ordenação "menor/maior preço".
alter table public.products add column if not exists final_price_cents integer
  generated always as (coalesce(promo_price_cents, price_cents)) stored;
create index if not exists products_final_price_idx on public.products (final_price_cents, created_at desc, id);

create or replace function public.save_product(p_product jsonb) returns uuid
language plpgsql security definer set search_path = '' as $$
declare
  v_id uuid := (p_product->>'id')::uuid;
  v_old public.products%rowtype;
  v_image jsonb;
  v_count integer;
begin
  if not public.is_admin() then raise exception 'acesso negado' using errcode = '42501'; end if;
  v_count := jsonb_array_length(p_product->'images');
  if v_count is null or v_count <> 1 then raise exception 'selecione exatamente uma foto'; end if;
  -- Mesmo ID em retries: não cria duplicatas após resposta de rede perdida.
  perform pg_advisory_xact_lock(hashtextextended(v_id::text, 0));
  select * into v_old from public.products where id = v_id for update;
  if found then
    if v_old.updated_at <> (p_product->>'updated_at')::timestamptz then raise exception 'conflito: produto alterado'; end if;
    update public.products set name = btrim(p_product->>'name'), description = coalesce(p_product->>'description', ''),
      price_cents = (p_product->>'price_cents')::integer, promo_price_cents = (p_product->>'promo_price_cents')::integer,
      category = p_product->>'category', available = (p_product->>'available')::boolean, featured = (p_product->>'featured')::boolean where id = v_id;
  else
    insert into public.products(id, name, description, price_cents, promo_price_cents, category, available, featured)
    values (v_id, btrim(p_product->>'name'), coalesce(p_product->>'description', ''), (p_product->>'price_cents')::integer,
      (p_product->>'promo_price_cents')::integer, p_product->>'category', (p_product->>'available')::boolean, (p_product->>'featured')::boolean);
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
      values ((v_image->>'id')::uuid, v_id, v_image->>'url', v_image->>'path', 0);
    delete from public.storage_cleanup where path = v_image->>'path';
  end loop;
  return v_id;
end;
$$;
revoke all on function public.save_product(jsonb) from public;
grant execute on function public.save_product(jsonb) to authenticated;

-- Fotos novas são comprimidas no navegador para ~200 KB; 512 KB é o teto de segurança.
update storage.buckets set file_size_limit = 524288 where id = 'product-photos';
commit;
