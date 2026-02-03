import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const isAuthPage = request.nextUrl.pathname.startsWith('/login');
  const isProtectedRoute = !isAuthPage && !request.nextUrl.pathname.startsWith('/_next');

  if (isProtectedRoute && !token) {
    // Check localStorage is not available in middleware, so we'll handle this client-side
    // For now, allow the request and handle auth in the component
  }

  if (isAuthPage && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
