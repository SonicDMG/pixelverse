/**
 * Authentication Status API Route
 * Returns the current authentication status
 */

import { NextResponse } from 'next/server';
import { isAuthenticated, isGuest } from '@/lib/auth';

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
    console.error('Status check error:', error);
    return NextResponse.json(
      {
        isAuthenticated: false,
        isGuest: false,
        hasAccess: false,
        error: 'Failed to check authentication status',
      },
      { status: 500 }
    );
  }
}

// Made with Bob