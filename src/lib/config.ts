// Values from .env (see .env.example). Expo inlines EXPO_PUBLIC_* variables at
// build time, so they must be read with dot access: process.env[name] won't work.
export const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
export const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

// The values shipped in .env.example, i.e. "not filled in yet".
const PLACEHOLDER_HOST = 'your-project-ref.supabase.co';
const PLACEHOLDER_KEY = 'your-anon-key';

/** "abcd.supabase.co", or null while .env is missing or still has the example values. */
export function getSupabaseHost(): string | null {
  if (!supabaseAnonKey || supabaseAnonKey === PLACEHOLDER_KEY) return null;
  // Regex instead of `new URL()`: React Native's URL support is incomplete.
  const host = /^https?:\/\/([^/?#]+)/i.exec(supabaseUrl.trim())?.[1];
  return host && host !== PLACEHOLDER_HOST ? host : null;
}
