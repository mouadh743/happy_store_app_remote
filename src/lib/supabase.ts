import { createClient, type SupportedStorage } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { AppState, Platform } from 'react-native';

import { getSupabaseHost, supabaseAnonKey, supabaseUrl } from './config';

// Keep the admin's session (access + refresh token) in the device keychain /
// keystore rather than plain storage. Mobile only: SecureStore has no web build.
const secureStorage: SupportedStorage = {
  getItem: (key) => SecureStore.getItemAsync(key),
  setItem: (key, value) => SecureStore.setItemAsync(key, value),
  removeItem: (key) => SecureStore.deleteItemAsync(key),
};

/** False while .env is missing or still has the example values. */
export const isSupabaseConfigured = getSupabaseHost() !== null;

// createClient throws on an empty URL, which would crash the app before
// Settings can show "Not set up". Fall back to a dummy project instead: the app
// still opens, and requests fail until .env is filled in.
export const supabase = createClient(
  isSupabaseConfigured ? supabaseUrl : 'https://not-configured.supabase.co',
  isSupabaseConfigured ? supabaseAnonKey : 'not-configured',
  {
    auth: {
      // SecureStore has no web build, and `web.output: "server"` makes every
      // export (including EAS Android builds) render the routes for web in
      // Node. Calling SecureStore there crashes the build, so web falls back to
      // supabase-js's default storage (localStorage, or memory in Node).
      storage: Platform.OS === 'web' ? undefined : secureStorage,
      autoRefreshToken: true,
      persistSession: true,
      // No URL to read a session from on iOS/Android.
      detectSessionInUrl: false,
    },
  },
);

// Only refresh the token while the app is in the foreground. Background timers
// are unreliable on mobile, so restart the refresh loop when the admin returns.
AppState.addEventListener('change', (state) => {
  if (state === 'active') {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});
