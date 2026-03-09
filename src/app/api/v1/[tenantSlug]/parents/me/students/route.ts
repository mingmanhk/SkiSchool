import { NextRequest, NextResponse } from 'next/server'
import { eq, and, asc } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '@/lib/db/client'
import { parents, students } from '@/lib/db/schema_multi_tenant'
import { TenantService } from '@/lib/services/tenantService'
import { createClient } from '@/utils/supabase/server'

const tenantService = new TenantService()

const createStudentSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  birthdate: z.string().date().optional(),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']).optional(),
  notes: z.string().max(500).optional(),
})

async function resolveParent(userId: string, tenantId: string) {
  const rows = await db
    .select()
    .from(parents)
    .where(and(eq(parents.userId, userId), eq(parents.tenantId, tenantId)))
    .limit(1)
  return rows[0] ?? null
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ tenantSlug: string }> },
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { tenantSlug } = await params
  const tenant = await tenantService.getTenantBySlug(tenantSlug)
  if (!tenant) return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })

  const parent = await resolveParent(user.id, tenant.id)
  if (!parent) return NextResponse.json({ data: [] })

  const rows = await db
    .select()
    .from(students)
    .where(and(eq(students.familyId, parent.familyId), eq(students.tenantId, tenant.id)))
    .orderBy(asc(students.firstName))

  return NextResponse.json({ data: rows })
}

export async function POST(
  request: NextRequest,
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
    rawBody = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = createStudentSchema.safeParse(rawBody)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const parent = await resolveParent(user.id, tenant.id)
  if (!parent) return NextResponse.json({ error: 'Parent profile not found' }, { status: 404 })

  const result = await db
    .insert(students)
    .values({
      tenantId: tenant.id,
      familyId: parent.familyId,
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      birthdate: parsed.data.birthdate ?? null,
      gender: parsed.data.gender ?? null,
      notes: parsed.data.notes ?? null,
    })
    .returning()

  return NextResponse.json({ data: result[0] }, { status: 201 })
}
