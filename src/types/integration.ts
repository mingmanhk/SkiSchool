export interface StripeConfig {
  publishableKey?: string;
  secretKeyEncrypted?: string;
  webhookSecretEncrypted?: string;
}

export interface PayPalConfig {
  clientIdEncrypted?: string;
  clientSecretEncrypted?: string;
}

export interface QuickBooksConfig {
  clientIdEncrypted?: string;
  clientSecretEncrypted?: string;
  refreshTokenEncrypted?: string;
  realmId?: string;
}

export interface IntegrationConfigs {
  tenantId: string;
  payments: {
    stripe?: StripeConfig;
    paypal?: PayPalConfig;
  };
  accounting: {
    quickbooks?: QuickBooksConfig;
  };
  aiSettings: Record<string, unknown>;
  smsSettings: Record<string, unknown>;
  updatedBy?: string;
  updatedAt: string;
}
