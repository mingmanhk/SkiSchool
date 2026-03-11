import { NextRequest, NextResponse } from 'next/server'
import { TenantService } from '@/lib/services/tenantService'
import { MessageService } from '@/lib/services/messageService'
import { createMessageTemplateSchema, sendMessageSchema } from '@/lib/validation/schemas'
import { requireTenantAdmin } from '@/lib/utils/requireTenantAdmin'

const tenantService = new TenantService()
const messageService = new MessageService()

export async function POST(
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

  // Determine whether this is a template creation or message send by shape
  const tmplParsed = createMessageTemplateSchema.safeParse(body)
  if (tmplParsed.success) {
    const template = await messageService.createTemplate(tenant.id, tmplParsed.data, auth.userId)
    return NextResponse.json({ data: template }, { status: 201 })
  }

  const msgParsed = sendMessageSchema.safeParse(body)
  if (!msgParsed.success) {
    return NextResponse.json({ error: msgParsed.error.flatten() }, { status: 400 })
  }

  const message = await messageService.sendMessage({
    tenantId: tenant.id,
    ...msgParsed.data,
    sentBy: auth.userId,
  })
  return NextResponse.json({ data: message }, { status: 201 })
}
