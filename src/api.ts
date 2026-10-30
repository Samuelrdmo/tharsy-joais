import { createClient } from '@supabase/supabase-js';
import { demoMode, supabaseKey, supabaseUrl } from './config';
import { demoProducts } from './demo';
import { DEFAULT_CATEGORIES, PAGE_SIZE, filterProducts, sameCategory } from './domain';
import type { Product, ProductImage, Filters } from './domain';
import { blobDataUrl } from './images';
import { resolveAdminIdentity } from './admin-login';
export const supabase = demoMode ? null : createClient(supabaseUrl, supabaseKey);
const DEMO_KEY = 'tharsy-demo-products-v1';
const DEMO_CATEGORIES_KEY = 'tharsy-demo-categories-v1';
const select = '*,images:product_images(id,url,path,position)';
function readDemo(): Product[] {
  const saved = localStorage.getItem(DEMO_KEY);
  if (!saved) return structuredClone(demoProducts);
  try { return JSON.parse(saved); } catch { throw new Error('Os dados da demonstração estão corrompidos. Use “Restaurar demonstração” no painel.'); }
}
function storeDemo(products: Product[]) {
  try { localStorage.setItem(DEMO_KEY, JSON.stringify(products)); }
  catch { throw new Error('O armazenamento deste navegador está cheio ou indisponível. Remova algumas fotos e tente novamente. Seu formulário foi preservado.'); }
}
const mapProduct = (p: Product): Product => ({ ...p, images: [...p.images].sort((a, b) => a.position - b.position) });
// Memória curta da vitrine: voltar de uma peça ou de uma página não consulta o banco de novo.
const CACHE_MS = 5 * 60 * 1000;
const listCache = new Map<string, { at: number; value: { products: Product[]; count: number } }>();
const productCache = new Map<string, { at: number; value: Product }>();
const fresh = (at: number) => Date.now() - at < CACHE_MS;
function rememberProducts(products: Product[]) { const at = Date.now(); for (const p of products) productCache.set(p.id, { at, value: p }); }
/** Esquece tudo; usado ao salvar/excluir e ao abrir o painel, que sempre mostra dados atuais. */
export function clearCatalogCache() { listCache.clear(); productCache.clear(); }
/** Peça já carregada recentemente (lista ou detalhe), para abrir a página na hora. */
export function peekProduct(id: string): Product | undefined { const hit = productCache.get(id); return hit && fresh(hit.at) ? hit.value : undefined; }
export async function listProducts(filters: Filters, page: number, signal?: AbortSignal): Promise<{ products: Product[]; count: number }> {
  if (!supabase) { const all = filterProducts(readDemo(), filters); return { products: all.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE), count: all.length }; }
  const key = JSON.stringify([filters, page]); const hit = listCache.get(key);
  if (hit && fresh(hit.at)) return hit.value;
  let query = supabase.from('products').select(select, { count: 'exact' });
  if (filters.search) query = query.ilike('name', `%${filters.search.replace(/[%_\\]/g, '\\$&')}%`);
  if (filters.category) query = query.eq('category', filters.category);
  if (filters.available) query = query.eq('available', true);
  if (filters.sort === 'featured') query = query.order('featured', { ascending: false });
  if (filters.sort.startsWith('price')) query = query.order('final_price_cents', { ascending: filters.sort === 'price-asc' });
  query = query.order('created_at', { ascending: false }).order('id').range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);
  if (signal) query = query.abortSignal(signal);
  const { data, error, count } = await query; if (error) throw new Error('Não foi possível carregar as peças. Verifique a conexão e tente novamente.');
  const value = { products: (data as Product[]).map(mapProduct), count: count ?? 0 };
  if (listCache.size > 50) listCache.clear();
  listCache.set(key, { at: Date.now(), value }); rememberProducts(value.products);
  return value;
}
export async function getProduct(id: string): Promise<Product | null> {
  if (!supabase) return readDemo().find(p => p.id === id) || null;
  const { data, error } = await supabase.from('products').select(select).eq('id', id).maybeSingle();
  if (error) throw new Error('Não foi possível abrir esta peça. Tente novamente.');
  if (!data) { productCache.delete(id); return null; }
  const product = mapProduct(data as Product); rememberProducts([product]); return product;
}
export async function isAdmin(): Promise<boolean> {
  if (!supabase) return sessionStorage.getItem('tharsy-demo-admin') === 'true';
  const { data, error } = await supabase.rpc('is_admin'); if (error) throw new Error('Não foi possível verificar sua autorização.'); return data === true;
}
/** Há uma sessão salva neste navegador? Lê só o armazenamento local, sem chamar o servidor. */
export async function hasSession(): Promise<boolean> {
  if (!supabase) return sessionStorage.getItem('tharsy-demo-admin') === 'true';
  const { data } = await supabase.auth.getSession(); return !!data.session;
}
export async function login(username: string, password: string) {
  if (!supabase) throw new Error('O Supabase ainda não foi conectado. Use o painel demonstrativo.');
  const email = resolveAdminIdentity(username);
  if (!email) throw new Error('Usuário ou senha incorretos, ou acesso indisponível.');
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error('Usuário ou senha incorretos, ou acesso indisponível.');
  if (!await isAdmin()) { await supabase.auth.signOut(); throw new Error('Esta conta não está autorizada a administrar a loja.'); }
}
export async function logout() {
  if (supabase) { const { error } = await supabase.auth.signOut(); if (error) throw new Error('Não foi possível sair. Tente novamente.'); }
  sessionStorage.removeItem('tharsy-demo-admin');
}
export async function cleanupPhotos(): Promise<boolean> {
  if (!supabase) return true;
  const { data, error } = await supabase.from('storage_cleanup').select('path').limit(100);
  if (error) return false;
  if (!data.length) return true;
  const paths = data.map(p => p.path as string);
  const { error: storageError } = await supabase.storage.from('product-photos').remove(paths);
  if (storageError) return false;
  const { error: deleteError } = await supabase.from('storage_cleanup').delete().in('path', paths);
  return !deleteError;
}
export type SavePhoto = ProductImage & { blob?: Blob };
export async function saveProduct(product: Product, photos: SavePhoto[], onProgress: (text: string) => void): Promise<{ cleanupPending: boolean }> {
  clearCatalogCache();
  if (!supabase) {
    const images = await Promise.all(photos.map(async (p, i) => ({ id: p.id, url: p.blob ? await blobDataUrl(p.blob) : p.url, path: null, position: i })));
    const items = readDemo(); const previous = items.findIndex(p => p.id === product.id);
    const saved = { ...product, images, updated_at: new Date().toISOString() };
    if (previous >= 0) items[previous] = saved; else items.unshift(saved); storeDemo(items); return { cleanupPending: false };
  }
  const { data: { user } } = await supabase.auth.getUser(); if (!user) throw new Error('Sua sessão expirou. Entre novamente.');
  const uploaded: string[] = [];
  try {
    const images: ProductImage[] = [];
    for (const [i, photo] of photos.entries()) {
      let path = photo.path; let url = photo.url;
      if (photo.blob) {
        onProgress(`Enviando foto ${i + 1} de ${photos.length}…`);
        path = `${user.id}/${product.id}/${crypto.randomUUID()}.${photo.blob.type === 'image/webp' ? 'webp' : 'jpg'}`;
        // A fila persistente permite recuperar falhas de rede antes de confirmar o produto.
        const { error: queueError } = await supabase.from('storage_cleanup').insert({ path });
        if (queueError) throw new Error('Não foi possível preparar o envio das fotos.');
        const { error } = await supabase.storage.from('product-photos').upload(path, photo.blob, { contentType: photo.blob.type, upsert: false, cacheControl: '31536000' });
        uploaded.push(path); if (error) throw new Error('Falha ao enviar uma foto. Seus dados continuam no formulário.');
        url = supabase.storage.from('product-photos').getPublicUrl(path).data.publicUrl;
      }
      images.push({ id: photo.id, url, path, position: i });
    }
    onProgress('Salvando produto…');
    const { error } = await supabase.rpc('save_product', { p_product: { ...product, images } });
    if (error) {
      // Não removemos arquivos se a resposta de commit for ambígua. A fila é filtrada no banco
      // para conter somente arquivos não referenciados, e é reprocessada pelo painel.
      throw new Error(error.message.includes('conflito') ? 'Esta peça foi alterada em outra sessão. Reabra a edição antes de salvar.' : 'Não foi possível confirmar o salvamento. Seus dados foram preservados; confira o catálogo antes de tentar novamente.');
    }
    return { cleanupPending: !await cleanupPhotos() };
  } catch (error) {
    // As entradas já estão na fila. A limpeza ignora caminhos vinculados a produtos.
    if (uploaded.length) await cleanupPhotos();
    throw error;
  }
}
export async function deleteProduct(product: Product) {
  clearCatalogCache();
  if (!supabase) { storeDemo(readDemo().filter(p => p.id !== product.id)); return { cleanupPending: false }; }
  const { error } = await supabase.rpc('delete_product', { p_id: product.id, p_updated_at: product.updated_at });
  if (error) throw new Error('Não foi possível excluir. A peça pode ter sido alterada; atualize a lista e tente novamente.');
  return { cleanupPending: !await cleanupPhotos() };
}
export function resetDemo() { localStorage.removeItem(DEMO_KEY); localStorage.removeItem(DEMO_CATEGORIES_KEY); }
function readDemoCategories(): string[] {
  try { const saved = localStorage.getItem(DEMO_CATEGORIES_KEY); return saved ? JSON.parse(saved) : [...DEFAULT_CATEGORIES]; } catch { return [...DEFAULT_CATEGORIES]; }
}
function storeDemoCategories(categories: string[]) {
  try { localStorage.setItem(DEMO_CATEGORIES_KEY, JSON.stringify(categories)); }
  catch { throw new Error('O armazenamento deste navegador está cheio ou indisponível.'); }
}
const inUse = (count: number) => new Error(`Esta categoria tem ${count} ${count === 1 ? 'peça' : 'peças'}. Mude a categoria ${count === 1 ? 'dela' : 'delas'} antes de excluir.`);
export async function listCategories(): Promise<string[]> {
  if (!supabase) return readDemoCategories();
  const { data, error } = await supabase.from('categories').select('name').order('created_at').order('name');
  if (error) throw new Error('Não foi possível carregar as categorias. Verifique a conexão e tente novamente.');
  return data.map(c => c.name as string);
}
/** Recebe um nome já normalizado (categoryName). */
export async function createCategory(name: string): Promise<string> {
  if (!supabase) {
    const categories = readDemoCategories();
    if (categories.some(c => sameCategory(c, name))) throw new Error('Essa categoria já existe.');
    storeDemoCategories([...categories, name]); return name;
  }
  const { error } = await supabase.from('categories').insert({ name });
  if (error) throw new Error(error.code === '23505' ? 'Essa categoria já existe.' : 'Não foi possível criar a categoria. Tente novamente.');
  return name;
}
export async function deleteCategory(name: string) {
  if (!supabase) {
    const used = readDemo().filter(p => p.category === name).length; if (used) throw inUse(used);
    storeDemoCategories(readDemoCategories().filter(c => c !== name)); return;
  }
  const { count, error: countError } = await supabase.from('products').select('id', { count: 'exact', head: true }).eq('category', name);
  if (countError) throw new Error('Não foi possível verificar as peças desta categoria. Tente novamente.');
  if (count) throw inUse(count);
  const { error } = await supabase.from('categories').delete().eq('name', name);
  // 23503: uma peça entrou na categoria entre a contagem e a exclusão.
  if (error) throw new Error(error.code === '23503' ? 'Esta categoria ainda tem peças. Mude a categoria delas antes de excluir.' : 'Não foi possível excluir a categoria. Tente novamente.');
}
