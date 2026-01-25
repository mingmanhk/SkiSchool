// src/lib/supabase/middleware.ts
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { env } from '../env';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  // During build or if env vars are missing, provide fallbacks to prevent crash
  // IMPORTANT: For production, we prefer valid values, but during build or incomplete config, 
  // we must not crash the middleware.
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const key = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // If credentials are strictly missing, we can't do auth, but we should not crash the request.
  // We just return the response as is (unauthenticated).
  if (!url || !key || url === 'https://placeholder.supabase.co' || key === 'placeholder') {
    // console.warn('Supabase credentials missing in middleware. Auth skipped.');
    return supabaseResponse;
  }

  let supabase;
  try {
    supabase = createServerClient(
      url,
      key,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              request.cookies.set(name, value)
            );
            supabaseResponse = NextResponse.next({
              request,
            });
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            );
          },
        },
      }
    );
  } catch (error) {
    console.error('Error creating Supabase client in middleware:', error);
    return supabaseResponse;
  }

  let user = null;
  try {
    const {
      data: { user: supabaseUser },
    } = await supabase.auth.getUser();
    user = supabaseUser;
  } catch (error) {
    // This is expected if the token is invalid or expired
    // console.error('Error getting user in middleware:', error);
  }

  // Define protected routes pattern
  // Check if accessing protected routes (app, employee, parent, admin, instructor)
  const isProtectedRoute = ['/app/', '/employee/', '/parent/', '/admin/', '/instructor/'].some(route =>
    request.nextUrl.pathname.startsWith(route) ||
    request.nextUrl.pathname.match(new RegExp(`^/(en|zh)${route}`))
  );

  // Define public routes that don't require authentication
  const publicRoutes = [
    '/login',
    '/signup',
    '/auth',
    '/privacy',
    '/terms',
    // Allow localized versions of public routes
    '/en/login', '/zh/login',
    '/en/signup', '/zh/signup',
    '/en/privacy', '/zh/privacy',
    '/en/terms', '/zh/terms',
  ];
  
  const isPublicRoute = publicRoutes.some(route => 
    request.nextUrl.pathname === route || 
    request.nextUrl.pathname.startsWith(`${route}/`)
  );

  // Redirect to login if unauthenticated and on a protected route
  if (!user && isProtectedRoute && !isPublicRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
