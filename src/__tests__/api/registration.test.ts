import { describe, it, expect, vi } from 'vitest'

vi.mock('@/lib/services/tenantService', () => ({
  TenantService: vi.fn().mockImplementation(function (this: any) {
    this.getTenantBySlug = vi.fn().mockResolvedValue({
      id: 'tenant-1', slug: 'alpine', name: 'Alpine',
      status: 'active', featureFlags: {}, createdAt: '2024-01-01', updatedAt: '2024-01-01',
    })
  }),
}))

vi.mock('@/lib/services/registrationService', () => ({
  RegistrationService: vi.fn().mockImplementation(function (this: any) {
    this.classifyEmail = vi.fn().mockResolvedValue('new')
    this.createNewFamilyRegistration = vi.fn().mockResolvedValue({
      familyId: 'fam-1', parentIds: ['par-1'],
      studentIds: ['stu-1'], enrollmentIds: ['enr-1'],
    })
  }),
}))

import { POST as checkEmail } from '@/app/api/v1/[tenantSlug]/registration/check-email/route'
import { POST as submitReg } from '@/app/api/v1/[tenantSlug]/registration/submit/route'
import { NextRequest } from 'next/server'

const params = { params: Promise.resolve({ tenantSlug: 'alpine' }) }

function makePost(body: unknown) {
  return new NextRequest('http://localhost', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('POST /registration/check-email', () => {
  it('classifies an email correctly', async () => {
    const res = await checkEmail(makePost({ email: 'new@ski.com' }), params)
    const data = await res.json()
    expect(res.status).toBe(200)
    expect(data.data.classification).toBe('new')
  })

  it('returns 400 for invalid email', async () => {
    const res = await checkEmail(makePost({ email: 'not-an-email' }), params)
    expect(res.status).toBe(400)
  })
})

describe('POST /registration/submit', () => {
  const validBody = {
    email: 'parent@ski.com',
    parents: [{ email: 'parent@ski.com', firstName: 'John', lastName: 'Doe' }],
    students: [{ firstName: 'Alice', lastName: 'Doe' }],
    programIds: ['550e8400-e29b-41d4-a716-446655440000'],
  }

  it('creates a new registration', async () => {
    const res = await submitReg(makePost(validBody), params)
    const data = await res.json()
    expect(res.status).toBe(201)
    expect(data.data.familyId).toBe('fam-1')
    expect(data.data.enrollmentIds).toHaveLength(1)
  })

  it('returns 400 when students array is empty', async () => {
    const res = await submitReg(makePost({ ...validBody, students: [] }), params)
    expect(res.status).toBe(400)
  })

  it('returns 400 when programIds is empty', async () => {
    const res = await submitReg(makePost({ ...validBody, programIds: [] }), params)
    expect(res.status).toBe(400)
  })
})
