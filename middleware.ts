import { NextRequest, NextResponse } from 'next/server'

// Basic middleware that ensures dashboard subpaths are protected.
// NOTE: To fully enable Clerk auth middleware, follow Clerk docs and replace this logic.
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  if (pathname.startsWith('/dashboard')) {
    const hasSession = req.cookies.get('__session') || req.cookies.get('__clerk_session')
    if (!hasSession) {
      const url = req.nextUrl.clone()
      url.pathname = '/sign-in'
      return NextResponse.redirect(url)
    }
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*']
}
