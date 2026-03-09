import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/db/client', () => ({
  db: { select: vi.fn(), insert: vi.fn(), update: vi.fn() },
  schema: {},
}))

import { db } from '@/lib/db/client'
import { FamilyService } from '@/lib/services/familyService'

const FAMILY = { id: 'fam-1', tenantId: 'tenant-1', primaryParentId: null, createdAt: new Date() }
const PARENT = {
  id: 'par-1', tenantId: 'tenant-1', familyId: 'fam-1',
  userId: null, email: 'p@test.com', phone: null, firstName: 'John', lastName: 'Doe',
  createdAt: new Date(),
}
const STUDENT = {
  id: 'stu-1', tenantId: 'tenant-1', familyId: 'fam-1',
  firstName: 'Alice', lastName: 'Doe', birthdate: null, gender: null, notes: null,
  createdAt: new Date(),
}

function mockSelect(rows: unknown[]) {
  const chain: any = { from: vi.fn(), where: vi.fn(), limit: vi.fn(), innerJoin: vi.fn() }
  chain.from.mockReturnValue(chain)
  chain.where.mockReturnValue(chain)
  chain.limit.mockResolvedValue(rows)
  chain.innerJoin.mockReturnValue(chain)
  ;(db.select as ReturnType<typeof vi.fn>).mockReturnValue(chain)
}

function mockInsert(row: unknown) {
  const chain: any = { values: vi.fn(), returning: vi.fn() }
  chain.values.mockReturnValue(chain)
  chain.returning.mockResolvedValue([row])
  ;(db.insert as ReturnType<typeof vi.fn>).mockReturnValue(chain)
}

describe('FamilyService', () => {
  let service: FamilyService

  beforeEach(() => {
    service = new FamilyService()
    vi.clearAllMocks()
  })

  describe('getFamily', () => {
    it('returns family when found', async () => {
      mockSelect([FAMILY])
      const result = await service.getFamily('tenant-1', 'fam-1')
      expect(result?.id).toBe('fam-1')
    })

    it('returns null when not found', async () => {
      mockSelect([])
      const result = await service.getFamily('tenant-1', 'nonexistent')
      expect(result).toBeNull()
    })
  })

  describe('createFamily', () => {
    it('inserts and returns a family', async () => {
      mockInsert(FAMILY)
      const result = await service.createFamily('tenant-1', {})
      expect(result.id).toBe('fam-1')
      expect(result.tenantId).toBe('tenant-1')
    })
  })

  describe('createParent', () => {
    it('inserts and returns a parent', async () => {
      mockInsert(PARENT)
      const result = await service.createParent('tenant-1', {
        familyId: 'fam-1', email: 'p@test.com',
      })
      expect(result.id).toBe('par-1')
      expect(result.email).toBe('p@test.com')
    })
  })

  describe('createStudent', () => {
    it('inserts and returns a student', async () => {
      mockInsert(STUDENT)
      const result = await service.createStudent('tenant-1', {
        familyId: 'fam-1', firstName: 'Alice', lastName: 'Doe',
      })
      expect(result.id).toBe('stu-1')
      expect(result.firstName).toBe('Alice')
    })
  })
})
