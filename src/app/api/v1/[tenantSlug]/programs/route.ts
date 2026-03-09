import { NextRequest } from 'next/server'
import { apiSuccess, apiError } from '@/lib/api/response'
import { TenantService } from '@/lib/services/tenantService'
import { ProgramService } from '@/lib/services/programService'
import { createProgramSchema } from '@/lib/validation/schemas'

const tenantService = new TenantService()
const programService = new ProgramService()

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tenantSlug: string }> },
) {
  const { tenantSlug } = await params

  const tenant = await tenantService.getTenantBySlug(tenantSlug)
  if (!tenant) return apiError('Tenant not found', 404)

  const programs = await programService.getPublicPrograms(tenant.id)
  return apiSuccess(programs)
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ tenantSlug: string }> },
) {
  const { tenantSlug } = await params

  const tenant = await tenantService.getTenantBySlug(tenantSlug)
  if (!tenant) return apiError('Tenant not found', 404)

  const body = await request.json()
  const parsed = createProgramSchema.safeParse(body)
  if (!parsed.success) {
    return apiError(parsed.error.issues.map((i) => i.message).join(', '), 400)
  }

  const program = await programService.createProgram(tenant.id, parsed.data)
  return apiSuccess(program, 201)
}
