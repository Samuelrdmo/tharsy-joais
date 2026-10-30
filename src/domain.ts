/** Categorias iniciais. As reais ficam na tabela categories e são gerenciadas no painel. */
export const DEFAULT_CATEGORIES = ['Anéis', 'Brincos', 'Colares', 'Pulseiras', 'Conjuntos'];
export type Category = string;
/** Normaliza o nome digitado; null quando vazio ou longo demais. */
export function categoryName(value: string): string | null {
  const name = value.trim().replace(/\s+/g, ' ');
  return name.length >= 1 && name.length <= 40 ? name : null;
}
export const sameCategory = (a: string, b: string) => a.toLocaleLowerCase('pt-BR') === b.toLocaleLowerCase('pt-BR');
export type ProductImage = { id: string; url: string; path: string | null; position: number };
export type Product = {
  id: string; name: string; description: string; price_cents: number; promo_price_cents: number | null; category: Category;
  available: boolean; featured: boolean; created_at: string; updated_at: string; images: ProductImage[];
};
export type Sort = 'featured' | 'newest' | 'price-asc' | 'price-desc';
export type Filters = { search: string; category: string; available: boolean; sort: Sort };
export const PAGE_SIZE = 12;
export const isDemoProductId = (id: string) => /^00000000-0000-4000-8000-0000000000(?:0[1-9]|1[0-2])$/.test(id);
export const money = (cents: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100);
/** Preço cobrado: o promocional quando houver, senão o normal. */
export const finalPrice = (p: Pick<Product, 'price_cents' | 'promo_price_cents'>) => p.promo_price_cents ?? p.price_cents;
export const hasPromo = (p: Pick<Product, 'price_cents' | 'promo_price_cents'>) => p.promo_price_cents !== null && p.promo_price_cents < p.price_cents;
export function parsePrice(value: string): number | null {
  const clean = value.trim().replace(/\s|R\$/g, '');
  const valid = /^(?:\d+|\d{1,3}(?:\.\d{3})+)(?:,\d{1,2})?$/.test(clean);
  if (!valid) return null;
  const [integer, decimal = ''] = clean.replaceAll('.', '').split(',');
  const cents = Number(integer) * 100 + Number(decimal.padEnd(2, '0'));
  return Number.isSafeInteger(cents) && cents > 0 && cents <= 99999999 ? cents : null;
}
export function validPhone(phone: string): boolean { return /^[1-9]\d{9,14}$/.test(phone); }
export function productUrl(id: string, origin = window.location.origin) { return `${origin}/#/produto/${encodeURIComponent(id)}`; }
export function whatsAppMessage(product: Product, origin?: string) {
  return `Olá, Tharsy! ${product.available ? 'Tenho interesse' : 'Gostaria de consultar a disponibilidade'} na peça ${product.name} (${money(finalPrice(product))}).\n${productUrl(product.id, origin)}`;
}
const normalize = (text: string) => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR');
export function filterProducts(items: Product[], filters: Filters) {
  return items.filter(p => normalize(p.name).includes(normalize(filters.search)) && (!filters.category || p.category === filters.category) && (!filters.available || p.available))
    .sort((a, b) => filters.sort === 'price-asc' ? finalPrice(a) - finalPrice(b) : filters.sort === 'price-desc' ? finalPrice(b) - finalPrice(a) : filters.sort === 'featured' && a.featured !== b.featured ? Number(b.featured) - Number(a.featured) : b.created_at.localeCompare(a.created_at) || a.id.localeCompare(b.id));
}
