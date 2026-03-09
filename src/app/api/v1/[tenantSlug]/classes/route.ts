import { NextRequest } from 'next/server'
import { apiSuccess, apiError } from '@/lib/api/response'
import { TenantService } from '@/lib/services/tenantService'
import { ProgramService } from '@/lib/services/programService'

const tenantService = new TenantService()
const programService = new ProgramService()

// Returns programs filtered by optional date/programId query params
// (Class occurrence scheduling is a future feature; for now returns programs)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tenantSlug: string }> },
) {
  const { tenantSlug } = await params
  const { searchParams } = new URL(request.url)
  const programId = searchParams.get('programId')

  const tenant = await tenantService.getTenantBySlug(tenantSlug)
  if (!tenant) return apiError('Tenant not found', 404)

  if (programId) {
    const program = await programService.getProgram(tenant.id, programId)
    if (!program) return apiError('Program not found', 404)
    return apiSuccess([program])
  }

  const programs = await programService.getPublicPrograms(tenant.id)
  return apiSuccess(programs)
}
