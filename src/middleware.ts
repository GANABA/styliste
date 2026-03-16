import { getToken } from 'next-auth/jwt'
import { NextRequest, NextResponse } from 'next/server'

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  const { pathname } = req.nextUrl

  // Protéger les routes /dashboard/* — requiert une session authentifiée
  if (pathname.startsWith('/dashboard')) {
    if (!token) {
      const loginUrl = new URL('/login', req.url)
      loginUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }
    return NextResponse.next()
  }

  // Protéger les routes /admin/* — requiert le rôle ADMIN
  if (pathname.startsWith('/admin')) {
    if (!token) {
      const loginUrl = new URL('/login', req.url)
      loginUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }
    if (token.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*'],
}
