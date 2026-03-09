import { type NextRequest } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

const locales = ['en', 'zh']
const defaultLocale = 'en'

// Routes that should NOT be locale-prefixed (portal routes, auth, etc.)
const NON_LOCALE_PREFIXES = [
  '/parent',
  '/employee',
  '/instructor',
  '/admin',
  '/login',
  '/signup',
  '/auth',
  '/instructors',
  '/privacy',
  '/terms',
]

function isNonLocaleRoute(pathname: string): boolean {
  return NON_LOCALE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(prefix + '/'),
  )
}

export async function middleware(request: NextRequest) {
  // 1. Inject x-tenant-slug header for /api/v1/[tenantSlug]/* routes
  const pathname = request.nextUrl.pathname
  const apiTenantMatch = pathname.match(/^\/api\/v1\/([^/]+)(?:\/|$)/)
  let incomingRequest = request
  if (apiTenantMatch) {
    const tenantSlug = apiTenantMatch[1]
    const headers = new Headers(request.headers)
    headers.set('x-tenant-slug', tenantSlug)
    incomingRequest = new NextRequest(request, { headers })
  }

  // 2. Handle Supabase Auth Session
  const sessionResponse = await updateSession(incomingRequest)
  if (sessionResponse.headers.get('location')) {
    return sessionResponse // Redirecting for auth
  }

  // 3. Handle Locale Routing

  // Exclude static assets, API routes, special paths, and portal routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/widget') ||
    pathname.startsWith('/scripts') ||
    pathname.includes('.') ||
    isNonLocaleRoute(pathname)
  ) {
    return sessionResponse
  }

  // Check if pathname already starts with a supported locale
  const pathnameIsMissingLocale = locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`,
  )

  if (pathnameIsMissingLocale) {
    // Detect locale from Accept-Language header, default to 'en'
    const acceptLanguage = request.headers.get('accept-language') || ''
    const detectedLocale = acceptLanguage.startsWith('zh') ? 'zh' : defaultLocale

    return NextResponse.redirect(
      new URL(`/${detectedLocale}${pathname}`, request.url),
    )
  }

  return sessionResponse
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
