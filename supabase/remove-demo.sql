-- Tharsy: remove as 12 peças fictícias de seed-demo.sql, deixando o catálogo vazio para a loja real.
-- Apaga somente os IDs de demonstração (00000000-0000-4000-8000-000000000001 a ...012).
-- As fotos delas ficam no próprio site (/images/), então nada é apagado do Storage.
-- Peças cadastradas pela lojista não são afetadas. Reexecutável.
begin;
delete from public.products
where id between '00000000-0000-4000-8000-000000000001' and '00000000-0000-4000-8000-000000000012';
select count(*) as pecas_restantes from public.products;
commit;
