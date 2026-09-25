import { createClient, SupabaseClient } from '@supabase/supabase-js';

const STORAGE_KEY_URL = 'ciclotreino_supabase_url';
const STORAGE_KEY_KEY = 'ciclotreino_supabase_key';

export const DEFAULT_SUPABASE_URL = 'https://vvnnxzhcwwjktraxumrp.supabase.co';
export const DEFAULT_SUPABASE_KEY = 'sb_publishable_ayfc3u1D9ThxSCswvqGmrw_gdj6GKTl';

let cachedClient: SupabaseClient | null = null;
let currentUrl: string | null = null;
let currentKey: string | null = null;

export function getSupabaseCredentials(): { url: string; anonKey: string } {
  const envUrl = (import.meta.env.VITE_SUPABASE_URL as string) || DEFAULT_SUPABASE_URL;
  const envKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || DEFAULT_SUPABASE_KEY;

  const storedUrl = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY_URL) : null;
  const storedKey = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY_KEY) : null;

  const url = (storedUrl && storedUrl.trim().length > 0) ? storedUrl.trim() : envUrl;
  const anonKey = (storedKey && storedKey.trim().length > 0) ? storedKey.trim() : envKey;

  return {
    url,
    anonKey,
  };
}

export function isSupabaseConfigured(): boolean {
  const { url, anonKey } = getSupabaseCredentials();
  return Boolean(url && anonKey && url.startsWith('http') && anonKey.length > 15);
}

export function getSupabaseClient(): SupabaseClient | null {
  const { url, anonKey } = getSupabaseCredentials();

  if (!url || !anonKey || !url.startsWith('http')) {
    return null;
  }

  if (cachedClient && currentUrl === url && currentKey === anonKey) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
    currentUrl = url;
    currentKey = anonKey;
    return cachedClient;
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err);
    return null;
  }
}

export function saveSupabaseCredentials(url: string, anonKey: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_URL, url.trim());
    localStorage.setItem(STORAGE_KEY_KEY, anonKey.trim());
    cachedClient = null; // force re-instantiation
  }
}

export function clearSupabaseCredentials() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY_URL);
    localStorage.removeItem(STORAGE_KEY_KEY);
    cachedClient = null;
  }
}

export async function testSupabaseConnection(url: string, anonKey: string): Promise<{ success: boolean; message: string }> {
  try {
    if (!url.startsWith('http')) {
      return { success: false, message: 'URL do Supabase inválida. Deve iniciar com https://' };
    }
    const testClient = createClient(url, anonKey);
    const { error } = await testClient.from('profiles').select('id').limit(1);
    if (error && error.code !== 'PGRST116') {
      // 42P01: relation "profiles" does not exist yet
      if (error.code === '42P01') {
        return {
          success: true,
          message: 'Conexão estabelecida com sucesso! Lembre-se de executar o Script SQL no SQL Editor do Supabase para criar as tabelas.',
        };
      }
      // Check auth service
      const authRes = await testClient.auth.getSession().catch(() => null);
      if (authRes) {
        return {
          success: true,
          message: 'Conexão estabelecida com sucesso! Execute o Script SQL no Supabase para inicializar as tabelas.',
        };
      }
      return { success: false, message: `Erro ao conectar: ${error.message}` };
    }
    return { success: true, message: 'Conexão com o Supabase testada com sucesso!' };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { success: false, message: `Falha na requisição: ${msg}` };
  }
}
