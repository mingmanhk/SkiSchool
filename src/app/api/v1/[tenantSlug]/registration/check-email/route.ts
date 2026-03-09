import { NextRequest } from 'next/server'
import { apiSuccess, apiError } from '@/lib/api/response'
import { TenantService } from '@/lib/services/tenantService'
import { RegistrationService } from '@/lib/services/registrationService'
import { checkEmailSchema } from '@/lib/validation/schemas'

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
  const parsed = checkEmailSchema.safeParse(body)
  if (!parsed.success) {
    return apiError(parsed.error.issues.map((i) => i.message).join(', '), 400)
  }

  const classification = await registrationService.classifyEmail(
    tenant.id,
    parsed.data.email,
  )

  return apiSuccess({ classification, email: parsed.data.email })
}
