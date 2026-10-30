export const brand = {
  name: 'THARSY', signature: 'SEMI JOIAS | ACESSÓRIOS',
  // Substitua por /logo-oficial.svg quando houver um arquivo vetorial adequado.
  logoUrl: '',
  // Contatos da loja. As variáveis VITE_* substituem estes valores quando definidas.
  instagram: String(import.meta.env.VITE_INSTAGRAM_URL || 'https://www.instagram.com/tharsysemijoias_acessorios/').trim(),
  whatsapp: String(import.meta.env.VITE_WHATSAPP_NUMBER || '553498989736').replace(/\D/g, ''),
};
export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
export const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';
export const demoMode = !supabaseUrl || !supabaseKey;
