import { NextRequest } from 'next/server'
import { apiSuccess, apiError } from '@/lib/api/response'
import { createClient } from '@/utils/supabase/server'
import { TenantService } from '@/lib/services/tenantService'
import { PaymentService } from '@/lib/services/paymentService'
import { createPaymentIntentSchema } from '@/lib/validation/schemas'

const tenantService = new TenantService()
const paymentService = new PaymentService()

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ tenantSlug: string }> },
) {
  const { tenantSlug } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return apiError('Unauthorized', 401)

  const tenant = await tenantService.getTenantBySlug(tenantSlug)
  if (!tenant) return apiError('Tenant not found', 404)

  const body = await request.json()
  const parsed = createPaymentIntentSchema.safeParse(body)
  if (!parsed.success) {
    return apiError(parsed.error.issues.map((i) => i.message).join(', '), 400)
  }

  try {
    const session = await paymentService.createPaymentIntent(tenant.id, {
      tenantId: tenant.id,
      enrollmentIds: parsed.data.enrollmentIds,
      amount: parsed.data.amount,
      currency: parsed.data.currency,
      successUrl: parsed.data.successUrl,
      cancelUrl: parsed.data.cancelUrl,
      customerEmail: parsed.data.customerEmail ?? user.email,
    })
    return apiSuccess(session)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Payment session creation failed'
    return apiError(message, 500)
  }
}
