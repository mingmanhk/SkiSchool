// src/lib/supabase/middleware.ts
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { env } from '@/lib/env';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
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

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser();

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
  
  // Check if the current path is public
  // Strict matching to prevent overly broad access
  const isPublicRoute = publicRoutes.some(route => 
    request.nextUrl.pathname === route || 
    request.nextUrl.pathname.startsWith(`${route}/`)
  );
  
  // Check if accessing protected routes (app, employee, parent, admin, instructor)
  const isProtectedRoute = ['/app/', '/employee/', '/parent/', '/admin/', '/instructor/'].some(route =>
    request.nextUrl.pathname.startsWith(route) ||
    request.nextUrl.pathname.match(new RegExp(`^/(en|zh)${route}`))
  );

  // Only redirect to login if:
  // 1. User is not authenticated
  // 2. Trying to access a protected route
  // 3. Not already on a public route
  if (!user && isProtectedRoute && !isPublicRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is. If you're
  // creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  return supabaseResponse;
}
