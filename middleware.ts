import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// ── Whitelist — seuls ces emails ont accès en mode maintenance ──
const OWNER_EMAILS = ['steve.moradel@gmail.com']

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Toujours laisser passer les assets et l'API publique
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/') ||
    pathname.match(/\.(svg|png|jpg|jpeg|gif|webp|ico|css|js)$/)
  ) {
    return NextResponse.next({ request })
  }

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: any[]) {
          cookiesToSet.forEach(({ name, value }: any) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }: any) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // ── Mode maintenance ──
  const maintenanceMode = process.env.MAINTENANCE_MODE === 'true'
  if (maintenanceMode) {
    const isOwner = user?.email && OWNER_EMAILS.includes(user.email)
    const isMaintenancePage = pathname === '/maintenance'
    const isLoginPage = pathname.startsWith('/login')

    if (!isOwner && !isMaintenancePage && !isLoginPage) {
      const url = request.nextUrl.clone()
      url.pathname = '/maintenance'
      return NextResponse.redirect(url)
    }
  }

  const protectedRoutes = ['/dashboard', '/settings', '/project', '/magic']
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  )

  if (isProtectedRoute && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  const authRoutes = ['/login', '/register']
  const isAuthRoute = authRoutes.some((route) =>
    pathname.startsWith(route)
  )

  if (isAuthRoute && user) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
