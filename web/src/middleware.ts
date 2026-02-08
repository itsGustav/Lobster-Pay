// Middleware disabled - Firebase auth is client-side
// Protected routes are handled by individual pages checking useAuth()

import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/settings/:path*',
    '/history/:path*',
    '/credit/:path*',
    '/analytics/:path*',
  ],
}
