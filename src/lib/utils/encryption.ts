// Encryption utilities for tenant-level keys
// Uses AES-256-GCM with a platform-level encryption key

import { createCipheriv, createDecipheriv, randomBytes, createHash } from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 12 // 96-bit IV for GCM
const TAG_LENGTH = 16 // 128-bit auth tag
const ENCODING = 'base64url' as const

function getKey(): Buffer {
  const raw = process.env.ENCRYPTION_KEY
  if (!raw) {
    throw new Error('ENCRYPTION_KEY environment variable is not set')
  }
  // Derive a 32-byte key from the secret using SHA-256
  return createHash('sha256').update(raw).digest()
}

/**
 * Encrypts a plaintext string using AES-256-GCM.
 * Output format: base64url(iv) + '.' + base64url(ciphertext) + '.' + base64url(authTag)
 */
export async function encrypt(value: string): Promise<string> {
  const key = getKey()
  const iv = randomBytes(IV_LENGTH)
  const cipher = createCipheriv(ALGORITHM, key, iv)

  const encrypted = Buffer.concat([
    cipher.update(value, 'utf8'),
    cipher.final(),
  ])
  const authTag = cipher.getAuthTag()

  return [
    iv.toString(ENCODING),
    encrypted.toString(ENCODING),
    authTag.toString(ENCODING),
  ].join('.')
}

/**
 * Decrypts a value produced by encrypt().
 */
export async function decrypt(encryptedValue: string): Promise<string> {
  const key = getKey()
  const parts = encryptedValue.split('.')
  if (parts.length !== 3) {
    throw new Error('Invalid encrypted value format')
  }

  const [ivB64, ciphertextB64, authTagB64] = parts
  const iv = Buffer.from(ivB64, ENCODING)
  const ciphertext = Buffer.from(ciphertextB64, ENCODING)
  const authTag = Buffer.from(authTagB64, ENCODING)

  const decipher = createDecipheriv(ALGORITHM, key, iv)
  decipher.setAuthTag(authTag)

  const decrypted = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ])

  return decrypted.toString('utf8')
}

/**
 * Encrypts all string values in an object.
 * Non-string values are passed through unchanged.
 */
export async function encryptObject(
  obj: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  const result: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string' && value) {
      result[key] = await encrypt(value)
    } else {
      result[key] = value
    }
  }
  return result
}

/**
 * Decrypts all string values in an object.
 * Falls back to the original value if decryption fails (e.g. already plaintext).
 */
export async function decryptObject(
  obj: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  const result: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string' && value) {
      try {
        result[key] = await decrypt(value)
      } catch {
        result[key] = value
      }
    } else {
      result[key] = value
    }
  }
  return result
}
