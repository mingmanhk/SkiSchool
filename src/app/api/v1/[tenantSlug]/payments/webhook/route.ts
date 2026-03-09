import { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { TenantService } from '@/lib/services/tenantService'
import { PaymentService } from '@/lib/services/paymentService'

const tenantService = new TenantService()
const paymentService = new PaymentService()

// Stripe sends raw body — must not parse as JSON
export const runtime = 'nodejs'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ tenantSlug: string }> },
) {
  const { tenantSlug } = await params

  const tenant = await tenantService.getTenantBySlug(tenantSlug)
  if (!tenant) {
    // Return 200 so Stripe doesn't retry unknown tenant webhooks
    return NextResponse.json({ received: true })
  }

  const signature = request.headers.get('stripe-signature')
  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
  }

  const body = await request.arrayBuffer()
  const rawBody = Buffer.from(body)

  try {
    await paymentService.handleWebhook('stripe', tenant.id, rawBody, signature)
    return NextResponse.json({ received: true })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Webhook processing failed'
    console.error('[stripe-webhook]', message)
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
