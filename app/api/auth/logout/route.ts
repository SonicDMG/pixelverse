/**
 * Logout API Route
 * Clears authentication cookie and logs out the user
 */

import { NextResponse } from 'next/server';
import { clearAuthCookie } from '@/lib/auth';
import { sanitizeError } from '@/lib/error-handling';

/**
 * POST /api/auth/logout
 * Log out the current user
 */
export async function POST() {
  try {
    // Clear the authentication cookie
    await clearAuthCookie();

    return NextResponse.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    // Sanitize error for client response
    const sanitized = sanitizeError(error, {
      endpoint: '/api/auth/logout',
    });
    
    return NextResponse.json(
      {
        success: false,
        error: sanitized.message,
        errorId: sanitized.errorId,
      },
      { status: sanitized.statusCode }
    );
  }
}

/**
 * GET /api/auth/logout
 * Not allowed - only POST is supported
 */
export async function GET() {
  return NextResponse.json(
    {
      success: false,
      error: 'Method not allowed',
    },
    { status: 405 }
  );
}

// Made with Bob