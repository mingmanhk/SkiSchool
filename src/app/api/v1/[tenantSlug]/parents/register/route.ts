import { NextRequest } from 'next/server'
import { apiSuccess, apiError } from '@/lib/api/response'
import { createClient } from '@/utils/supabase/server'
import { TenantService } from '@/lib/services/tenantService'
import { parentRegisterSchema } from '@/lib/validation/schemas'

const tenantService = new TenantService()

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ tenantSlug: string }> },
) {
  const { tenantSlug } = await params

  const tenant = await tenantService.getTenantBySlug(tenantSlug)
  if (!tenant) return apiError('Tenant not found', 404)

  const body = await request.json()
  const parsed = parentRegisterSchema.safeParse(body)
  if (!parsed.success) {
    return apiError(parsed.error.issues.map((i) => i.message).join(', '), 400)
  }

  const { email, password, firstName, lastName } = parsed.data
  const supabase = await createClient()

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name: firstName,
        last_name: lastName,
        tenant_id: tenant.id,
        role: 'parent',
      },
    },
  })

  if (authError) {
    return apiError(authError.message, 400)
  }

  return apiSuccess(
    {
      userId: authData.user?.id,
      message: 'Registration successful. Please check your email to verify your account.',
    },
    201,
  )
}
