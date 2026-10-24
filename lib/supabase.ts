// ✅ SUPABASE OPCIONAL - No crashea si faltan las variables de entorno
let supabaseClient: any = null;

try {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (supabaseUrl && supabaseAnonKey && supabaseUrl !== 'undefined' && supabaseAnonKey !== 'undefined') {
    const { createClient } = require('@supabase/supabase-js');
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
    console.log('✅ Supabase configurado correctamente');
  } else {
    console.log('ℹ️ Supabase no configurado - usando modo local');
  }
} catch (error) {
  console.log('ℹ️ Supabase no disponible - usando modo local');
}

export const supabase = supabaseClient;

export function isSupabaseConfigured(): boolean {
  return supabaseClient !== null;
}