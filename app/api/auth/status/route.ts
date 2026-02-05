/**
 * Authentication Status API Route
 * Returns the current authentication status
 */

import { NextResponse } from 'next/server';
import { isAuthenticated, isGuest } from '@/lib/auth';
import { sanitizeError } from '@/lib/error-handling';

/**
 * GET /api/auth/status
 * Check authentication status
 */
export async function GET() {
  try {
    const authenticated = await isAuthenticated();
    const guest = await isGuest();

    return NextResponse.json({
      isAuthenticated: authenticated,
      isGuest: guest,
      hasAccess: authenticated || guest,
    });
  } catch (error) {
    // Sanitize error for client response
    const sanitized = sanitizeError(error, {
      endpoint: '/api/auth/status',
    });
    
    return NextResponse.json(
      {
        isAuthenticated: false,
        isGuest: false,
        hasAccess: false,
        error: sanitized.message,
        errorId: sanitized.errorId,
      },
      { status: sanitized.statusCode }
    );
  }
}

// Made with Bob