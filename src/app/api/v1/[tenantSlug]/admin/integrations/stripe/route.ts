import { NextRequest, NextResponse } from 'next/server'
import { TenantService } from '@/lib/services/tenantService'
import { IntegrationService } from '@/lib/services/integrationService'
import { stripeConfigSchema } from '@/lib/validation/schemas'
import { createClient } from '@/utils/supabase/server'

const tenantService = new TenantService()
const integrationService = new IntegrationService()

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ tenantSlug: string }> },
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { tenantSlug } = await params
  const tenant = await tenantService.getTenantBySlug(tenantSlug)
  if (!tenant) return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })

  let body: unknown
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const parsed = stripeConfigSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  await integrationService.updateStripeConfig(tenant.id, parsed.data, user.id)
  return NextResponse.json({ success: true })
}
