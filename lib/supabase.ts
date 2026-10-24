import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// ✅ CLIENTE OPCIONAL: Solo se crea si las variables están configuradas
export const supabase: SupabaseClient | null = 
  supabaseUrl && supabaseAnonKey 
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

// ✅ FUNCIÓN HELPER: Verifica si Supabase está disponible
export function isSupabaseConfigured(): boolean {
  return supabase !== null;
}

// ✅ FUNCIÓN HELPER: Fallback a localStorage si Supabase no está configurado
export async function saveToStorage(key: string, data: any): Promise<void> {
  if (supabase) {
    try {
      const { error } = await supabase
        .from('app_data')
        .upsert({ key, data, updated_at: new Date().toISOString() });
      if (error) console.error('Supabase save error:', error);
    } catch (e) {
      console.error('Supabase connection error, using localStorage:', e);
      localStorage.setItem(key, JSON.stringify(data));
    }
  } else {
    localStorage.setItem(key, JSON.stringify(data));
  }
}

export async function loadFromStorage(key: string): Promise<any> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('app_data')
        .select('data')
        .eq('key', key)
        .single();
      
      if (!error && data) return data.data;
    } catch (e) {
      console.error('Supabase load error, using localStorage:', e);
    }
  }
  
  // Fallback a localStorage
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : null;
}