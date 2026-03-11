import { eq, and } from 'drizzle-orm'
import { db } from '@/lib/db/client'
import { tenantMemberships } from '@/lib/db/schema_multi_tenant'
import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

type AdminCheckResult =
  | { ok: true; userId: string }
  | { ok: false; response: NextResponse }

/**
 * Verifies the request carries a valid Supabase session AND the authenticated
 * user has a `tenant_admin` membership for the given tenantId.
 *
 * Returns either { ok: true, userId } or { ok: false, response } so callers
 * can return the error response immediately.
 */
export async function requireTenantAdmin(tenantId: string): Promise<AdminCheckResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    }
  }

  const [membership] = await db
    .select({ id: tenantMemberships.id })
    .from(tenantMemberships)
    .where(
      and(
        eq(tenantMemberships.tenantId, tenantId),
        eq(tenantMemberships.userId, user.id),
        eq(tenantMemberships.role, 'tenant_admin'),
      ),
    )
    .limit(1)

  if (!membership) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }),
    }
  }

  return { ok: true, userId: user.id }
}
