import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.warn('Supabase URL or Key is missing. Client functions may fail.')
    // Return a dummy client or throw? Better to return a client that might fail later or throw now?
    // For "crash proof", let's return a dummy if missing, but logging the warning is essential.
    // However, createBrowserClient might throw if valid inputs aren't provided.
    // Let's provide empty strings if missing to avoid crash, but functionality will break.
    return createBrowserClient(supabaseUrl || '', supabaseKey || '')
  }

  return createBrowserClient(supabaseUrl, supabaseKey)
}
