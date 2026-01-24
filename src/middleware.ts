import './polyfill';
import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from './lib/supabase/middleware';

const locales = ['en', 'zh'];
const defaultLocale = 'en';

export async function middleware(request: NextRequest) {
  try {
    // 1. Redirect root to default locale
    if (request.nextUrl.pathname === '/') {
      const url = request.nextUrl.clone();
      url.pathname = `/${defaultLocale}`;
      return NextResponse.redirect(url);
    }

    // 2. Update Supabase session
    return await updateSession(request);
  } catch (err: any) {
    console.error('Middleware runtime error:', err);
    return new NextResponse(
      JSON.stringify({
        error: 'Middleware Invocation Failed',
        details: err.message,
        stack: err.stack,
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
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
