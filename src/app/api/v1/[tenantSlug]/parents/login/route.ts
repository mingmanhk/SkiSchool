import { NextRequest } from 'next/server'
import { apiSuccess, apiError } from '@/lib/api/response'
import { createClient } from '@/utils/supabase/server'
import { TenantService } from '@/lib/services/tenantService'
import { parentLoginSchema } from '@/lib/validation/schemas'

const tenantService = new TenantService()

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ tenantSlug: string }> },
) {
  const { tenantSlug } = await params

  const tenant = await tenantService.getTenantBySlug(tenantSlug)
  if (!tenant) return apiError('Tenant not found', 404)

  const body = await request.json()
  const parsed = parentLoginSchema.safeParse(body)
  if (!parsed.success) {
    return apiError(parsed.error.issues.map((i) => i.message).join(', '), 400)
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  })

  if (error) {
    return apiError('Invalid email or password', 401)
  }

  return apiSuccess({
    accessToken: data.session?.access_token,
    userId: data.user?.id,
    email: data.user?.email,
  })
}
