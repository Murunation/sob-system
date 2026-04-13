import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const pathname = req.nextUrl.pathname

    // Role-based redirect шалгалт
    if (pathname.startsWith('/admin') && token?.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/login', req.url))
    }
    if (pathname.startsWith('/teacher') && token?.role !== 'TEACHER') {
      return NextResponse.redirect(new URL('/login', req.url))
    }
    if (pathname.startsWith('/chef') && token?.role !== 'CHEF') {
      return NextResponse.redirect(new URL('/login', req.url))
    }
    if (pathname.startsWith('/parent') && token?.role !== 'PARENT') {
      return NextResponse.redirect(new URL('/login', req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
)

export const config = {
  matcher: ['/admin/:path*', '/teacher/:path*', '/chef/:path*', '/parent/:path*'],
}