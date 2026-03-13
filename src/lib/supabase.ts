import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

// Lazy initialization to prevent build-time errors
let supabaseClient: ReturnType<typeof createClient<Database>> | null = null;

function getSupabaseClient() {
  if (supabaseClient) {
    return supabaseClient;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // During build time or when env vars are missing, return a dummy client
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn(
      'Supabase environment variables not available, using fallback',
    );
    supabaseClient = createClient<Database>(
      'https://placeholder.supabase.co',
      'placeholder_key',
    );
  } else {
    supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey);
  }

  return supabaseClient;
}

export const supabase = new Proxy(
  {} as ReturnType<typeof createClient<Database>>,
  {
    get(_target, prop) {
      const client = getSupabaseClient();
      const value = client[prop as keyof typeof client];
      return typeof value === 'function' ? value.bind(client) : value;
    },
  },
);
