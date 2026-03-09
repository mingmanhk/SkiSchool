import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/utils/supabase/server'
import { TenantService } from '@/lib/services/tenantService'
import { PaymentService } from '@/lib/services/paymentService'

const tenantService = new TenantService()
const paymentService = new PaymentService()

const checkoutSchema = z.object({
  enrollmentIds: z.array(z.string().uuid()).min(1),
  amount: z.number().int().min(50),
  currency: z.string().length(3).default('usd'),
  successUrl: z.string().url(),
  cancelUrl: z.string().url(),
})

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

  const parsed = checkoutSchema.safeParse(rawBody)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  try {
    const session = await paymentService.createCheckoutSession(tenant.id, {
      tenantId: tenant.id,
      enrollmentIds: parsed.data.enrollmentIds,
      amount: parsed.data.amount,
      currency: parsed.data.currency,
      successUrl: parsed.data.successUrl,
      cancelUrl: parsed.data.cancelUrl,
      customerEmail: user.email,
    })
    return NextResponse.json({ url: session.url })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Checkout failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
