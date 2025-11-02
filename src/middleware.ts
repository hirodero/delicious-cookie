import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PUBLIC_PATHS = [
  '/',         
  '/login',
  '/register',
  '/forgot-password',
  '/verify',
  '/api/auth/login',
  '/api/auth/me',
]

function startsWithAny(pathname: string, prefixes: string[]) {
  return prefixes.some((p) => pathname.startsWith(p))
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const url = req.nextUrl
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/assets') ||
    pathname.startsWith('/public') ||
    pathname.match(/\.(png|jpg|jpeg|gif|svg|ico|webp|mp4|webm|css|js|txt|json)$/)
  ) {
    return NextResponse.next()
  }

  if (pathname.startsWith('/api/')) {
    return NextResponse.next()
  }

  if (PUBLIC_PATHS.includes(pathname)) {
    return NextResponse.next()
  }

  const token = req.cookies.get('auth_token')?.value

  if (token && token.length > 0) {
    return NextResponse.next()
  }

  const loginUrl = new URL('/login', req.url)

  loginUrl.searchParams.set('next', pathname)

  return NextResponse.redirect(loginUrl)
}

export const config = {
  matcher: [
    '/((?!_next/|.*\\..*).*)',
  ],
}
