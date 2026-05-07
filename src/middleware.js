import { NextResponse } from 'next/server';

export function middleware(request) {
  // Only run on API routes that need authentication
  if (!request.nextUrl.pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  // Public API routes that don't need authentication
  const publicRoutes = [
    '/api/auth/login',
    '/api/auth/register',
    '/api/reports/public',
    '/api/moderate-image'
  ];

  if (publicRoutes.some(route => request.nextUrl.pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Get user ID from cookie (set during login)
  const userId = request.cookies.get('userId')?.value;

  // Clone headers and add user ID if available
  const requestHeaders = new Headers(request.headers);
  if (userId) {
    requestHeaders.set('x-user-id', userId);
    return NextResponse.next({
      request: { headers: requestHeaders }
    });
  }

  // If no userId cookie, return 401 for protected routes
  return new NextResponse(
    JSON.stringify({ success: false, message: 'Authentication required' }),
    { status: 401, headers: { 'content-type': 'application/json' } }
  );
}

export const config = {
  matcher: '/api/:path*',
};