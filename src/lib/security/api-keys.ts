
import { createHmac, randomBytes, timingSafeEqual } from 'crypto';

/**
 * Generates a secure API key for a tenant.
 * Format: sso_live_[random_32_chars]
 */
export function generateApiKey() {
  const prefix = 'sso_live_';
  const buffer = randomBytes(24); // 24 bytes = 48 hex chars approx
  const key = prefix + buffer.toString('hex');
  return key;
}

/**
 * Hashes an API key for storage.
 * Uses SHA-256.
 */
export function hashApiKey(key: string): string {
  return createHmac('sha256', process.env.API_KEY_SECRET || 'fallback-secret')
    .update(key)
    .digest('hex');
}

/**
 * Verifies a provided API key against a stored hash.
 * Uses constant-time comparison to prevent timing attacks.
 */
export function verifyApiKey(providedKey: string, storedHash: string): boolean {
  const hash = hashApiKey(providedKey);
  const hashBuffer = Buffer.from(hash, 'hex');
  const storedHashBuffer = Buffer.from(storedHash, 'hex');

  if (hashBuffer.length !== storedHashBuffer.length) {
    return false;
  }

  return timingSafeEqual(hashBuffer, storedHashBuffer);
}

/**
 * Mask an API key for display.
 * Example: sso_live_...a1b2
 */
export function maskApiKey(key: string): string {
  if (key.length < 8) return '****';
  return key.substring(0, 8) + '...' + key.substring(key.length - 4);
}
