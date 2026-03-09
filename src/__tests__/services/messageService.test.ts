import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/db/client', () => ({
  db: { select: vi.fn(), insert: vi.fn(), update: vi.fn() },
  schema: {},
}))

vi.mock('@/lib/services/smsProviderService', () => ({
  SmsProviderService: vi.fn().mockImplementation(function (this: any) {
    this.sendSmsBatch = vi.fn().mockResolvedValue([
      { providerMessageId: 'SM123', status: 'queued' },
    ])
  }),
}))

import { db } from '@/lib/db/client'
import { MessageService } from '@/lib/services/messageService'

const TEMPLATE = {
  id: 'tmpl-1',
  tenantId: 'tenant-1',
  name: 'Welcome SMS',
  category: 'onboarding',
  channel: 'sms',
  body: 'Hello {{name}}, welcome to ski school!',
  variables: ['name'],
  createdBy: null,
  updatedBy: null,
  createdAt: new Date(),
  updatedAt: new Date(),
}

describe('MessageService', () => {
  let service: MessageService

  beforeEach(() => {
    service = new MessageService()
    vi.clearAllMocks()
  })

  describe('previewMessage', () => {
    it('replaces template variables with sample data', async () => {
      const chain: any = { from: vi.fn(), where: vi.fn(), limit: vi.fn() }
      chain.from.mockReturnValue(chain)
      chain.where.mockReturnValue(chain)
      chain.limit.mockResolvedValue([TEMPLATE])
      ;(db.select as ReturnType<typeof vi.fn>).mockReturnValue(chain)

      const result = await service.previewMessage('tenant-1', 'tmpl-1', { name: 'Alice' })
      expect(result).toBe('Hello Alice, welcome to ski school!')
    })

    it('leaves unreplaced placeholders when no sample data provided', async () => {
      const chain: any = { from: vi.fn(), where: vi.fn(), limit: vi.fn() }
      chain.from.mockReturnValue(chain)
      chain.where.mockReturnValue(chain)
      chain.limit.mockResolvedValue([TEMPLATE])
      ;(db.select as ReturnType<typeof vi.fn>).mockReturnValue(chain)

      const result = await service.previewMessage('tenant-1', 'tmpl-1')
      expect(result).toContain('{{name}}')
    })

    it('throws when template not found', async () => {
      const chain: any = { from: vi.fn(), where: vi.fn(), limit: vi.fn() }
      chain.from.mockReturnValue(chain)
      chain.where.mockReturnValue(chain)
      chain.limit.mockResolvedValue([])
      ;(db.select as ReturnType<typeof vi.fn>).mockReturnValue(chain)

      await expect(service.previewMessage('tenant-1', 'nonexistent')).rejects.toThrow(
        'Template not found',
      )
    })
  })

  describe('createTemplate', () => {
    it('inserts and returns a new template', async () => {
      const insertChain: any = { values: vi.fn(), returning: vi.fn() }
      insertChain.values.mockReturnValue(insertChain)
      insertChain.returning.mockResolvedValue([TEMPLATE])
      ;(db.insert as ReturnType<typeof vi.fn>).mockReturnValue(insertChain)

      const result = await service.createTemplate(
        'tenant-1',
        { name: 'Welcome SMS', channel: 'sms', body: 'Hello {{name}}', variables: ['name'] },
        'user-1',
      )
      expect(result.id).toBe('tmpl-1')
      expect(result.channel).toBe('sms')
    })
  })
})
