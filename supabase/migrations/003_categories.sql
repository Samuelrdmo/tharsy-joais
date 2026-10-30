-- Tharsy: categorias cadastráveis pelo painel.
-- Execute pelo SQL Editor do Supabase depois de 002_promo_price_single_photo.sql. Reexecutável.
begin;

create table if not exists public.categories (
  name text primary key check (name = btrim(name) and char_length(name) between 1 and 40),
  created_at timestamptz not null default now()
);
-- Impede duplicatas que só diferem em maiúsculas/minúsculas ("Anéis" e "anéis").
create unique index if not exists categories_name_lower_idx on public.categories (lower(name));

-- Categorias atuais, na ordem em que já apareciam no site, e qualquer outra em uso.
insert into public.categories(name, created_at)
select name, now() - (interval '1 second' * (10 - ord)) from (values ('Anéis', 1), ('Brincos', 2), ('Colares', 3), ('Pulseiras', 4), ('Conjuntos', 5)) as c(name, ord)
on conflict do nothing;
insert into public.categories(name) select distinct category from public.products on conflict do nothing;

-- O produto passa a apontar para a tabela em vez da lista fixa.
alter table public.products drop constraint if exists products_category_check;
alter table public.products drop constraint if exists products_category_fkey;
-- Excluir uma categoria em uso é bloqueado: mude a categoria das peças antes.
alter table public.products add constraint products_category_fkey
  foreign key (category) references public.categories(name) on update cascade on delete restrict;

alter table public.categories enable row level security;
drop policy if exists "public categories" on public.categories;
drop policy if exists "admin adds categories" on public.categories;
drop policy if exists "admin removes categories" on public.categories;
create policy "public categories" on public.categories for select to anon, authenticated using (true);
create policy "admin adds categories" on public.categories for insert to authenticated with check ((select public.is_admin()));
create policy "admin removes categories" on public.categories for delete to authenticated using ((select public.is_admin()));
revoke all on public.categories from anon, authenticated;
grant select on public.categories to anon, authenticated;
grant insert, delete on public.categories to authenticated;
commit;
