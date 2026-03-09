import { describe, it, expect, beforeAll } from 'vitest'
import { encrypt, decrypt, encryptObject, decryptObject } from '@/lib/utils/encryption'

describe('encryption', () => {
  describe('encrypt / decrypt', () => {
    it('round-trips a plaintext string', async () => {
      const plaintext = 'sk_live_supersecretstripekey_12345'
      const ciphertext = await encrypt(plaintext)

      expect(ciphertext).not.toBe(plaintext)
      expect(ciphertext.split('.').length).toBe(3) // iv.ciphertext.tag

      const decrypted = await decrypt(ciphertext)
      expect(decrypted).toBe(plaintext)
    })

    it('produces unique ciphertext on each call (random IV)', async () => {
      const plaintext = 'same-value'
      const c1 = await encrypt(plaintext)
      const c2 = await encrypt(plaintext)
      expect(c1).not.toBe(c2)
    })

    it('throws on tampered ciphertext', async () => {
      const ciphertext = await encrypt('secret')
      const parts = ciphertext.split('.')
      parts[1] = 'TAMPERED' + parts[1]
      await expect(decrypt(parts.join('.'))).rejects.toThrow()
    })

    it('throws on invalid format', async () => {
      await expect(decrypt('notvalid')).rejects.toThrow('Invalid encrypted value format')
    })
  })

  describe('encryptObject / decryptObject', () => {
    it('encrypts string values and leaves non-strings unchanged', async () => {
      const obj = { key: 'secret', count: 42, flag: true, empty: '' }
      const encrypted = await encryptObject(obj)

      expect(encrypted.key).not.toBe('secret')
      expect(encrypted.count).toBe(42)
      expect(encrypted.flag).toBe(true)
      expect(encrypted.empty).toBe('') // empty string not encrypted
    })

    it('round-trips an object', async () => {
      const obj = { clientId: 'my-client-id', clientSecret: 'my-secret' }
      const encrypted = await encryptObject(obj)
      const decrypted = await decryptObject(encrypted)

      expect(decrypted.clientId).toBe(obj.clientId)
      expect(decrypted.clientSecret).toBe(obj.clientSecret)
    })
  })
})
