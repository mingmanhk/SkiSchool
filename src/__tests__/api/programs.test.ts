import { describe, it, expect, vi } from 'vitest'

vi.mock('@/lib/services/tenantService', () => ({
  TenantService: vi.fn().mockImplementation(function (this: any) {
    this.getTenantBySlug = vi.fn().mockResolvedValue({
      id: 'tenant-1', slug: 'alpine', name: 'Alpine School',
      status: 'active', featureFlags: {}, createdAt: '2024-01-01', updatedAt: '2024-01-01',
    })
  }),
}))

vi.mock('@/lib/services/programService', () => ({
  ProgramService: vi.fn().mockImplementation(function (this: any) {
    this.getPublicPrograms = vi.fn().mockResolvedValue([
      { id: 'prog-1', tenantId: 'tenant-1', name: 'Junior Ski',
        visibilityStatus: 'public', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
    ])
    this.createProgram = vi.fn().mockResolvedValue({
      id: 'prog-new', tenantId: 'tenant-1', name: 'Advanced Ski',
      visibilityStatus: 'public', createdAt: '2024-01-01', updatedAt: '2024-01-01',
    })
  }),
}))

import { GET, POST } from '@/app/api/v1/[tenantSlug]/programs/route'
import { NextRequest } from 'next/server'

const params = { params: Promise.resolve({ tenantSlug: 'alpine' }) }

describe('GET /api/v1/[tenantSlug]/programs', () => {
  it('returns a list of public programs', async () => {
    const req = new NextRequest('http://localhost/api/v1/alpine/programs')
    const res = await GET(req, params)
    const data = await res.json()
    expect(res.status).toBe(200)
    expect(data.data).toHaveLength(1)
    expect(data.data[0].name).toBe('Junior Ski')
  })
})

describe('POST /api/v1/[tenantSlug]/programs', () => {
  it('creates a program with valid body', async () => {
    const req = new NextRequest('http://localhost/api/v1/alpine/programs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Advanced Ski', visibilityStatus: 'public' }),
    })
    const res = await POST(req, params)
    const data = await res.json()
    expect(res.status).toBe(201)
    expect(data.data.name).toBe('Advanced Ski')
  })

  it('returns 400 when name is missing', async () => {
    const req = new NextRequest('http://localhost/api/v1/alpine/programs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ visibilityStatus: 'public' }),
    })
    const res = await POST(req, params)
    expect(res.status).toBe(400)
  })
})
