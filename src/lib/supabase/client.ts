// src/lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr';
import { env } from '@/lib/env';

/**
 * Creates a Supabase client for use in browser components.
 *
 * This client is configured with the public Supabase URL and anonymous key,
 * which are safe to expose in a browser environment.
 *
 * @returns {SupabaseClient} An instance of the Supabase client.
 */
export function createClient() {
  return createBrowserClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}
