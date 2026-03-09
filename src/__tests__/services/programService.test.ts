import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/db/client', () => ({
  db: { select: vi.fn(), insert: vi.fn(), update: vi.fn() },
  schema: {},
}))

import { db } from '@/lib/db/client'
import { ProgramService } from '@/lib/services/programService'

const PROGRAM = {
  id: 'prog-1',
  tenantId: 'tenant-1',
  name: 'Junior Ski',
  discipline: 'alpine',
  ageMin: 6,
  ageMax: 12,
  skillLevel: 'beginner',
  seasonYear: 2025,
  startDate: new Date('2025-12-01'),
  endDate: new Date('2025-12-31'),
  location: 'Mountain Base',
  price: '499.00',
  capacity: 20,
  description: 'Fun ski program',
  visibilityStatus: 'public',
  createdAt: new Date(),
  updatedAt: new Date(),
}

function mockSelectChain(rows: unknown[]) {
  const chain: any = { from: vi.fn(), where: vi.fn(), limit: vi.fn() }
  chain.from.mockReturnValue(chain)
  chain.where.mockReturnValue(chain)
  chain.limit.mockResolvedValue(rows)
  // also support direct await (no .limit) for listPrograms
  chain.then = (resolve: any) => resolve(rows)
  ;(db.select as ReturnType<typeof vi.fn>).mockReturnValue(chain)
}

describe('ProgramService', () => {
  let service: ProgramService

  beforeEach(() => {
    service = new ProgramService()
    vi.clearAllMocks()
  })

  describe('getProgram', () => {
    it('returns a program when found', async () => {
      mockSelectChain([PROGRAM])
      const result = await service.getProgram('tenant-1', 'prog-1')
      expect(result).not.toBeNull()
      expect(result?.name).toBe('Junior Ski')
      expect(result?.price).toBe(499)
    })

    it('returns null when not found', async () => {
      mockSelectChain([])
      const result = await service.getProgram('tenant-1', 'not-found')
      expect(result).toBeNull()
    })
  })

  describe('createProgram', () => {
    it('inserts and returns new program', async () => {
      const insertChain = { values: vi.fn(), returning: vi.fn() }
      insertChain.values.mockReturnValue(insertChain)
      insertChain.returning.mockResolvedValue([PROGRAM])
      ;(db.insert as ReturnType<typeof vi.fn>).mockReturnValue(insertChain)

      const result = await service.createProgram('tenant-1', {
        name: 'Junior Ski',
        visibilityStatus: 'public',
      })
      expect(result.id).toBe('prog-1')
      expect(result.capacity).toBe(20)
    })
  })

  describe('deleteProgram', () => {
    it('soft-deletes by setting visibility to hidden', async () => {
      const updateChain = { set: vi.fn(), where: vi.fn() }
      updateChain.set.mockReturnValue(updateChain)
      updateChain.where.mockResolvedValue([])
      ;(db.update as ReturnType<typeof vi.fn>).mockReturnValue(updateChain)

      await service.deleteProgram('tenant-1', 'prog-1')
      expect(updateChain.set).toHaveBeenCalledWith(
        expect.objectContaining({ visibilityStatus: 'hidden' }),
      )
    })
  })
})
