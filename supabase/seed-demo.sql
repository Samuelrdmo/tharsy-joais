-- Opcional: execute explicitamente após a migration.
-- 12 produtos fictícios, preços e fotos ilustrativos.
-- Reexecutável: sem duplicação, exclusão ou atualização.
begin;

insert into public.products(id, name, description, price_cents, category, available, featured)
values ('00000000-0000-4000-8000-000000000001', 'Argola Essência', 'Uma peça delicada para compor o seu estilo e acompanhar os pequenos e grandes momentos. Combine com seus acessórios favoritos.

Produto fictício: fotos, preço, acabamento e disponibilidade são apenas demonstrativos. Consulte a loja para conhecer as peças reais.', 8900, 'Brincos', true, true)
on conflict (id) do nothing;
insert into public.product_images(id, product_id, url, path, position)
values ('10000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000001', '/images/earrings.jpg', null, 0)
on conflict do nothing;

insert into public.products(id, name, description, price_cents, category, available, featured)
values ('00000000-0000-4000-8000-000000000002', 'Colar Ponto de Luz', 'Uma peça delicada para compor o seu estilo e acompanhar os pequenos e grandes momentos. Combine com seus acessórios favoritos.

Produto fictício: fotos, preço, acabamento e disponibilidade são apenas demonstrativos. Consulte a loja para conhecer as peças reais.', 12900, 'Colares', true, true)
on conflict (id) do nothing;
insert into public.product_images(id, product_id, url, path, position)
values ('10000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-000000000002', '/images/necklace.jpg', null, 0)
on conflict do nothing;

insert into public.products(id, name, description, price_cents, category, available, featured)
values ('00000000-0000-4000-8000-000000000003', 'Anel Entrelaços', 'Uma peça delicada para compor o seu estilo e acompanhar os pequenos e grandes momentos. Combine com seus acessórios favoritos.

Produto fictício: fotos, preço, acabamento e disponibilidade são apenas demonstrativos. Consulte a loja para conhecer as peças reais.', 7900, 'Anéis', true, true)
on conflict (id) do nothing;
insert into public.product_images(id, product_id, url, path, position)
values ('10000000-0000-4000-8000-000000000003', '00000000-0000-4000-8000-000000000003', '/images/rings.jpg', null, 0)
on conflict do nothing;

insert into public.products(id, name, description, price_cents, category, available, featured)
values ('00000000-0000-4000-8000-000000000004', 'Pulseira Elo', 'Uma peça delicada para compor o seu estilo e acompanhar os pequenos e grandes momentos. Combine com seus acessórios favoritos.

Produto fictício: fotos, preço, acabamento e disponibilidade são apenas demonstrativos. Consulte a loja para conhecer as peças reais.', 11900, 'Pulseiras', true, true)
on conflict (id) do nothing;
insert into public.product_images(id, product_id, url, path, position)
values ('10000000-0000-4000-8000-000000000004', '00000000-0000-4000-8000-000000000004', '/images/bracelet.jpg', null, 0)
on conflict do nothing;

insert into public.products(id, name, description, price_cents, category, available, featured)
values ('00000000-0000-4000-8000-000000000005', 'Brinco Gota Dourada', 'Uma peça delicada para compor o seu estilo e acompanhar os pequenos e grandes momentos. Combine com seus acessórios favoritos.

Produto fictício: fotos, preço, acabamento e disponibilidade são apenas demonstrativos. Consulte a loja para conhecer as peças reais.', 9900, 'Brincos', true, false)
on conflict (id) do nothing;
insert into public.product_images(id, product_id, url, path, position)
values ('10000000-0000-4000-8000-000000000005', '00000000-0000-4000-8000-000000000005', '/images/gold.jpg', null, 0)
on conflict do nothing;

insert into public.products(id, name, description, price_cents, category, available, featured)
values ('00000000-0000-4000-8000-000000000006', 'Colar Delicadeza', 'Uma peça delicada para compor o seu estilo e acompanhar os pequenos e grandes momentos. Combine com seus acessórios favoritos.

Produto fictício: fotos, preço, acabamento e disponibilidade são apenas demonstrativos. Consulte a loja para conhecer as peças reais.', 14900, 'Colares', true, false)
on conflict (id) do nothing;
insert into public.product_images(id, product_id, url, path, position)
values ('10000000-0000-4000-8000-000000000006', '00000000-0000-4000-8000-000000000006', '/images/hero.jpg', null, 0)
on conflict do nothing;

insert into public.products(id, name, description, price_cents, category, available, featured)
values ('00000000-0000-4000-8000-000000000007', 'Anel Luz', 'Uma peça delicada para compor o seu estilo e acompanhar os pequenos e grandes momentos. Combine com seus acessórios favoritos.

Produto fictício: fotos, preço, acabamento e disponibilidade são apenas demonstrativos. Consulte a loja para conhecer as peças reais.', 6900, 'Anéis', false, false)
on conflict (id) do nothing;
insert into public.product_images(id, product_id, url, path, position)
values ('10000000-0000-4000-8000-000000000007', '00000000-0000-4000-8000-000000000007', '/images/rings.jpg', null, 0)
on conflict do nothing;

insert into public.products(id, name, description, price_cents, category, available, featured)
values ('00000000-0000-4000-8000-000000000008', 'Conjunto Harmonia', 'Uma peça delicada para compor o seu estilo e acompanhar os pequenos e grandes momentos. Combine com seus acessórios favoritos.

Produto fictício: fotos, preço, acabamento e disponibilidade são apenas demonstrativos. Consulte a loja para conhecer as peças reais.', 21900, 'Conjuntos', true, false)
on conflict (id) do nothing;
insert into public.product_images(id, product_id, url, path, position)
values ('10000000-0000-4000-8000-000000000008', '00000000-0000-4000-8000-000000000008', '/images/gold.jpg', null, 0)
on conflict do nothing;

insert into public.products(id, name, description, price_cents, category, available, featured)
values ('00000000-0000-4000-8000-000000000009', 'Pulseira Laços', 'Uma peça delicada para compor o seu estilo e acompanhar os pequenos e grandes momentos. Combine com seus acessórios favoritos.

Produto fictício: fotos, preço, acabamento e disponibilidade são apenas demonstrativos. Consulte a loja para conhecer as peças reais.', 10900, 'Pulseiras', true, false)
on conflict (id) do nothing;
insert into public.product_images(id, product_id, url, path, position)
values ('10000000-0000-4000-8000-000000000009', '00000000-0000-4000-8000-000000000009', '/images/bracelet.jpg', null, 0)
on conflict do nothing;

insert into public.products(id, name, description, price_cents, category, available, featured)
values ('00000000-0000-4000-8000-000000000010', 'Brinco Minimal', 'Uma peça delicada para compor o seu estilo e acompanhar os pequenos e grandes momentos. Combine com seus acessórios favoritos.

Produto fictício: fotos, preço, acabamento e disponibilidade são apenas demonstrativos. Consulte a loja para conhecer as peças reais.', 5900, 'Brincos', true, false)
on conflict (id) do nothing;
insert into public.product_images(id, product_id, url, path, position)
values ('10000000-0000-4000-8000-000000000010', '00000000-0000-4000-8000-000000000010', '/images/earrings.jpg', null, 0)
on conflict do nothing;

insert into public.products(id, name, description, price_cents, category, available, featured)
values ('00000000-0000-4000-8000-000000000011', 'Colar Horizonte', 'Uma peça delicada para compor o seu estilo e acompanhar os pequenos e grandes momentos. Combine com seus acessórios favoritos.

Produto fictício: fotos, preço, acabamento e disponibilidade são apenas demonstrativos. Consulte a loja para conhecer as peças reais.', 13900, 'Colares', false, false)
on conflict (id) do nothing;
insert into public.product_images(id, product_id, url, path, position)
values ('10000000-0000-4000-8000-000000000011', '00000000-0000-4000-8000-000000000011', '/images/necklace.jpg', null, 0)
on conflict do nothing;

insert into public.products(id, name, description, price_cents, category, available, featured)
values ('00000000-0000-4000-8000-000000000012', 'Conjunto Essencial', 'Uma peça delicada para compor o seu estilo e acompanhar os pequenos e grandes momentos. Combine com seus acessórios favoritos.

Produto fictício: fotos, preço, acabamento e disponibilidade são apenas demonstrativos. Consulte a loja para conhecer as peças reais.', 18900, 'Conjuntos', true, false)
on conflict (id) do nothing;
insert into public.product_images(id, product_id, url, path, position)
values ('10000000-0000-4000-8000-000000000012', '00000000-0000-4000-8000-000000000012', '/images/hero.jpg', null, 0)
on conflict do nothing;
commit;
