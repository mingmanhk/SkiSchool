import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/db/client', () => ({
  db: { select: vi.fn(), insert: vi.fn(), update: vi.fn() },
  schema: {},
}))

vi.mock('@/lib/services/integrationService', () => ({
  IntegrationService: vi.fn().mockImplementation(function (this: any) {
    this.getStripeConfig = vi.fn().mockResolvedValue({
      publishableKey: 'pk_test_xxx',
      secretKeyEncrypted: 'encrypted-secret',
    })
    this.getStripeSecretKey = vi.fn().mockResolvedValue('sk_test_xxx')
  }),
}))

vi.mock('@/lib/services/auditService', () => ({
  AuditService: vi.fn().mockImplementation(function (this: any) {
    this.log = vi.fn().mockResolvedValue(undefined)
  }),
}))

vi.mock('@/lib/utils/encryption', () => ({
  encrypt: vi.fn().mockResolvedValue('encrypted'),
  decrypt: vi.fn().mockResolvedValue('sk_test_xxx'),
}))

// Mock Stripe constructor
vi.mock('stripe', () => {
  const mockPaymentIntent = { id: 'pi_1', client_secret: 'pi_1_secret' }
  const mockSession = { id: 'cs_1', url: 'https://checkout.stripe.com/cs_1' }

  const StripeMock = vi.fn().mockImplementation(function (this: any) {
    this.paymentIntents = {
      create: vi.fn().mockResolvedValue(mockPaymentIntent),
    }
    this.checkout = {
      sessions: { create: vi.fn().mockResolvedValue(mockSession) },
    }
    this.webhooks = {
      constructEvent: vi.fn().mockReturnValue({
        type: 'payment_intent.succeeded',
        data: { object: { id: 'pi_1', metadata: { tenantId: 'tenant-1', enrollmentIds: 'enr-1' } } },
      }),
    }
  })
  return { default: StripeMock }
})

import { db } from '@/lib/db/client'
import { PaymentService } from '@/lib/services/paymentService'

function mockInsert(row: unknown) {
  const chain: any = { values: vi.fn(), returning: vi.fn() }
  chain.values.mockReturnValue(chain)
  chain.returning.mockResolvedValue([row])
  ;(db.insert as ReturnType<typeof vi.fn>).mockReturnValue(chain)
}

function mockUpdate() {
  const chain: any = { set: vi.fn(), where: vi.fn() }
  chain.set.mockReturnValue(chain)
  chain.where.mockResolvedValue([])
  ;(db.update as ReturnType<typeof vi.fn>).mockReturnValue(chain)
}

describe('PaymentService', () => {
  let service: PaymentService

  beforeEach(() => {
    service = new PaymentService()
    vi.clearAllMocks()
  })

  describe('createPaymentIntent', () => {
    it('returns clientSecret from Stripe', async () => {
      const result = await service.createPaymentIntent('tenant-1', {
        tenantId: 'tenant-1',
        enrollmentIds: ['enr-1'],
        amount: 5000,
        currency: 'usd',
        successUrl: 'https://example.com/success',
        cancelUrl: 'https://example.com/cancel',
      })

      expect(result.id).toBe('pi_1')
      expect(result.clientSecret).toBe('pi_1_secret')
    })
  })

  describe('createCheckoutSession', () => {
    it('returns checkout URL from Stripe', async () => {
      const result = await service.createCheckoutSession('tenant-1', {
        tenantId: 'tenant-1',
        enrollmentIds: ['enr-1'],
        amount: 5000,
        currency: 'usd',
        successUrl: 'https://example.com/success',
        cancelUrl: 'https://example.com/cancel',
      })

      expect(result.id).toBe('cs_1')
      expect(result.url).toContain('stripe.com')
    })
  })

  describe('getPayment', () => {
    it('returns a payment record by id', async () => {
      const payRow = {
        id: 'pay-1', tenantId: 'tenant-1', enrollmentId: 'enr-1',
        provider: 'stripe', providerPaymentId: 'pi_1',
        amount: '50.00', currency: 'USD', status: 'succeeded',
        rawPayload: {}, createdAt: new Date(),
      }
      const chain: any = { from: vi.fn(), where: vi.fn(), limit: vi.fn() }
      chain.from.mockReturnValue(chain)
      chain.where.mockReturnValue(chain)
      chain.limit.mockResolvedValue([payRow])
      ;(db.select as ReturnType<typeof vi.fn>).mockReturnValue(chain)

      const result = await service.getPayment('tenant-1', 'pay-1')
      expect(result?.id).toBe('pay-1')
      expect(result?.status).toBe('succeeded')
    })
  })
})
