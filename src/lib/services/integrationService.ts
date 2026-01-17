import { db } from '../db/client';
import { integration_configs } from '../db/schema';
import { eq } from 'drizzle-orm';
import { IntegrationConfigs, StripeConfig } from '../../types/integration';

export class IntegrationService {
  async getConfigs(tenantId: string): Promise<IntegrationConfigs | null> {
    const results = await db.select().from(integration_configs).where(eq(integration_configs.tenant_id, tenantId));
    if (results.length === 0) return null;
    
    const row = results[0];
    return {
      tenantId: row.tenant_id,
      payments: row.payments as any,
      accounting: row.accounting as any,
      aiSettings: row.ai_settings as any,
      smsSettings: row.sms_settings as any,
      updatedAt: row.updated_at.toISOString(),
    };
  }

  async updateStripeConfig(
    tenantId: string,
    stripe: StripeConfig,
  ): Promise<void> {
     // TODO: Encrypt sensitive fields
     const existing = await this.getConfigs(tenantId);
     const currentPayments = existing?.payments || {};
     const updatedPayments = {
         ...currentPayments,
         stripe: stripe
     };
     
     if (existing) {
         await db.update(integration_configs)
            .set({ payments: updatedPayments, updated_at: new Date() })
            .where(eq(integration_configs.tenant_id, tenantId));
     } else {
         await db.insert(integration_configs).values({
             tenant_id: tenantId,
             payments: updatedPayments,
         });
     }
  }
}
