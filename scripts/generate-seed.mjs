import { writeFile } from 'node:fs/promises';
import { demoProducts } from '../src/demo.ts';
const quote = text => `'${String(text).replaceAll("'", "''")}'`;
const statements = demoProducts.map((p, i) => `
insert into public.products(id, name, description, price_cents, category, available, featured)
values (${quote(p.id)}, ${quote(p.name)}, ${quote(p.description)}, ${p.price_cents}, ${quote(p.category)}, ${p.available}, ${p.featured})
on conflict (id) do nothing;
insert into public.product_images(id, product_id, url, path, position)
values ('10000000-0000-4000-8000-${String(i + 1).padStart(12, '0')}', ${quote(p.id)}, ${quote(p.images[0].url)}, null, 0)
on conflict do nothing;`);
await writeFile('supabase/seed-demo.sql', `-- Opcional: execute explicitamente após a migration.\n-- 12 produtos fictícios, preços e fotos ilustrativos.\n-- Reexecutável: sem duplicação, exclusão ou atualização.\nbegin;\n${statements.join('\n')}\ncommit;\n`, 'utf8');
console.log('supabase/seed-demo.sql gerado (12 produtos, sem sobrescrever).');
