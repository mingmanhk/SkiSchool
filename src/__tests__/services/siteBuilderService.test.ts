import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/db/client', () => ({
  db: { select: vi.fn(), insert: vi.fn(), update: vi.fn() },
  schema: {},
}))

vi.mock('@/lib/services/tenantService', () => ({
  TenantService: vi.fn().mockImplementation(function (this: any) {
    this.getTenantBySlug = vi.fn().mockResolvedValue({
      id: 'tenant-1', slug: 'alpine', name: 'Alpine',
      status: 'active', featureFlags: {}, createdAt: '2024-01-01', updatedAt: '2024-01-01',
    })
  }),
}))

import { db } from '@/lib/db/client'
import { SiteBuilderService } from '@/lib/services/siteBuilderService'

const SITE_ROW = {
  tenantId: 'tenant-1',
  navigation: [{ label: 'Home', href: '/' }],
  branding: { primaryColor: '#ff0000' },
  logos: {},
  layout: {},
  hero: { title: 'Welcome' },
  sections: [],
  aboutSections: [],
  teamSections: [],
  customPages: [],
  updatedAt: new Date(),
}

function mockSelect(rows: unknown[]) {
  const chain: any = { from: vi.fn(), where: vi.fn(), limit: vi.fn() }
  chain.from.mockReturnValue(chain)
  chain.where.mockReturnValue(chain)
  chain.limit.mockResolvedValue(rows)
  ;(db.select as ReturnType<typeof vi.fn>).mockReturnValue(chain)
}

function mockInsert(row: unknown) {
  const chain: any = { values: vi.fn(), returning: vi.fn() }
  chain.values.mockReturnValue(chain)
  chain.returning.mockResolvedValue([row])
  ;(db.insert as ReturnType<typeof vi.fn>).mockReturnValue(chain)
}

function mockUpdate(row: unknown) {
  const chain: any = { set: vi.fn(), where: vi.fn(), returning: vi.fn() }
  chain.set.mockReturnValue(chain)
  chain.where.mockReturnValue(chain)
  chain.returning.mockResolvedValue([row])
  ;(db.update as ReturnType<typeof vi.fn>).mockReturnValue(chain)
}

describe('SiteBuilderService', () => {
  let service: SiteBuilderService

  beforeEach(() => {
    service = new SiteBuilderService()
    vi.clearAllMocks()
  })

  describe('getSiteConfig', () => {
    it('returns config when found', async () => {
      mockSelect([SITE_ROW])
      const result = await service.getSiteConfig('tenant-1')
      expect(result.tenantId).toBe('tenant-1')
      expect(result.navigation).toHaveLength(1)
    })

    it('returns default config when not found', async () => {
      mockSelect([])
      const result = await service.getSiteConfig('tenant-1')
      expect(result.tenantId).toBe('tenant-1')
      expect(result.navigation).toEqual([])
    })
  })

  describe('updateSiteConfig', () => {
    it('inserts config when none exists', async () => {
      // First call (getSiteConfig) returns empty, second call (check existing) returns empty
      ;(db.select as ReturnType<typeof vi.fn>).mockImplementation(() => {
        const chain: any = { from: vi.fn(), where: vi.fn(), limit: vi.fn() }
        chain.from.mockReturnValue(chain)
        chain.where.mockReturnValue(chain)
        chain.limit.mockResolvedValue([])
        return chain
      })
      mockInsert(SITE_ROW)

      const result = await service.updateSiteConfig('tenant-1', { hero: { title: 'New Title' } }, 'user-1')
      expect(result.tenantId).toBe('tenant-1')
    })

    it('updates config when one exists', async () => {
      let selectCount = 0
      ;(db.select as ReturnType<typeof vi.fn>).mockImplementation(() => {
        const chain: any = { from: vi.fn(), where: vi.fn(), limit: vi.fn() }
        chain.from.mockReturnValue(chain)
        chain.where.mockReturnValue(chain)
        chain.limit.mockImplementation(() => {
          selectCount++
          return Promise.resolve(selectCount <= 2 ? [SITE_ROW] : [])
        })
        return chain
      })
      mockUpdate(SITE_ROW)

      const result = await service.updateSiteConfig('tenant-1', { hero: { title: 'Updated' } }, 'user-1')
      expect(result.tenantId).toBe('tenant-1')
    })
  })

  describe('getPublicSiteConfigBySlug', () => {
    it('resolves tenant by slug and returns config', async () => {
      mockSelect([SITE_ROW])
      const result = await service.getPublicSiteConfigBySlug('alpine')
      expect(result.tenantId).toBe('tenant-1')
    })
  })
})
