import { describe, it, expect, vi } from 'vitest'

vi.mock('@/utils/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: 'user-1', email: 'admin@test.com' } },
        error: null,
      }),
    },
  }),
}))

vi.mock('@/lib/services/tenantService', () => ({
  TenantService: vi.fn().mockImplementation(function (this: any) {
    this.getTenantBySlug = vi.fn().mockResolvedValue({
      id: 'tenant-1', slug: 'alpine', name: 'Alpine',
      status: 'active', featureFlags: {}, createdAt: '2024-01-01', updatedAt: '2024-01-01',
    })
  }),
}))

vi.mock('@/lib/services/siteBuilderService', () => ({
  SiteBuilderService: vi.fn().mockImplementation(function (this: any) {
    const config = {
      tenantId: 'tenant-1',
      navigation: [{ label: 'Home', href: '/' }],
      branding: {}, logos: {}, layout: {},
      hero: { title: 'Welcome' },
      sections: [], aboutSections: [], teamSections: [], customPages: [],
      updatedAt: new Date().toISOString(),
    }
    this.getSiteConfig = vi.fn().mockResolvedValue(config)
    this.updateSiteConfig = vi.fn().mockResolvedValue({ ...config, hero: { title: 'Updated' } })
  }),
}))

import { GET, PUT } from '@/app/api/v1/[tenantSlug]/site/config/route'
import { NextRequest } from 'next/server'

const params = { params: Promise.resolve({ tenantSlug: 'alpine' }) }

describe('GET /api/v1/[tenantSlug]/site/config', () => {
  it('returns site config', async () => {
    const req = new NextRequest('http://localhost/api/v1/alpine/site/config')
    const res = await GET(req, params)
    const data = await res.json()
    expect(res.status).toBe(200)
    expect(data.data.tenantId).toBe('tenant-1')
    expect(data.data.navigation).toHaveLength(1)
  })
})

describe('PUT /api/v1/[tenantSlug]/site/config', () => {
  it('updates and returns site config', async () => {
    const req = new NextRequest('http://localhost/api/v1/alpine/site/config', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hero: { title: 'Updated' } }),
    })
    const res = await PUT(req, params)
    const data = await res.json()
    expect(res.status).toBe(200)
    expect(data.data.hero.title).toBe('Updated')
  })

  it('returns 400 for invalid body', async () => {
    const req = new NextRequest('http://localhost/api/v1/alpine/site/config', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      // navigation items need label+href; pass malformed nav
      body: JSON.stringify({ navigation: [{ label: 123 }] }),
    })
    const res = await PUT(req, params)
    expect(res.status).toBe(400)
  })
})
