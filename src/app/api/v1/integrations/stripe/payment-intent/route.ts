import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { PaymentService } from '@/lib/services/paymentService'
import { createPaymentIntentSchema } from '@/lib/validation/schemas'

export const runtime = 'nodejs'

const paymentService = new PaymentService()

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Extract tenantSlug from x-tenant-slug header (set by middleware)
  const tenantSlug = req.headers.get('x-tenant-slug')
  if (!tenantSlug) {
    return NextResponse.json({ error: 'Tenant context required' }, { status: 400 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = createPaymentIntentSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { TenantService } = await import('@/lib/services/tenantService')
  const tenantService = new TenantService()
  const tenant = await tenantService.getTenantBySlug(tenantSlug)
  if (!tenant) {
    return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })
  }

  try {
    const intent = await paymentService.createPaymentIntent(tenant.id, {
      tenantId: tenant.id,
      amount: parsed.data.amount,
      currency: parsed.data.currency ?? 'usd',
      enrollmentIds: parsed.data.enrollmentIds,
      successUrl: parsed.data.successUrl,
      cancelUrl: parsed.data.cancelUrl,
      customerEmail: parsed.data.customerEmail ?? user.email,
    })

    return NextResponse.json({ clientSecret: intent.clientSecret })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Payment intent failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
