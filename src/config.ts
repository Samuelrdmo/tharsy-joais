export const brand = {
  name: 'THARSY', signature: 'SEMI JOIAS | ACESSÓRIOS',
  // Substitua por /logo-oficial.svg quando houver um arquivo vetorial adequado.
  logoUrl: '',
  whatsapp: String(import.meta.env.VITE_WHATSAPP_NUMBER || '').replace(/\D/g, ''),
};
export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
export const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';
export const demoMode = !supabaseUrl || !supabaseKey;
