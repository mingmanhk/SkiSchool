// AccountingService: QuickBooks OAuth and sync
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db/client'
import { enrollments, programs, payments } from '@/lib/db/schema_multi_tenant'
import { IntegrationService } from './integrationService'
import { decrypt } from '@/lib/utils/encryption'
import { AuditService } from './auditService'

const QB_OAUTH_BASE = 'https://appcenter.intuit.com/connect/oauth2'
const QB_TOKEN_URL = 'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer'
const QB_API_BASE = 'https://quickbooks.api.intuit.com/v3/company'
const QB_SCOPES = 'com.intuit.quickbooks.accounting'

const integrationService = new IntegrationService()
const auditService = new AuditService()

export class AccountingService {
  async initiateOAuth(tenantId: string): Promise<{ authUrl: string }> {
    const config = await integrationService.getQuickBooksConfig(tenantId)
    if (!config?.clientIdEncrypted) {
      throw new Error('QuickBooks clientId not configured')
    }
    const clientId = await decrypt(config.clientIdEncrypted)
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/v1/accounting/quickbooks/callback`
    const state = Buffer.from(JSON.stringify({ tenantId })).toString('base64url')

    const params = new URLSearchParams({
      client_id: clientId,
      scope: QB_SCOPES,
      redirect_uri: redirectUri,
      response_type: 'code',
      state,
    })

    return { authUrl: `${QB_OAUTH_BASE}?${params.toString()}` }
  }

  async handleOAuthCallback(tenantId: string, code: string, realmId: string): Promise<void> {
    const config = await integrationService.getQuickBooksConfig(tenantId)
    if (!config?.clientIdEncrypted || !config?.clientSecretEncrypted) {
      throw new Error('QuickBooks credentials not configured')
    }

    const clientId = await decrypt(config.clientIdEncrypted)
    const clientSecret = await decrypt(config.clientSecretEncrypted)
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/v1/accounting/quickbooks/callback`
    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')

    const response = await fetch(QB_TOKEN_URL, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
      }),
    })

    if (!response.ok) {
      const text = await response.text()
      throw new Error(`QuickBooks token exchange failed: ${text}`)
    }

    const tokens = await response.json() as { refresh_token: string; access_token: string }

    // Persist refresh token + realmId via IntegrationService (encrypted)
    await integrationService.updateQuickBooksConfig(
      tenantId,
      {
        clientId, // already plaintext
        clientSecret,
        refreshToken: tokens.refresh_token,
        realmId,
      },
      'system',
    )
  }

  async refreshAccessToken(tenantId: string): Promise<string> {
    const config = await integrationService.getQuickBooksConfig(tenantId)
    if (!config?.clientIdEncrypted || !config?.clientSecretEncrypted || !config?.refreshTokenEncrypted) {
      throw new Error('QuickBooks credentials incomplete')
    }

    const clientId = await decrypt(config.clientIdEncrypted)
    const clientSecret = await decrypt(config.clientSecretEncrypted)
    const refreshToken = await decrypt(config.refreshTokenEncrypted)
    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')

    const response = await fetch(QB_TOKEN_URL, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }),
    })

    if (!response.ok) {
      const text = await response.text()
      throw new Error(`QuickBooks token refresh failed: ${text}`)
    }

    const tokens = await response.json() as { access_token: string; refresh_token?: string }

    // If a new refresh token is issued, persist it
    if (tokens.refresh_token) {
      await integrationService.updateQuickBooksConfig(
        tenantId,
        { clientId, clientSecret, refreshToken: tokens.refresh_token, realmId: config.realmId },
        'system',
      )
    }

    return tokens.access_token
  }

  async syncEnrollmentToQuickBooks(tenantId: string, enrollmentId: string): Promise<void> {
    const config = await integrationService.getQuickBooksConfig(tenantId)
    if (!config?.realmId) throw new Error('QuickBooks realmId not configured')

    const rows = await db
      .select({
        id: enrollments.id,
        studentId: enrollments.studentId,
        programId: enrollments.programId,
        price: programs.price,
      })
      .from(enrollments)
      .leftJoin(programs, eq(enrollments.programId, programs.id))
      .where(eq(enrollments.id, enrollmentId))
      .limit(1)

    if (rows.length === 0) throw new Error('Enrollment not found')
    const enrollment = rows[0]

    const accessToken = await this.refreshAccessToken(tenantId)
    const amount = enrollment.price ? parseFloat(enrollment.price).toFixed(2) : '0.00'

    const invoice = {
      Line: [
        {
          Amount: parseFloat(amount),
          DetailType: 'SalesItemLineDetail',
          SalesItemLineDetail: {
            ItemRef: { value: '1', name: 'Services' },
            UnitPrice: parseFloat(amount),
            Qty: 1,
          },
        },
      ],
      CustomerRef: { value: enrollment.studentId },
    }

    const res = await fetch(`${QB_API_BASE}/${config.realmId}/invoice`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ Invoice: invoice }),
    })

    if (!res.ok) {
      const text = await res.text()
      throw new Error(`QuickBooks invoice creation failed: ${text}`)
    }

    await auditService.log({
      tenantId,
      userId: 'system',
      action: 'quickbooks.invoice.created',
      resourceType: 'enrollment',
      resourceId: enrollmentId,
    })
  }

  async syncPaymentToQuickBooks(tenantId: string, paymentId: string): Promise<void> {
    const config = await integrationService.getQuickBooksConfig(tenantId)
    if (!config?.realmId) throw new Error('QuickBooks realmId not configured')

    const rows = await db
      .select()
      .from(payments)
      .where(eq(payments.id, paymentId))
      .limit(1)

    if (rows.length === 0) throw new Error('Payment not found')
    const payment = rows[0]

    const accessToken = await this.refreshAccessToken(tenantId)
    const amount = ((payment.amountCents as number) / 100).toFixed(2)

    const qbPayment = {
      TotalAmt: parseFloat(amount),
      CustomerRef: { value: payment.familyId },
    }

    const res = await fetch(`${QB_API_BASE}/${config.realmId}/payment`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ Payment: qbPayment }),
    })

    if (!res.ok) {
      const text = await res.text()
      throw new Error(`QuickBooks payment sync failed: ${text}`)
    }

    await auditService.log({
      tenantId,
      userId: 'system',
      action: 'quickbooks.payment.synced',
      resourceType: 'payment',
      resourceId: paymentId,
    })
  }
}
