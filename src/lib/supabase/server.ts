// src/lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { env } from '@/lib/env';

/**
 * Creates a Supabase client for use in server components, API routes, and Server Actions.
 *
 * This client is configured with cookie handling to manage user sessions automatically.
 * It uses the anonymous key and respects RLS policies.
 *
 * @returns {Promise<SupabaseClient>} An instance of the Supabase client.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
}

/**
 * Creates a Supabase ADMIN client for use in secure server-side operations ONLY.
 *
 * WARNING: This client bypasses Row Level Security (RLS).
 * It should ONLY be used for administrative tasks that require elevated privileges,
 * such as managing tenant settings, creating users, or background jobs.
 *
 * NEVER expose this client or the service role key to the client-side.
 *
 * @returns {SupabaseClient} An instance of the Supabase admin client.
 */
export function createAdminClient() {
  return createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
    {
      cookies: {
        getAll() {
          return [];
        },
        setAll(cookiesToSet) {
          // No-op for admin client
        },
      },
    }
  );
}
