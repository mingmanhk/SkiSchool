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
      id: 'family-1', tenantId: 'tenant-1', createdAt: new Date().toISOString(),
    })
    this.createParent = vi.fn().mockResolvedValue({
      id: 'parent-1', tenantId: 'tenant-1', familyId: 'family-1',
      email: 'p@test.com', createdAt: new Date().toISOString(),
    })
    this.createStudent = vi.fn().mockResolvedValue({
      id: 'student-1', tenantId: 'tenant-1', familyId: 'family-1',
      firstName: 'Alice', lastName: 'Smith', createdAt: new Date().toISOString(),
    })
    this.getFamilyByUserId = vi.fn().mockResolvedValue({
      id: 'family-1', tenantId: 'tenant-1', createdAt: new Date().toISOString(),
    })
  }),
}))

import { db } from '@/lib/db/client'
import { RegistrationService } from '@/lib/services/registrationService'

function mockSelectChain(rows: unknown[]) {
  const chain: any = { from: vi.fn(), where: vi.fn(), limit: vi.fn() }
  chain.from.mockReturnValue(chain)
  chain.where.mockReturnValue(chain)
  chain.limit.mockResolvedValue(rows)
  ;(db.select as ReturnType<typeof vi.fn>).mockReturnValue(chain)
}

function mockInsertChain(rows: unknown[]) {
  const chain: any = { values: vi.fn(), returning: vi.fn() }
  chain.values.mockReturnValue(chain)
  chain.returning.mockResolvedValue(rows)
  ;(db.insert as ReturnType<typeof vi.fn>).mockReturnValue(chain)
}

function mockUpdateChain() {
  const chain: any = { set: vi.fn(), where: vi.fn() }
  chain.set.mockReturnValue(chain)
  chain.where.mockResolvedValue([])
  ;(db.update as ReturnType<typeof vi.fn>).mockReturnValue(chain)
}

describe('RegistrationService', () => {
  let service: RegistrationService

  beforeEach(() => {
    service = new RegistrationService()
    vi.clearAllMocks()
  })

  describe('classifyEmail', () => {
    it('returns "returning_account" when user + membership exist', async () => {
      let callCount = 0
      ;(db.select as ReturnType<typeof vi.fn>).mockImplementation(() => {
        const chain: any = { from: vi.fn(), where: vi.fn(), limit: vi.fn() }
        chain.from.mockReturnValue(chain)
        chain.where.mockReturnValue(chain)
        callCount++
        if (callCount === 1) chain.limit.mockResolvedValue([{ id: 'user-1', email: 'a@b.com' }])
        else if (callCount === 2) chain.limit.mockResolvedValue([{ id: 'mem-1' }])
        else chain.limit.mockResolvedValue([])
        return chain
      })

      const result = await service.classifyEmail('tenant-1', 'a@b.com')
      expect(result).toBe('returning_account')
    })

    it('returns "returning_historical" when parent exists but no user account', async () => {
      let callCount = 0
      ;(db.select as ReturnType<typeof vi.fn>).mockImplementation(() => {
        const chain: any = { from: vi.fn(), where: vi.fn(), limit: vi.fn() }
        chain.from.mockReturnValue(chain)
        chain.where.mockReturnValue(chain)
        callCount++
        if (callCount === 1) chain.limit.mockResolvedValue([])
        else chain.limit.mockResolvedValue([{ id: 'parent-1' }])
        return chain
      })

      const result = await service.classifyEmail('tenant-1', 'historical@b.com')
      expect(result).toBe('returning_historical')
    })

    it('returns "new" when no user and no parent', async () => {
      ;(db.select as ReturnType<typeof vi.fn>).mockImplementation(() => {
        const chain: any = { from: vi.fn(), where: vi.fn(), limit: vi.fn() }
        chain.from.mockReturnValue(chain)
        chain.where.mockReturnValue(chain)
        chain.limit.mockResolvedValue([])
        return chain
      })

      const result = await service.classifyEmail('tenant-1', 'new@b.com')
      expect(result).toBe('new')
    })
  })

  describe('createNewFamilyRegistration', () => {
    it('creates family, parents, students, and enrollments', async () => {
      mockInsertChain([{ id: 'enrollment-1', status: 'pending' }])
      mockUpdateChain()

      const result = await service.createNewFamilyRegistration({
        tenantId: 'tenant-1',
        email: 'parent@test.com',
        familyData: {},
        parentsData: [{ email: 'parent@test.com', firstName: 'John', lastName: 'Doe' }],
        studentsData: [{ firstName: 'Alice', lastName: 'Doe', birthdate: '2015-01-01' }],
        programIds: ['program-1'],
      })

      expect(result.familyId).toBe('family-1')
      expect(result.parentIds).toHaveLength(1)
      expect(result.studentIds).toHaveLength(1)
    })
  })
})
