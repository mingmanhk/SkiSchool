import { NextRequest, NextResponse } from 'next/server'
import { eq, and } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '@/lib/db/client'
import { enrollments } from '@/lib/db/schema_multi_tenant'
import { TenantService } from '@/lib/services/tenantService'
import { createClient } from '@/utils/supabase/server'

const tenantService = new TenantService()

const patchBodySchema = z.object({
  enrollmentId: z.string().uuid(),
  status: z.enum(['pending', 'confirmed', 'cancelled', 'waitlisted']),
})

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ tenantSlug: string }> },
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { tenantSlug } = await params
  const tenant = await tenantService.getTenantBySlug(tenantSlug)
  if (!tenant) return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })

  const url = new URL(req.url)
  const limit = Math.min(parseInt(url.searchParams.get('limit') ?? '50'), 200)
  const offset = parseInt(url.searchParams.get('offset') ?? '0')

  const rows = await db
    .select()
    .from(enrollments)
    .where(eq(enrollments.tenantId, tenant.id))
    .limit(limit)
    .offset(offset)

  return NextResponse.json({ data: rows, limit, offset })
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ tenantSlug: string }> },
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { tenantSlug } = await params
  const tenant = await tenantService.getTenantBySlug(tenantSlug)
  if (!tenant) return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })

  let rawBody: unknown
  try {
    rawBody = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = patchBodySchema.safeParse(rawBody)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { enrollmentId, status } = parsed.data

  const result = await db
    .update(enrollments)
    .set({ status, updatedAt: new Date() })
    .where(and(eq(enrollments.id, enrollmentId), eq(enrollments.tenantId, tenant.id)))
    .returning()

  if (result.length === 0) {
    return NextResponse.json({ error: 'Enrollment not found' }, { status: 404 })
  }

  return NextResponse.json({ data: result[0] })
}
