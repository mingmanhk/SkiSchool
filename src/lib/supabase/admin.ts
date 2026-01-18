
import { createClient } from '@supabase/supabase-js'

// Use a dedicated service client for webhooks and backend admin tasks
// WARNING: This bypasses RLS! Use with extreme caution.
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://example.com',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'dummy'
)
