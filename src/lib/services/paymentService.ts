// PaymentService: Stripe/PayPal integration
import Stripe from 'stripe'
import { eq, and, inArray, SQL } from 'drizzle-orm'
import { db } from '@/lib/db/client'
import { payments, enrollments } from '@/lib/db/schema_multi_tenant'
import { Payment } from '@/types/spec'
import { IntegrationService } from './integrationService'
import { AuditService } from './auditService'
import { decrypt } from '@/lib/utils/encryption'

export interface PaymentSessionData {
  tenantId: string
  enrollmentIds: string[]
  amount: number // in smallest currency unit (cents)
  currency?: string
  successUrl: string
  cancelUrl: string
  customerEmail?: string
}

export interface PaymentSession {
  id: string
  clientSecret?: string // For Stripe PaymentIntent
  url?: string // For Stripe Checkout or PayPal
}

const integrationService = new IntegrationService()
const auditService = new AuditService()

async function getStripeClient(tenantId: string): Promise<Stripe> {
  const config = await integrationService.getStripeConfig(tenantId)
  if (!config?.secretKeyEncrypted) {
    throw new Error('Stripe is not configured for this tenant')
  }
  const secretKey = await decrypt(config.secretKeyEncrypted)
  return new Stripe(secretKey, { apiVersion: '2025-12-15.clover' })
}

export class PaymentService {
  async createPaymentIntent(
    tenantId: string,
    data: PaymentSessionData,
  ): Promise<PaymentSession> {
    const stripe = await getStripeClient(tenantId)

    const intent = await stripe.paymentIntents.create({
      amount: data.amount,
      currency: data.currency || 'usd',
      receipt_email: data.customerEmail,
      metadata: {
        tenantId,
        enrollmentIds: data.enrollmentIds.join(','),
      },
    })

    return {
      id: intent.id,
      clientSecret: intent.client_secret ?? undefined,
    }
  }

  async createCheckoutSession(
    tenantId: string,
    data: PaymentSessionData,
  ): Promise<PaymentSession> {
    const stripe = await getStripeClient(tenantId)

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: data.currency || 'usd',
            product_data: {
              name: 'Ski School Enrollment',
            },
            unit_amount: data.amount,
          },
          quantity: 1,
        },
      ],
      success_url: data.successUrl,
      cancel_url: data.cancelUrl,
      customer_email: data.customerEmail,
      metadata: {
        tenantId,
        enrollmentIds: data.enrollmentIds.join(','),
      },
    })

    return {
      id: session.id,
      url: session.url ?? undefined,
    }
  }

  async handleWebhook(
    provider: 'stripe' | 'paypal',
    tenantId: string,
    payload: Buffer | string,
    signature: string,
  ): Promise<void> {
    if (provider === 'stripe') {
      await this.handleStripeWebhook(tenantId, payload, signature)
    }
    // PayPal webhook handling can be added here
  }

  private async handleStripeWebhook(
    tenantId: string,
    payload: Buffer | string,
    signature: string,
  ): Promise<void> {
    const config = await integrationService.getStripeConfig(tenantId)
    if (!config?.webhookSecretEncrypted) {
      throw new Error('Stripe webhook secret not configured')
    }

    const stripe = await getStripeClient(tenantId)
    const webhookSecret = await decrypt(config.webhookSecretEncrypted)

    let event: Stripe.Event
    try {
      event = stripe.webhooks.constructEvent(payload, signature, webhookSecret)
    } catch (err) {
      throw new Error(`Webhook signature verification failed: ${err}`)
    }

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const intent = event.data.object as Stripe.PaymentIntent
        await this.recordPayment({
          tenantId,
          provider: 'stripe',
          providerPaymentId: intent.id,
          amount: intent.amount,
          currency: intent.currency,
          status: 'succeeded',
          rawPayload: intent as unknown as Record<string, unknown>,
          enrollmentIds: intent.metadata?.enrollmentIds?.split(',') ?? [],
        })
        break
      }
      case 'payment_intent.payment_failed': {
        const intent = event.data.object as Stripe.PaymentIntent
        await this.recordPayment({
          tenantId,
          provider: 'stripe',
          providerPaymentId: intent.id,
          amount: intent.amount,
          currency: intent.currency,
          status: 'failed',
          rawPayload: intent as unknown as Record<string, unknown>,
          enrollmentIds: [],
        })
        break
      }
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        await this.recordPayment({
          tenantId,
          provider: 'stripe',
          providerPaymentId: session.payment_intent as string,
          amount: session.amount_total ?? 0,
          currency: session.currency ?? 'usd',
          status: 'succeeded',
          rawPayload: session as unknown as Record<string, unknown>,
          enrollmentIds: session.metadata?.enrollmentIds?.split(',') ?? [],
        })
        // Update enrollment statuses to 'confirmed'
        const enrollmentIds = session.metadata?.enrollmentIds?.split(',') ?? []
        if (enrollmentIds.length > 0) {
          await this.confirmEnrollments(tenantId, enrollmentIds)
        }
        break
      }
    }
  }

  private async recordPayment(data: {
    tenantId: string
    provider: 'stripe' | 'paypal'
    providerPaymentId: string
    amount: number
    currency: string
    status: string
    rawPayload: Record<string, unknown>
    enrollmentIds: string[]
  }): Promise<void> {
    const enrollmentId = data.enrollmentIds[0] ?? null
    const result = await db.insert(payments).values({
      tenantId: data.tenantId,
      enrollmentId,
      provider: data.provider,
      providerPaymentId: data.providerPaymentId,
      amount: (data.amount / 100).toString(), // Convert cents to dollars
      currency: data.currency.toUpperCase(),
      status: data.status,
      rawPayload: data.rawPayload,
    }).returning()

    // Audit log every payment event
    await auditService.logPayment(
      data.tenantId,
      'system', // webhook — no user context
      result[0].id,
      data.provider,
      data.amount / 100,
      data.status,
    )
  }

  private async confirmEnrollments(
    tenantId: string,
    enrollmentIds: string[],
  ): Promise<void> {
    if (enrollmentIds.length === 0) return
    await db
      .update(enrollments)
      .set({ status: 'confirmed', updatedAt: new Date() })
      .where(
        and(inArray(enrollments.id, enrollmentIds), eq(enrollments.tenantId, tenantId)),
      )
  }

  async getPayment(tenantId: string, paymentId: string): Promise<Payment | null> {
    const results = await db
      .select()
      .from(payments)
      .where(and(eq(payments.id, paymentId), eq(payments.tenantId, tenantId)))
      .limit(1)

    if (results.length === 0) return null

    const row = results[0]
    return {
      id: row.id,
      tenantId: row.tenantId,
      enrollmentId: row.enrollmentId ?? undefined,
      provider: row.provider as 'stripe' | 'paypal',
      providerPaymentId: row.providerPaymentId ?? undefined,
      amount: Number(row.amount),
      currency: row.currency,
      status: row.status,
      rawPayload: (row.rawPayload as Record<string, unknown>) ?? undefined,
      createdAt: row.createdAt.toISOString(),
    }
  }

  async listPayments(
    tenantId: string,
    filters?: { enrollmentId?: string; status?: string },
  ): Promise<Payment[]> {
    const conditions: SQL[] = [eq(payments.tenantId, tenantId)]

    if (filters?.enrollmentId) {
      conditions.push(eq(payments.enrollmentId, filters.enrollmentId))
    }
    if (filters?.status) {
      conditions.push(eq(payments.status, filters.status))
    }

    const results = await db
      .select()
      .from(payments)
      .where(and(...conditions))

    return results.map((row) => ({
      id: row.id,
      tenantId: row.tenantId,
      enrollmentId: row.enrollmentId ?? undefined,
      provider: row.provider as 'stripe' | 'paypal',
      providerPaymentId: row.providerPaymentId ?? undefined,
      amount: Number(row.amount),
      currency: row.currency,
      status: row.status,
      rawPayload: (row.rawPayload as Record<string, unknown>) ?? undefined,
      createdAt: row.createdAt.toISOString(),
    }))
  }
}
