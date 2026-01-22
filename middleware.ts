import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
// import { createServerClient } from '@supabase/ssr'

const locales = ['en', 'zh']
const defaultLocale = 'en'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Supabase Auth Logic - Temporarily disabled to resolve Vercel Edge Runtime Error (__dirname)
  // The import '@supabase/ssr' causes module resolution issues in this environment.
  // We will re-enable auth logic once the dependency issue is resolved.
  /*
  try {
     const url = process.env.NEXT_PUBLIC_SUPABASE_URL
     const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
     
     if (url && key && url !== 'https://placeholder.supabase.co') {
        const supabase = createServerClient(
          url,
          key,
          {
            cookies: {
              getAll() {
                return request.cookies.getAll()
              },
              setAll(cookiesToSet) {
                cookiesToSet.forEach(({ name, value, options }) =>
                  request.cookies.set(name, value)
                )
                response = NextResponse.next({
                  request,
                })
                cookiesToSet.forEach(({ name, value, options }) =>
                  response.cookies.set(name, value, options)
                )
              },
            },
          }
        )
        
        const { data: { user } } = await supabase.auth.getUser()

        // Protected Routes Logic
        const pathname = request.nextUrl.pathname
        const publicRoutes = [
          '/login', '/signup', '/auth', '/privacy', '/terms',
          '/en/login', '/zh/login', '/en/signup', '/zh/signup',
          '/en/privacy', '/zh/privacy', '/en/terms', '/zh/terms',
        ]
        const isPublicRoute = publicRoutes.some(route => 
          pathname === route || pathname.startsWith(`${route}/`)
        )
        const isProtectedRoute = ['/app/', '/employee/', '/parent/', '/admin/', '/instructor/'].some(route =>
          pathname.startsWith(route) || pathname.match(new RegExp(`^/(en|zh)${route}`))
        )

        if (!user && isProtectedRoute && !isPublicRoute) {
          const url = request.nextUrl.clone()
          url.pathname = '/login'
          return NextResponse.redirect(url)
        }
     }
  } catch (e) {
      console.error("Middleware Auth Error:", e)
  }
  */

  // Locale Logic
  const pathname = request.nextUrl.pathname
  
  if (
    pathname.startsWith('/_next') || 
    pathname.startsWith('/api') || 
    pathname.startsWith('/widget') || 
    pathname.startsWith('/auth') || 
    pathname.startsWith('/login') || 
    pathname.startsWith('/signup') || 
    pathname.includes('.')
  ) {
    return response
  }

  const pathnameIsMissingLocale = locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  )

  if (pathnameIsMissingLocale) {
    const locale = defaultLocale
    const url = new URL(request.url)
    url.pathname = `/${locale}${pathname === '/' ? '' : pathname}`
    
    const redirectResponse = NextResponse.redirect(url)
    
    const cookies = response.cookies.getAll()
    cookies.forEach(c => redirectResponse.cookies.set(c.name, c.value))
    
    return redirectResponse
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
