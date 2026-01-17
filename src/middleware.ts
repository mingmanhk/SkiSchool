import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

const locales = ['en', 'zh']
const defaultLocale = 'en'

export async function middleware(request: NextRequest) {
  // 1. Handle Supabase Auth Session
  const sessionResponse = await updateSession(request)
  if (sessionResponse.headers.get('location')) {
    return sessionResponse // Redirecting for auth
  }

  // 2. Handle Locale Routing
  const pathname = request.nextUrl.pathname
  
  // Exclude static assets, API routes, and special paths
  if (
    pathname.startsWith('/_next') || 
    pathname.startsWith('/api') || 
    pathname.startsWith('/widget') || 
    pathname.startsWith('/auth') || 
    pathname.startsWith('/login') || 
    pathname.startsWith('/signup') || 
    pathname.includes('.')
  ) {
    return sessionResponse
  }

  // Check if pathname starts with a locale
  const pathnameIsMissingLocale = locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  )

  if (pathnameIsMissingLocale) {
    const locale = defaultLocale // In a real app, detect from headers 'accept-language'
    
    // Redirect to the same path with locale prefix
    return NextResponse.redirect(
      new URL(`/${locale}${pathname}`, request.url)
    )
  }

  return sessionResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
