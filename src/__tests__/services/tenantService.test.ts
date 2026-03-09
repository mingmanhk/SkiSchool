import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/db/client', () => ({
  db: { select: vi.fn(), insert: vi.fn(), update: vi.fn() },
  schema: {},
}))

import { db } from '@/lib/db/client'
import { TenantService } from '@/lib/services/tenantService'

const TENANT = {
  id: 'tenant-uuid-1',
  slug: 'alpine-ski',
  name: 'Alpine Ski School',
  status: 'active',
  featureFlags: {},
  createdAt: new Date(),
  updatedAt: new Date(),
}

function mockSelectChain(rows: unknown[]) {
  const chain = { from: vi.fn(), where: vi.fn(), limit: vi.fn() }
  chain.from.mockReturnValue(chain)
  chain.where.mockReturnValue(chain)
  chain.limit.mockResolvedValue(rows)
  ;(db.select as ReturnType<typeof vi.fn>).mockReturnValue(chain)
}

describe('TenantService', () => {
  let service: TenantService

  beforeEach(() => {
    service = new TenantService()
    vi.clearAllMocks()
  })

  describe('getTenantBySlug', () => {
    it('returns a tenant when found', async () => {
      mockSelectChain([TENANT])
      const result = await service.getTenantBySlug('alpine-ski')
      expect(result).not.toBeNull()
      expect(result?.slug).toBe('alpine-ski')
      expect(result?.status).toBe('active')
    })

    it('returns null when not found', async () => {
      mockSelectChain([])
      const result = await service.getTenantBySlug('unknown-school')
      expect(result).toBeNull()
    })
  })

  describe('createTenant', () => {
    it('inserts and returns a new tenant', async () => {
      const insertChain = { values: vi.fn(), returning: vi.fn() }
      insertChain.values.mockReturnValue(insertChain)
      insertChain.returning.mockResolvedValue([TENANT])
      ;(db.insert as ReturnType<typeof vi.fn>).mockReturnValue(insertChain)

      const result = await service.createTenant({ name: 'Alpine Ski School', slug: 'alpine-ski' })
      expect(result.id).toBe(TENANT.id)
      expect(result.name).toBe(TENANT.name)
    })
  })

  describe('updateFeatureFlags', () => {
    it('calls update with the new flags', async () => {
      const updateChain = { set: vi.fn(), where: vi.fn() }
      updateChain.set.mockReturnValue(updateChain)
      updateChain.where.mockResolvedValue([])
      ;(db.update as ReturnType<typeof vi.fn>).mockReturnValue(updateChain)

      await service.updateFeatureFlags('tenant-uuid-1', { sms: true })
      expect(db.update).toHaveBeenCalled()
      expect(updateChain.set).toHaveBeenCalledWith(
        expect.objectContaining({ featureFlags: { sms: true } }),
      )
    })
  })
})
