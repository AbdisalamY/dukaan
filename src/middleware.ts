// src/middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Paths that require authentication
const authPaths = [
  '/shop',
  '/admin',
];

// Paths that are accessible without authentication
const publicPaths = [
  '/',
  '/sign-in',
  '/sign-up',
  '/forgot-password',
  '/reset-password',
  '/api/auth/callback',
];

// Check if the path requires authentication
const requiresAuth = (path: string) => {
  return authPaths.some(authPath => path.startsWith(authPath));
};

// Check if the path is a public path that doesn't require authentication
const isPublicPath = (path: string) => {
  return publicPaths.some(publicPath => path === publicPath || path.startsWith(publicPath));
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip middleware for static files and API routes that handle their own auth
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/images') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/api/auth')
  ) {
    return NextResponse.next();
  }
  
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });
  
  const isAuthenticated = !!token;
  
  // Get the user role from the token
  const userRole = token?.user?.role || null;
  
  // Redirect authenticated users away from auth pages
  if (isAuthenticated && isPublicPath(pathname)) {
    if (userRole === 'admin') {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    } else {
      return NextResponse.redirect(new URL('/shop/dashboard', request.url));
    }
  }
  
  // Redirect unauthenticated users to sign in page
  if (!isAuthenticated && requiresAuth(pathname)) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }
  
  // Check role-based access
  if (isAuthenticated && pathname.startsWith('/admin') && userRole !== 'admin') {
    // Redirect non-admin users trying to access admin pages
    return NextResponse.redirect(new URL('/shop/dashboard', request.url));
  }
  
  return NextResponse.next();
}