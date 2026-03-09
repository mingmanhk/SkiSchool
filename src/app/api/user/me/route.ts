import { NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { createClient } from '@/utils/supabase/server'
import { db } from '@/lib/db/client'
import { tenantMemberships, tenants } from '@/lib/db/schema_multi_tenant'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const rows = await db
    .select({
      tenantSlug: tenants.slug,
      tenantId: tenants.id,
      role: tenantMemberships.role,
    })
    .from(tenantMemberships)
    .innerJoin(tenants, eq(tenants.id, tenantMemberships.tenantId))
    .where(eq(tenantMemberships.userId, user.id))
    .limit(1)

  if (rows.length === 0) {
    return NextResponse.json({ error: 'No tenant membership found' }, { status: 404 })
  }

  return NextResponse.json({
    userId: user.id,
    tenantSlug: rows[0].tenantSlug,
    tenantId: rows[0].tenantId,
    role: rows[0].role,
  })
}
