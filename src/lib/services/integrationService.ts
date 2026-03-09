// IntegrationService: Key Vault management (Encryption/Decryption)
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { integrationConfigs } from '@/lib/db/schema_multi_tenant';
import {
  IntegrationConfigs,
  StripeConfig,
  PayPalConfig,
  QuickBooksConfig,
} from '@/types/spec';
import { encrypt, decrypt } from '@/lib/utils/encryption';
import { AuditService } from './auditService';

const auditService = new AuditService();

export class IntegrationService {
  async getConfigs(tenantId: string): Promise<IntegrationConfigs | null> {
    const results = await db
      .select()
      .from(integrationConfigs)
      .where(eq(integrationConfigs.tenantId, tenantId))
      .limit(1);

    if (results.length === 0) {
      return null;
    }

    const row = results[0];
    const paymentsBlob = (row.payments as any) || {};
    const accountingBlob = (row.accounting as any) || {};

    const stripe = paymentsBlob.stripe
      ? {
          publishableKey: paymentsBlob.stripe.publishableKey,
          secretKeyEncrypted: paymentsBlob.stripe.secretKeyEncrypted,
          webhookSecretEncrypted: paymentsBlob.stripe.webhookSecretEncrypted,
        }
      : undefined;

    const paypal = paymentsBlob.paypal
      ? {
          clientIdEncrypted: paymentsBlob.paypal.clientIdEncrypted,
          clientSecretEncrypted: paymentsBlob.paypal.clientSecretEncrypted,
        }
      : undefined;

    const quickbooks = accountingBlob.quickbooks
      ? {
          clientIdEncrypted: accountingBlob.quickbooks.clientIdEncrypted,
          clientSecretEncrypted: accountingBlob.quickbooks.clientSecretEncrypted,
          refreshTokenEncrypted: accountingBlob.quickbooks.refreshTokenEncrypted,
          realmId: accountingBlob.quickbooks.realmId,
        }
      : undefined;

    return {
      tenantId: row.tenantId,
      payments: { stripe, paypal },
      accounting: { quickbooks },
      aiSettings: (row.aiSettings as Record<string, unknown>) || {},
      smsSettings: (row.smsSettings as Record<string, unknown>) || {},
      updatedBy: row.updatedBy || undefined,
      updatedAt: row.updatedAt.toISOString(),
    };
  }

  async updateStripeConfig(
    tenantId: string,
    stripe: { publishableKey?: string; secretKey?: string; webhookSecret?: string },
    userId: string,
  ): Promise<void> {
    const existing = await this.getConfigs(tenantId);
    const paymentsBlob = (existing?.payments as any) || {};

    const encryptedStripe: Record<string, string | undefined> = {
      publishableKey: stripe.publishableKey,
    };

    if (stripe.secretKey) {
      encryptedStripe.secretKeyEncrypted = await encrypt(stripe.secretKey);
    }
    if (stripe.webhookSecret) {
      encryptedStripe.webhookSecretEncrypted = await encrypt(stripe.webhookSecret);
    }

    const updatedPayments = { ...paymentsBlob, stripe: encryptedStripe };
    await this.upsertConfigs(tenantId, {
      payments: updatedPayments,
      accounting: existing?.accounting || {},
      aiSettings: existing?.aiSettings || {},
      smsSettings: existing?.smsSettings || {},
      updatedBy: userId,
    });

    await auditService.logIntegrationChange(tenantId, userId, 'stripe', existing?.payments?.stripe ? 'updated' : 'created');
  }

  async updatePayPalConfig(
    tenantId: string,
    paypal: { clientId?: string; clientSecret?: string },
    userId: string,
  ): Promise<void> {
    const existing = await this.getConfigs(tenantId);
    const paymentsBlob = (existing?.payments as any) || {};

    const encryptedPayPal: Record<string, string | undefined> = {};
    if (paypal.clientId) {
      encryptedPayPal.clientIdEncrypted = await encrypt(paypal.clientId);
    }
    if (paypal.clientSecret) {
      encryptedPayPal.clientSecretEncrypted = await encrypt(paypal.clientSecret);
    }

    const updatedPayments = { ...paymentsBlob, paypal: encryptedPayPal };
    await this.upsertConfigs(tenantId, {
      payments: updatedPayments,
      accounting: existing?.accounting || {},
      aiSettings: existing?.aiSettings || {},
      smsSettings: existing?.smsSettings || {},
      updatedBy: userId,
    });

    await auditService.logIntegrationChange(tenantId, userId, 'paypal', existing?.payments?.paypal ? 'updated' : 'created');
  }

  async updateQuickBooksConfig(
    tenantId: string,
    qb: { clientId?: string; clientSecret?: string; refreshToken?: string; realmId?: string },
    userId: string,
  ): Promise<void> {
    const existing = await this.getConfigs(tenantId);
    const accountingBlob = (existing?.accounting as any) || {};

    const encryptedQB: Record<string, string | undefined> = {
      realmId: qb.realmId,
    };
    if (qb.clientId) encryptedQB.clientIdEncrypted = await encrypt(qb.clientId);
    if (qb.clientSecret) encryptedQB.clientSecretEncrypted = await encrypt(qb.clientSecret);
    if (qb.refreshToken) encryptedQB.refreshTokenEncrypted = await encrypt(qb.refreshToken);

    const updatedAccounting = { ...accountingBlob, quickbooks: encryptedQB };
    await this.upsertConfigs(tenantId, {
      payments: existing?.payments || {},
      accounting: updatedAccounting,
      aiSettings: existing?.aiSettings || {},
      smsSettings: existing?.smsSettings || {},
      updatedBy: userId,
    });

    await auditService.logIntegrationChange(tenantId, userId, 'quickbooks', existing?.accounting?.quickbooks ? 'updated' : 'created');
  }

  async getStripeSecretKey(tenantId: string): Promise<string | null> {
    const config = await this.getStripeConfig(tenantId);
    if (!config?.secretKeyEncrypted) return null;
    return decrypt(config.secretKeyEncrypted);
  }

  async getStripeConfig(tenantId: string): Promise<StripeConfig | null> {
    const configs = await this.getConfigs(tenantId);
    return configs?.payments?.stripe || null;
  }

  async getPayPalConfig(tenantId: string): Promise<PayPalConfig | null> {
    const configs = await this.getConfigs(tenantId);
    return configs?.payments?.paypal || null;
  }

  async getQuickBooksConfig(tenantId: string): Promise<QuickBooksConfig | null> {
    const configs = await this.getConfigs(tenantId);
    return configs?.accounting?.quickbooks || null;
  }

  private async upsertConfigs(
    tenantId: string,
    configs: {
      payments: any;
      accounting: any;
      aiSettings: Record<string, unknown>;
      smsSettings: Record<string, unknown>;
      updatedBy: string;
    },
  ): Promise<void> {
    const existing = await db
      .select()
      .from(integrationConfigs)
      .where(eq(integrationConfigs.tenantId, tenantId))
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(integrationConfigs)
        .set({
          payments: configs.payments,
          accounting: configs.accounting,
          aiSettings: configs.aiSettings,
          smsSettings: configs.smsSettings,
          updatedBy: configs.updatedBy,
          updatedAt: new Date(),
        })
        .where(eq(integrationConfigs.tenantId, tenantId));
    } else {
      await db.insert(integrationConfigs).values({
        tenantId,
        payments: configs.payments,
        accounting: configs.accounting,
        aiSettings: configs.aiSettings,
        smsSettings: configs.smsSettings,
        updatedBy: configs.updatedBy,
      });
    }
  }
}
