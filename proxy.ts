/**
 * Next.js Proxy for Authentication
 * - Public routes: No auth required
 * - Guest routes: Guest or authenticated access allowed
 * - Protected routes: Only authenticated users (test pages)
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { isAuthenticated, hasAccess } from './lib/auth';

// Routes that don't require any authentication
const PUBLIC_ROUTES = [
  '/api/auth/login',
  '/api/auth/logout',
  '/api/auth/guest',
  '/api/auth/status',
  '/auth',
];

// Patterns for public assets
const PUBLIC_PATTERNS = [
  /^\/_next\//,           // Next.js internal files
  /^\/favicon\.ico$/,     // Favicon
  /^\/.*\.(svg|png|jpg|jpeg|gif|webp|ico)$/i, // Images
  /^\/audio\//,           // Audio files
];

// Routes that require full authentication (no guest access)
const PROTECTED_PATTERNS = [
  /^\/test-/,             // All test pages
];

/**
 * Check if a path is public (doesn't require any auth)
 */
function isPublicPath(pathname: string): boolean {
  // Check exact matches
  if (PUBLIC_ROUTES.includes(pathname)) {
    return true;
  }

  // Check patterns
  return PUBLIC_PATTERNS.some(pattern => pattern.test(pathname));
}

/**
 * Check if a path requires full authentication (no guest access)
 */
function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PATTERNS.some(pattern => pattern.test(pathname));
}

/**
 * Proxy function (formerly middleware)
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes and assets
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  // Check if this is a protected route (test pages)
  if (isProtectedPath(pathname)) {
    // Require full authentication for test pages
    const authenticated = await isAuthenticated();
    
    if (!authenticated) {
      const authUrl = new URL('/auth', request.url);
      authUrl.searchParams.set('redirect', pathname);
      authUrl.searchParams.set('protected', 'true');
      return NextResponse.redirect(authUrl);
    }
    
    return NextResponse.next();
  }

  // For all other routes, allow guest or authenticated access
  const access = await hasAccess();

  if (!access) {
    // Redirect to auth page with guest option
    const authUrl = new URL('/auth', request.url);
    authUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(authUrl);
  }

  // User has access, allow request
  return NextResponse.next();
}

/**
 * Configure which routes the proxy runs on
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};

// Made with Bob