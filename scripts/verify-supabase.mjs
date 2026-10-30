// Verificação do projeto real com chave pública. Nunca usa service_role.
import assert from 'node:assert/strict';
import { createClient } from '@supabase/supabase-js';
process.loadEnvFile('.env');
const client = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_PUBLISHABLE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
const { data, count, error } = await client.from('products').select('id,name,price_cents,images:product_images(id,url,position)', { count: 'exact' }).order('id').range(0,11);
assert.ifError(error); assert.ok(count >= 12); assert.equal(data.length, 12);
assert.ok(data.every(p => p.images.length >= 1 && Number.isInteger(p.price_cents)));
console.log(`PASS catálogo público: ${count} produtos, 12 carregados com fotos e preços em centavos`);
const auth = await client.rpc('is_admin'); assert.ifError(auth.error); assert.equal(auth.data, false);
console.log('PASS visitante não recebe autorização administrativa');
const attempt = await client.rpc('save_product', { p_product: { id: '99999999-9999-4999-8999-999999999999', name: 'Teste de permissão', description: '', category: 'Anéis', price_cents: 100, available: true, featured: false, images: [] } });
assert.ok(attempt.error); assert.equal(attempt.error.code, '42501');
console.log('PASS gravação por visitante bloqueada pelo servidor');
const admins = await client.from('admin_users').select('user_id'); assert.ok(admins.error);
console.log('PASS lista administrativa não é pública');
