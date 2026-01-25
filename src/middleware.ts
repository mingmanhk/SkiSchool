import './polyfill';
import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from './lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  try {
    // 1. Redirect root to default locale (/en)
    if (request.nextUrl.pathname === '/') {
      const url = request.nextUrl.clone();
      url.pathname = '/en';
      return NextResponse.redirect(url);
    }

    // 2. Update Supabase session
    // This handles auth token refreshing and route protection
    return await updateSession(request);
    
  } catch (err: any) {
    console.error('Middleware runtime error:', err);
    // In production, we should try to fail open (allow request) rather than blocking everything
    // if a non-critical error occurs. However, critical auth errors might need handling.
    // For now, returning next() ensures the site at least loads even if auth is glitchy.
    return NextResponse.next({
      request: {
        headers: request.headers,
      },
    });
  }
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
