/**
 * E2E-style integration test for the complete registration flow.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/db/client', () => ({
  db: { select: vi.fn(), insert: vi.fn(), update: vi.fn() },
  schema: {},
}))

vi.mock('@/lib/services/emailService', () => ({
  EmailService: vi.fn().mockImplementation(function (this: any) {
    this.sendVerificationEmailForHistorical = vi.fn().mockResolvedValue(undefined)
    this.sendEnrollmentConfirmation = vi.fn().mockResolvedValue(undefined)
  }),
}))

vi.mock('@/lib/services/auditService', () => ({
  AuditService: vi.fn().mockImplementation(function (this: any) {
    this.log = vi.fn().mockResolvedValue(undefined)
  }),
}))

vi.mock('@/lib/services/familyService', () => ({
  FamilyService: vi.fn().mockImplementation(function (this: any) {
    this.createFamily = vi.fn().mockResolvedValue({
      id: 'fam-1', tenantId: 'tenant-1', createdAt: new Date().toISOString(),
    })
    this.createParent = vi.fn().mockResolvedValue({
      id: 'par-1', tenantId: 'tenant-1', familyId: 'fam-1',
      email: 'p@test.com', createdAt: new Date().toISOString(),
    })
    this.createStudent = vi.fn().mockResolvedValue({
      id: 'stu-1', tenantId: 'tenant-1', familyId: 'fam-1',
      firstName: 'Alice', lastName: 'Doe', createdAt: new Date().toISOString(),
    })
    this.getFamilyByUserId = vi.fn().mockResolvedValue({
      id: 'fam-1', tenantId: 'tenant-1', createdAt: new Date().toISOString(),
    })
  }),
}))

import { db } from '@/lib/db/client'
import { RegistrationService } from '@/lib/services/registrationService'

function setupEmptySelects() {
  ;(db.select as ReturnType<typeof vi.fn>).mockImplementation(() => {
    const chain: any = { from: vi.fn(), where: vi.fn(), limit: vi.fn() }
    chain.from.mockReturnValue(chain)
    chain.where.mockReturnValue(chain)
    chain.limit.mockResolvedValue([])
    return chain
  })
}

function setupInserts() {
  let count = 0
  ;(db.insert as ReturnType<typeof vi.fn>).mockImplementation(() => {
    count++
    const chain: any = { values: vi.fn(), returning: vi.fn() }
    chain.values.mockReturnValue(chain)
    const rows = [
      { id: 'enr-1', status: 'pending' }, // enrollment
      { id: 'audit-1' },                  // audit log
    ]
    chain.returning.mockResolvedValue([rows[count - 1] ?? {}])
    return chain
  })
  ;(db.update as ReturnType<typeof vi.fn>).mockImplementation(() => {
    const chain: any = { set: vi.fn(), where: vi.fn() }
    chain.set.mockReturnValue(chain)
    chain.where.mockResolvedValue([])
    return chain
  })
}

describe('Full Registration Flow', () => {
  let service: RegistrationService

  beforeEach(() => {
    service = new RegistrationService()
    vi.clearAllMocks()
  })

  it('Step 1: classifyEmail returns "new" for unknown email', async () => {
    setupEmptySelects()
    const classification = await service.classifyEmail('tenant-1', 'new@ski.com')
    expect(classification).toBe('new')
  })

  it('Step 2: createNewFamilyRegistration creates all entities', async () => {
    setupEmptySelects()
    setupInserts()

    const result = await service.createNewFamilyRegistration({
      tenantId: 'tenant-1',
      email: 'new@ski.com',
      familyData: {},
      parentsData: [{ email: 'new@ski.com', firstName: 'Jane', lastName: 'Doe' }],
      studentsData: [{ firstName: 'Alice', lastName: 'Doe', birthdate: '2016-03-15' }],
      programIds: ['prog-1'],
    })

    expect(result.familyId).toBe('fam-1')
    expect(result.parentIds).toEqual(['par-1'])
    expect(result.studentIds).toEqual(['stu-1'])
    expect(result.enrollmentIds).toEqual(['enr-1'])
  })

  it('Step 3: classifyEmail returns "returning_account" for existing member', async () => {
    let call = 0
    ;(db.select as ReturnType<typeof vi.fn>).mockImplementation(() => {
      const chain: any = { from: vi.fn(), where: vi.fn(), limit: vi.fn() }
      chain.from.mockReturnValue(chain)
      chain.where.mockReturnValue(chain)
      chain.limit.mockImplementation(() => {
        call++
        if (call === 1) return Promise.resolve([{ id: 'user-1', email: 'existing@ski.com' }])
        if (call === 2) return Promise.resolve([{ id: 'mem-1' }])
        return Promise.resolve([])
      })
      return chain
    })

    const classification = await service.classifyEmail('tenant-1', 'existing@ski.com')
    expect(classification).toBe('returning_account')
  })
})
