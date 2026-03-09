// AuditService: Consistent audit logging
import { eq, and, desc } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { auditLogs } from '@/lib/db/schema_multi_tenant';
import { AuditLog } from '@/types/spec';

export interface AuditLogData {
  tenantId?: string;
  userId?: string;
  action: string;
  entityType?: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
}

export class AuditService {
  async log(data: AuditLogData): Promise<void> {
    await db.insert(auditLogs).values({
      tenantId: data.tenantId || null,
      userId: data.userId || null,
      action: data.action,
      entityType: data.entityType || null,
      entityId: data.entityId || null,
      metadata: data.metadata || {},
    });
  }

  async logIntegrationChange(
    tenantId: string,
    userId: string,
    provider: string,
    action: 'created' | 'updated' | 'deleted',
  ): Promise<void> {
    await this.log({
      tenantId,
      userId,
      action: `integration.${provider}.${action}`,
      entityType: 'integration_config',
      metadata: { provider },
    });
  }

  async logDomainChange(
    tenantId: string,
    userId: string,
    domain: string,
    action: 'added' | 'verified' | 'activated' | 'suspended',
  ): Promise<void> {
    await this.log({
      tenantId,
      userId,
      action: `domain.${action}`,
      entityType: 'tenant_domain',
      metadata: { domain },
    });
  }

  async logMessageSent(
    tenantId: string,
    userId: string,
    messageId: string,
    recipientCount: number,
    channel: string,
  ): Promise<void> {
    await this.log({
      tenantId,
      userId,
      action: 'message.sent',
      entityType: 'message',
      entityId: messageId,
      metadata: { recipientCount, channel },
    });
  }

  async logPayment(
    tenantId: string,
    userId: string,
    paymentId: string,
    provider: string,
    amount: number,
    status: string,
  ): Promise<void> {
    await this.log({
      tenantId,
      userId,
      action: `payment.${status}`,
      entityType: 'payment',
      entityId: paymentId,
      metadata: { provider, amount },
    });
  }

  async logApiKeyOperation(
    tenantId: string,
    userId: string,
    keyId: string,
    operation: 'created' | 'revoked',
  ): Promise<void> {
    await this.log({
      tenantId,
      userId,
      action: `api_key.${operation}`,
      entityType: 'tenant_api_key',
      entityId: keyId,
    });
  }

  async getLogs(
    filters: {
      tenantId?: string;
      userId?: string;
      action?: string;
      entityType?: string;
      limit?: number;
    },
  ): Promise<AuditLog[]> {
    let query = db.select().from(auditLogs);

    const conditions: any[] = [];

    if (filters.tenantId) {
      conditions.push(eq(auditLogs.tenantId, filters.tenantId));
    }

    if (filters.userId) {
      conditions.push(eq(auditLogs.userId, filters.userId));
    }

    if (filters.action) {
      conditions.push(eq(auditLogs.action, filters.action));
    }

    if (filters.entityType) {
      conditions.push(eq(auditLogs.entityType, filters.entityType));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    query = query.orderBy(desc(auditLogs.createdAt)) as any;

    if (filters.limit) {
      query = query.limit(filters.limit) as any;
    }

    const results = await query;

    return results.map((row) => ({
      id: row.id,
      tenantId: row.tenantId || undefined,
      userId: row.userId || undefined,
      action: row.action,
      entityType: row.entityType || undefined,
      entityId: row.entityId || undefined,
      metadata: (row.metadata || {}) as Record<string, unknown>,
      createdAt: row.createdAt.toISOString(),
    }));
  }
}
