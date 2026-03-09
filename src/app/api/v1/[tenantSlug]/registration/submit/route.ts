import { NextRequest } from 'next/server'
import { apiSuccess, apiError } from '@/lib/api/response'
import { TenantService } from '@/lib/services/tenantService'
import { RegistrationService } from '@/lib/services/registrationService'
import { newFamilyRegistrationSchema } from '@/lib/validation/schemas'

const tenantService = new TenantService()
const registrationService = new RegistrationService()

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ tenantSlug: string }> },
) {
  const { tenantSlug } = await params

  const tenant = await tenantService.getTenantBySlug(tenantSlug)
  if (!tenant) return apiError('Tenant not found', 404)

  const body = await request.json()
  const parsed = newFamilyRegistrationSchema.safeParse(body)
  if (!parsed.success) {
    return apiError(parsed.error.issues.map((i) => i.message).join(', '), 400)
  }

  const result = await registrationService.createNewFamilyRegistration({
    tenantId: tenant.id,
    email: parsed.data.email,
    familyData: {},
    parentsData: parsed.data.parents,
    studentsData: parsed.data.students,
    programIds: parsed.data.programIds,
  })

  return apiSuccess(result, 201)
}
