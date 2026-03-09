// Global test setup
// Provide required environment variables before any module is loaded
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db'
process.env.ENCRYPTION_KEY = 'test-encryption-key-32-chars-long!'
process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000'
process.env.TWILIO_ACCOUNT_SID = 'ACtest'
process.env.TWILIO_AUTH_TOKEN = 'testtoken'
process.env.TWILIO_FROM_NUMBER = '+15005550006'
