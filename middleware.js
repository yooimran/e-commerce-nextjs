import { NextResponse } from 'next/server'

export function middleware(request) {
  // Only protect dashboard routes - API routes should be handled by the endpoints themselves
  const { pathname } = request.nextUrl
  
  if (pathname.startsWith('/dashboard')) {
    // For dashboard routes, we'll let the client-side Firebase auth handle protection
    // This middleware is just a placeholder now
    return NextResponse.next()
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*"]
}
