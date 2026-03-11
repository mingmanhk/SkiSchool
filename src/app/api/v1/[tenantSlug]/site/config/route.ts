import { NextRequest, NextResponse } from 'next/server'
import { TenantService } from '@/lib/services/tenantService'
import { SiteBuilderService } from '@/lib/services/siteBuilderService'
import { updateSiteConfigSchema } from '@/lib/validation/schemas'
import { requireTenantAdmin } from '@/lib/utils/requireTenantAdmin'

const tenantService = new TenantService()
const siteBuilderService = new SiteBuilderService()

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ tenantSlug: string }> },
) {
  const { tenantSlug } = await params
  const tenant = await tenantService.getTenantBySlug(tenantSlug)
  if (!tenant) return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })

  const config = await siteBuilderService.getSiteConfig(tenant.id)
  return NextResponse.json({ data: config })
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ tenantSlug: string }> },
) {
  const { tenantSlug } = await params
  const tenant = await tenantService.getTenantBySlug(tenantSlug)
  if (!tenant) return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })

  const auth = await requireTenantAdmin(tenant.id)
  if (!auth.ok) return auth.response

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = updateSiteConfigSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const config = await siteBuilderService.updateSiteConfig(tenant.id, parsed.data, auth.userId)
  return NextResponse.json({ data: config })
}
