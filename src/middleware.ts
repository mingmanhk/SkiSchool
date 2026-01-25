// src/middleware.ts
import './polyfill';
import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from './lib/supabase/middleware';

// Hardcoded for now to match i18n/settings.ts
const locales = ['en', 'zh'];
const defaultLocale = 'en';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Root Path Redirect
  // If user visits /, immediately redirect to /en
  if (pathname === '/') {
    const url = request.nextUrl.clone();
    url.pathname = `/${defaultLocale}`;
    return NextResponse.redirect(url);
  }

  // 2. Check for missing locale prefix on pages that SHOULD be localized.
  // We check if the path starts with a locale.
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  // If path is NOT localized, and it is NOT an API route, static file, or image
  if (!pathnameHasLocale && !pathname.startsWith('/api') && !pathname.startsWith('/_next')) {
    // We only want to redirect specific "public" pages that we know exist under [lang]
    // Checking file structure: src/app/[lang]/login, src/app/[lang]/signup, etc.
    const pagesToLocalize = ['login', 'signup', 'privacy', 'terms', 'contact'];
    
    // Check if the current path matches one of these pages (e.g. /login)
    const isPublicPage = pagesToLocalize.some(page => pathname === `/${page}`);

    if (isPublicPage) {
      const url = request.nextUrl.clone();
      url.pathname = `/${defaultLocale}${pathname}`;
      return NextResponse.redirect(url);
    }
  }

  // 3. Supabase Auth & Session Management
  // This updates cookies and handles protected route redirection
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
