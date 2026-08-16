import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getSessionCookie } from 'better-auth/cookies'

const AUTH_ROUTES = ['/login', '/register', '/forgot-password']

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl
  const sessionCookie = getSessionCookie(request)
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route))

  if (!sessionCookie && !isAuthRoute) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('callbackUrl', pathname + search)
    return NextResponse.redirect(loginUrl)
  }

  if (sessionCookie && isAuthRoute) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
}
