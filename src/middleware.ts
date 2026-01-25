// src/middleware.ts
import './polyfill';
import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from './lib/supabase/middleware';

const locales = ['en', 'zh'];
const defaultLocale = 'en';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Check if the path is the root "/"
  if (pathname === '/') {
    const url = request.nextUrl.clone();
    url.pathname = `/${defaultLocale}`;
    return NextResponse.redirect(url);
  }
  
  // 2. Check if the path is missing a locale prefix (e.g. /login, /about)
  // But ignore special paths like /api, /_next, etc. which are handled by config.matcher
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  // If it's not a localized path, and not an internal path, redirect
  // Note: we let updateSession handle internal logic, but we might want to force locale first?
  // Actually, for this app, pages are under [lang], so we likely want to redirect
  // /login -> /en/login if /login doesn't exist as a standalone route.
  // HOWEVER, updateSession handles auth logic. Let's let it run first or concurrently.
  // BUT, looking at file structure: src/app/[lang]/login/page.tsx
  // This means /login DOES NOT EXIST. /en/login exists.
  
  if (!pathnameHasLocale && !pathname.startsWith('/api') && !pathname.startsWith('/_next')) {
     // If the path is just "/login", redirect to "/en/login"
     // We need to be careful not to redirect valid unlocalized routes if they exist.
     // But in this project, main pages seem to be under [lang].
     
     // List of known pages that MUST be localized
     const knownPages = ['login', 'signup', 'privacy', 'terms'];
     const isKnownPage = knownPages.some(page => pathname === `/${page}`);
     
     if (isKnownPage) {
         const url = request.nextUrl.clone();
         url.pathname = `/${defaultLocale}${pathname}`;
         return NextResponse.redirect(url);
     }
  }

  // 3. Update Supabase session (Auth)
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
     * - api (API routes usually don't need locale, but might need auth)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
