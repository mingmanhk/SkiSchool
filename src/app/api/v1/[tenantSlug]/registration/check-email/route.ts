import { NextRequest } from 'next/server'
import { apiSuccess, apiError } from '@/lib/api/response'
import { TenantService } from '@/lib/services/tenantService'
import { RegistrationService } from '@/lib/services/registrationService'
import { checkEmailSchema } from '@/lib/validation/schemas'

const tenantService = new TenantService()
const registrationService = new RegistrationService()

// Simple in-memory rate limiter: 10 requests per IP per 60s window
// Provides per-instance protection; for multi-instance use a shared KV store.
const RATE_LIMIT = 10
const WINDOW_MS = 60_000
const rateLimitStore = new Map<string, { count: number; windowStart: number }>()

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimitStore.get(ip)
  if (!entry || now - entry.windowStart > WINDOW_MS) {
    rateLimitStore.set(ip, { count: 1, windowStart: now })
    return false
  }
  if (entry.count >= RATE_LIMIT) return true
  entry.count++
  return false
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ tenantSlug: string }> },
) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  if (isRateLimited(ip)) {
    return apiError('Too many requests', 429)
  }

  const { tenantSlug } = await params

  const tenant = await tenantService.getTenantBySlug(tenantSlug)
  if (!tenant) return apiError('Tenant not found', 404)

  const body = await request.json()
  const parsed = checkEmailSchema.safeParse(body)
  if (!parsed.success) {
    return apiError(parsed.error.issues.map((i) => i.message).join(', '), 400)
  }

  const classification = await registrationService.classifyEmail(
    tenant.id,
    parsed.data.email,
  )

  return apiSuccess({ classification, email: parsed.data.email })
}
