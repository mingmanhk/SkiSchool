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
  // During build, env vars might be missing. Provide fallbacks to prevent build failure.
  const url = env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const key = env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';

  return createBrowserClient(url, key);
}
