import { authMiddleware } from '@clerk/nextjs/server'

// Use Clerk's official middleware to require authentication for dashboard routes.
// See Clerk docs for more advanced configuration: https://docs.clerk.com
export default authMiddleware()

export const config = {
  matcher: ['/dashboard/:path*']
}
