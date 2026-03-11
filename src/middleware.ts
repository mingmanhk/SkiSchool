import { NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

const TENANT_SLUG_RE = /^[a-z0-9-]{2,63}$/

export async function middleware(request: NextRequest) {
  // 1. Inject x-tenant-slug header for /api/v1/[tenantSlug]/* routes
  const pathname = request.nextUrl.pathname
  const apiTenantMatch = pathname.match(/^\/api\/v1\/([^/]+)(?:\/|$)/)
  let incomingRequest = request
  if (apiTenantMatch) {
    const tenantSlug = apiTenantMatch[1]
    if (!TENANT_SLUG_RE.test(tenantSlug)) {
      return NextResponse.json({ error: 'Invalid tenant' }, { status: 400 })
    }
    const headers = new Headers(request.headers)
    headers.set('x-tenant-slug', tenantSlug)
    incomingRequest = new NextRequest(request, { headers })
  }

  // 2. Handle Supabase Auth Session
  return await updateSession(incomingRequest)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
