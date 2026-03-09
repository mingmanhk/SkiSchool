import { NextRequest, NextResponse } from 'next/server'
import { AccountingService } from '@/lib/services/accountingService'

const accountingService = new AccountingService()

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')
  const realmId = searchParams.get('realmId')
  const state = searchParams.get('state')
  const error = searchParams.get('error')

  if (error) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/admin/integrations?error=${encodeURIComponent(error)}`,
    )
  }

  if (!code || !realmId || !state) {
    return NextResponse.json({ error: 'Missing required params' }, { status: 400 })
  }

  let tenantId: string
  try {
    const decoded = JSON.parse(Buffer.from(state, 'base64url').toString())
    tenantId = decoded.tenantId
  } catch {
    return NextResponse.json({ error: 'Invalid state param' }, { status: 400 })
  }

  try {
    await accountingService.handleOAuthCallback(tenantId, code, realmId)
  } catch (err: any) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/admin/integrations?error=${encodeURIComponent(err.message)}`,
    )
  }

  return NextResponse.redirect(
    `${process.env.NEXT_PUBLIC_APP_URL}/admin/integrations?quickbooks=connected`,
  )
}
