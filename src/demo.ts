import type { Product } from './domain';
export const demoProducts: Product[] = [
  ['Argola Essência', 8900, 'Brincos', 'earrings', true, true],
  ['Colar Ponto de Luz', 12900, 'Colares', 'necklace', true, true],
  ['Anel Entrelaços', 7900, 'Anéis', 'rings', true, true],
  ['Pulseira Elo', 11900, 'Pulseiras', 'bracelet', true, true],
  ['Brinco Gota Dourada', 9900, 'Brincos', 'gold', true, false],
  ['Colar Delicadeza', 14900, 'Colares', 'hero', true, false],
  ['Anel Luz', 6900, 'Anéis', 'rings', false, false],
  ['Conjunto Harmonia', 21900, 'Conjuntos', 'gold', true, false],
  ['Pulseira Laços', 10900, 'Pulseiras', 'bracelet', true, false],
  ['Brinco Minimal', 5900, 'Brincos', 'earrings', true, false],
  ['Colar Horizonte', 13900, 'Colares', 'necklace', false, false],
  ['Conjunto Essencial', 18900, 'Conjuntos', 'hero', true, false],
].map(([name, price, category, photo, available, featured], i) => ({
  id: `00000000-0000-4000-8000-${String(i + 1).padStart(12, '0')}`,
  name, price_cents: price, promo_price_cents: null, category, available, featured,
  description: 'Uma peça delicada para compor o seu estilo e acompanhar os pequenos e grandes momentos. Combine com seus acessórios favoritos.\n\nProduto fictício: fotos, preço, acabamento e disponibilidade são apenas demonstrativos. Consulte a loja para conhecer as peças reais.',
  created_at: new Date(Date.UTC(2026, 9, 30, 0, 0, 12 - i)).toISOString(), updated_at: '2026-10-30T00:00:00.000Z',
  images: [{ id: `demo-${i}`, url: `/images/${photo}.jpg`, path: null, position: 0 }],
})) as Product[];
