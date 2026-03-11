// MessageService: Audience resolution & Template rendering
import { eq, and, inArray, desc, SQL } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import {
  messageTemplates,
  messages,
  messageRecipients,
  parents,
  students,
  enrollments,
  programs,
} from '@/lib/db/schema_multi_tenant';
import { MessageTemplate, Message, MessageChannel } from '@/types/spec';
import { SmsProviderService } from './smsProviderService';

export interface AudienceFilters {
  year?: number;
  programIds?: string[];
  studentIds?: string[];
}

const smsProviderService = new SmsProviderService();

export class MessageService {
  async listTemplates(tenantId: string): Promise<MessageTemplate[]> {
    const results = await db
      .select()
      .from(messageTemplates)
      .where(eq(messageTemplates.tenantId, tenantId));

    return results.map((row) => ({
      id: row.id,
      tenantId: row.tenantId,
      name: row.name,
      category: row.category || undefined,
      channel: row.channel as MessageChannel,
      body: row.body,
      variables: (row.variables as string[]) || [],
      createdBy: row.createdBy || undefined,
      updatedBy: row.updatedBy || undefined,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    }));
  }

  async getTemplate(
    tenantId: string,
    templateId: string,
  ): Promise<MessageTemplate | null> {
    const results = await db
      .select()
      .from(messageTemplates)
      .where(
        and(
          eq(messageTemplates.id, templateId),
          eq(messageTemplates.tenantId, tenantId),
        ),
      )
      .limit(1);

    if (results.length === 0) {
      return null;
    }

    const row = results[0];
    return {
      id: row.id,
      tenantId: row.tenantId,
      name: row.name,
      category: row.category || undefined,
      channel: row.channel as MessageChannel,
      body: row.body,
      variables: (row.variables as string[]) || [],
      createdBy: row.createdBy || undefined,
      updatedBy: row.updatedBy || undefined,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  }

  async createTemplate(
    tenantId: string,
    data: Omit<MessageTemplate, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>,
    userId: string,
  ): Promise<MessageTemplate> {
    const result = await db
      .insert(messageTemplates)
      .values({
        tenantId,
        name: data.name,
        category: data.category || null,
        channel: data.channel,
        body: data.body,
        variables: data.variables || [],
        createdBy: userId,
        updatedBy: userId,
      })
      .returning();

    const row = result[0];
    return {
      id: row.id,
      tenantId: row.tenantId,
      name: row.name,
      category: row.category || undefined,
      channel: row.channel as MessageChannel,
      body: row.body,
      variables: (row.variables as string[]) || [],
      createdBy: row.createdBy || undefined,
      updatedBy: row.updatedBy || undefined,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  }

  async updateTemplate(
    tenantId: string,
    templateId: string,
    data: Partial<MessageTemplate>,
    userId: string,
  ): Promise<MessageTemplate> {
    const result = await db
      .update(messageTemplates)
      .set({
        updatedBy: userId,
        updatedAt: new Date(),
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(data.category !== undefined ? { category: data.category ?? null } : {}),
        ...(data.channel !== undefined ? { channel: data.channel } : {}),
        ...(data.body !== undefined ? { body: data.body } : {}),
        ...(data.variables !== undefined ? { variables: data.variables } : {}),
      })
      .where(
        and(
          eq(messageTemplates.id, templateId),
          eq(messageTemplates.tenantId, tenantId),
        ),
      )
      .returning();

    if (result.length === 0) {
      throw new Error('Template not found');
    }

    const row = result[0];
    return {
      id: row.id,
      tenantId: row.tenantId,
      name: row.name,
      category: row.category || undefined,
      channel: row.channel as MessageChannel,
      body: row.body,
      variables: (row.variables as string[]) || [],
      createdBy: row.createdBy || undefined,
      updatedBy: row.updatedBy || undefined,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  }

  async resolveAudience(
    tenantId: string,
    filters: AudienceFilters,
  ): Promise<Array<{ parentId: string; phone: string; studentId?: string }>> {
    const conditions: SQL[] = [eq(parents.tenantId, tenantId)];

    if (filters.studentIds && filters.studentIds.length > 0) {
      conditions.push(inArray(students.id, filters.studentIds));
    }

    const baseSelect = {
      parentId: parents.id,
      phone: parents.phone,
      studentId: students.id,
    };

    let results: Array<{ parentId: string; phone: string | null; studentId: string }>;

    if (filters.programIds && filters.programIds.length > 0) {
      conditions.push(inArray(enrollments.programId, filters.programIds));
      results = await db
        .select(baseSelect)
        .from(parents)
        .innerJoin(students, eq(students.familyId, parents.familyId))
        .innerJoin(enrollments, eq(enrollments.studentId, students.id))
        .where(and(...conditions));
    } else {
      results = await db
        .select(baseSelect)
        .from(parents)
        .innerJoin(students, eq(students.familyId, parents.familyId))
        .where(and(...conditions));
    }

    return results
      .filter((r) => r.phone)
      .map((r) => ({
        parentId: r.parentId,
        phone: r.phone!,
        studentId: r.studentId || undefined,
      }));
  }

  async sendMessage(params: {
    tenantId: string;
    filters: AudienceFilters;
    templateId?: string;
    bodyOverride?: string;
    sentBy: string;
  }): Promise<{ messageId: string; recipientCount: number }> {
    // Resolve audience
    const audience = await this.resolveAudience(params.tenantId, params.filters);

    // Get template body if templateId is provided
    let body = params.bodyOverride || '';
    if (params.templateId && !params.bodyOverride) {
      const template = await this.getTemplate(params.tenantId, params.templateId);
      if (!template) {
        throw new Error('Template not found');
      }
      body = template.body;
    }

    if (!body) {
      throw new Error('Message body is required');
    }

    // Create message record
    const messageResult = await db
      .insert(messages)
      .values({
        tenantId: params.tenantId,
        channel: 'sms',
        templateId: params.templateId || null,
        bodySnapshot: body,
        filtersSnapshot: params.filters as Record<string, unknown>,
        audienceSizeEstimate: audience.length,
        status: 'queued',
        sentBy: params.sentBy,
      })
      .returning();

    const message = messageResult[0];

    // Create recipient records
    const recipientValues = audience.map((recipient) => ({
      messageId: message.id,
      tenantId: params.tenantId,
      parentId: recipient.parentId,
      studentId: recipient.studentId || null,
      phone: recipient.phone,
      status: 'queued',
    }));

    await db.insert(messageRecipients).values(recipientValues);

    // Dispatch SMS via provider (fire-and-forget; status updated via webhook or polling)
    if (audience.length > 0) {
      const smsPayloads = audience.map((r) => ({
        tenantId: params.tenantId,
        to: r.phone,
        body,
        tags: { tenantId: params.tenantId, messageId: message.id },
      }));

      // Run in background — don't await so the API responds quickly
      smsProviderService
        .sendSmsBatch(params.tenantId, smsPayloads)
        .then(async (responses) => {
          // Update message status
          const allSent = responses.every((r) => r.status !== 'failed');
          const anyFailed = responses.some((r) => r.status === 'failed');
          const finalStatus = allSent
            ? 'sent'
            : anyFailed && allSent === false
              ? 'partially_failed'
              : 'sent';

          await db.update(messages).set({ status: finalStatus, updatedAt: new Date() }).where(eq(messages.id, message.id));

          // Batch update recipient statuses — group by outcome (2 queries max instead of N)
          const sentIds = audience
            .filter((_, i) => responses[i]?.status !== 'failed')
            .map((r) => r.parentId);
          const failedIds = audience
            .filter((_, i) => responses[i]?.status === 'failed')
            .map((r) => r.parentId);
          const batchUpdates: Promise<unknown>[] = [];
          if (sentIds.length > 0) {
            batchUpdates.push(
              db.update(messageRecipients)
                .set({ status: 'sent', updatedAt: new Date() })
                .where(and(
                  eq(messageRecipients.messageId, message.id),
                  inArray(messageRecipients.parentId, sentIds),
                )),
            );
          }
          if (failedIds.length > 0) {
            batchUpdates.push(
              db.update(messageRecipients)
                .set({ status: 'failed', updatedAt: new Date() })
                .where(and(
                  eq(messageRecipients.messageId, message.id),
                  inArray(messageRecipients.parentId, failedIds),
                )),
            );
          }
          await Promise.all(batchUpdates);
        })
        .catch((err) => {
          console.error('[MessageService] SMS dispatch error:', err);
        });
    }

    return {
      messageId: message.id,
      recipientCount: audience.length,
    };
  }

  async previewMessage(
    tenantId: string,
    templateId: string,
    sampleData?: Record<string, string>,
  ): Promise<string> {
    const template = await this.getTemplate(tenantId, templateId);
    if (!template) {
      throw new Error('Template not found');
    }

    let body = template.body;

    // Replace placeholders with sample data
    if (sampleData) {
      for (const [key, value] of Object.entries(sampleData)) {
        body = body.replace(new RegExp(`{{${key}}}`, 'g'), value);
      }
    }

    return body;
  }

  async getMessage(
    tenantId: string,
    messageId: string,
  ): Promise<Message | null> {
    const results = await db
      .select()
      .from(messages)
      .where(
        and(eq(messages.id, messageId), eq(messages.tenantId, tenantId)),
      )
      .limit(1);

    if (results.length === 0) {
      return null;
    }

    const row = results[0];
    return {
      id: row.id,
      tenantId: row.tenantId,
      channel: row.channel as MessageChannel,
      templateId: row.templateId || undefined,
      bodySnapshot: row.bodySnapshot,
      filtersSnapshot: (row.filtersSnapshot as Record<string, unknown>) || {},
      audienceSizeEstimate: row.audienceSizeEstimate || undefined,
      status: row.status as
        | 'queued'
        | 'sending'
        | 'sent'
        | 'partially_failed'
        | 'failed',
      errorSummary: row.errorSummary || undefined,
      sentBy: row.sentBy || undefined,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  }

  async listMessages(
    tenantId: string,
    limit: number = 50,
  ): Promise<Message[]> {
    const results = await db
      .select()
      .from(messages)
      .where(eq(messages.tenantId, tenantId))
      .orderBy(desc(messages.createdAt))
      .limit(limit);

    return results.map((row) => ({
      id: row.id,
      tenantId: row.tenantId,
      channel: row.channel as MessageChannel,
      templateId: row.templateId || undefined,
      bodySnapshot: row.bodySnapshot,
      filtersSnapshot: (row.filtersSnapshot as Record<string, unknown>) || {},
      audienceSizeEstimate: row.audienceSizeEstimate || undefined,
      status: row.status as
        | 'queued'
        | 'sending'
        | 'sent'
        | 'partially_failed'
        | 'failed',
      errorSummary: row.errorSummary || undefined,
      sentBy: row.sentBy || undefined,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    }));
  }
}
