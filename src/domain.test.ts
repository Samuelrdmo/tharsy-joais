import test from 'node:test';
import assert from 'node:assert/strict';
import { parsePrice, filterProducts, whatsAppMessage, validPhone, finalPrice, hasPromo, categoryName, sameCategory } from './domain.ts';
import type { Product } from './domain.ts';
import { adminAccount, resolveAdminIdentity } from './admin-login.ts';

test('username login normalizes case and spaces, rejects emails and unknown users', () => {
  assert.equal(resolveAdminIdentity('tharsyadmin'), adminAccount.authIdentity);
  assert.equal(resolveAdminIdentity('  TharsyAdmin  '), adminAccount.authIdentity);
  for (const input of ['', 'admin', 'outra-conta', adminAccount.authIdentity]) assert.equal(resolveAdminIdentity(input), null);
});
test('BRL parser uses integer cents and rejects ambiguous or invalid input', () => {
  assert.equal(parsePrice('1.299,90'), 129990); assert.equal(parsePrice('R$ 89,9'), 8990);
  assert.equal(parsePrice('129'), 12900); assert.equal(parsePrice('0,01'), 1);
  for (const input of ['', '-1', '0', '10.99', '10,999', '12abc', '99999999999999']) assert.equal(parsePrice(input), null, input);
});
const a = { id: 'a', name: 'Anel Essência', category: 'Anéis', price_cents: 10000, available: true, featured: false, created_at: '2026-10-01' } as Product;
const b = { ...a, id: 'b', name: 'Colar Essência', category: 'Colares', price_cents: 20000, available: false, featured: true } as Product;
const filters = { search: '', category: '', available: false, sort: 'featured' as const };
test('search is accent insensitive; category and availability combine', () => {
  assert.deepEqual(filterProducts([a,b], { ...filters, search: 'essencia', category: 'Anéis', available: true }).map(p => p.id), ['a']);
  assert.deepEqual(filterProducts([a,b], { ...filters, category: 'Colares', available: true }), []);
});
test('featured, price and deterministic ties keep pagination consistent', () => {
  assert.deepEqual(filterProducts([a,b], filters).map(p => p.id), ['b','a']);
  assert.deepEqual(filterProducts([b,a], { ...filters, sort: 'price-asc' }).map(p => p.id), ['a','b']);
  assert.deepEqual(filterProducts([b,a], { ...filters, sort: 'price-desc' }).map(p => p.id), ['b','a']);
});
test('WhatsApp message includes product, BRL price, deep link and availability', () => {
  const text = whatsAppMessage(a, 'https://tharsy.example');
  assert.ok(text.includes('Anel Essência')); assert.match(text, /100,00/); assert.ok(text.includes('https://tharsy.example/#/produto/a'));
  assert.match(whatsAppMessage(b, 'https://tharsy.example'), /consultar a disponibilidade/);
  assert.equal(validPhone(''), false); assert.equal(validPhone('5511999999999'), true); assert.equal(validPhone('0000000'), false);
});
test('promo price is charged, sorted and sent on WhatsApp; the normal price stays as reference', () => {
  const promo = { ...b, id: 'p', price_cents: 30000, promo_price_cents: 5000 } as Product;
  assert.equal(finalPrice(promo), 5000); assert.equal(hasPromo(promo), true); assert.equal(hasPromo({ ...a, promo_price_cents: null }), false);
  assert.deepEqual(filterProducts([a, promo], { ...filters, sort: 'price-asc' }).map(p => p.id), ['p','a']);
  assert.match(whatsAppMessage(promo, 'https://tharsy.example'), /50,00/);
});
test('category names are trimmed, keep their letters and compare without case', () => {
  assert.equal(categoryName('  Tornozeleiras  '), 'Tornozeleiras'); assert.equal(categoryName('Kits   de  presente'), 'Kits de presente');
  assert.equal(categoryName('   '), null); assert.equal(categoryName('x'.repeat(41)), null);
  assert.equal(sameCategory('Anéis', 'ANÉIS'), true); assert.equal(sameCategory('Anéis', 'Brincos'), false);
});
