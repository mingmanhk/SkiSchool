import './src/polyfill';
import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from './src/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  try {
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
