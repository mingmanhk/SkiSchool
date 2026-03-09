import { NextRequest, NextResponse } from 'next/server'
import { TenantService } from '@/lib/services/tenantService'
import { IntegrationService } from '@/lib/services/integrationService'
import { AccountingService } from '@/lib/services/accountingService'
import { createClient } from '@/utils/supabase/server'
import { z } from 'zod'

const tenantService = new TenantService()
const integrationService = new IntegrationService()
const accountingService = new AccountingService()

const qbCredentialsSchema = z.object({
  clientId: z.string().min(1),
  clientSecret: z.string().min(1),
})

/** Save QB credentials */
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

  const parsed = qbCredentialsSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  await integrationService.updateQuickBooksConfig(tenant.id, parsed.data, user.id)
  return NextResponse.json({ success: true })
}

/** Initiate OAuth flow */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ tenantSlug: string }> },
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { tenantSlug } = await params
  const tenant = await tenantService.getTenantBySlug(tenantSlug)
  if (!tenant) return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })

  try {
    const { authUrl } = await accountingService.initiateOAuth(tenant.id)
    return NextResponse.json({ authUrl })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'OAuth initiation failed'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
