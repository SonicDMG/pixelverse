/**
 * Authentication API Route
 * Handles login requests with rate limiting and secure cookie management
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  validatePassword,
  setAuthCookie,
  isRateLimited,
  recordLoginAttempt,
  resetLoginAttempts,
  getClientIp,
  logAuthAttempt,
} from '@/lib/auth';

/**
 * POST /api/auth/login
 * Authenticate user with password
 */
export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const clientIp = getClientIp(request.headers);

    // Check rate limiting
    if (isRateLimited(clientIp)) {
      logAuthAttempt(clientIp, false);
      return NextResponse.json(
        {
          success: false,
          error: 'Too many login attempts. Please try again later.',
        },
        { status: 429 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { password } = body;

    // Validate input
    if (!password || typeof password !== 'string') {
      recordLoginAttempt(clientIp);
      logAuthAttempt(clientIp, false);
      return NextResponse.json(
        {
          success: false,
          error: 'Password is required',
        },
        { status: 400 }
      );
    }

    // Validate password
    const isValid = validatePassword(password);

    if (!isValid) {
      recordLoginAttempt(clientIp);
      logAuthAttempt(clientIp, false);
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid password',
        },
        { status: 401 }
      );
    }

    // Password is correct - set auth cookie
    await setAuthCookie();
    resetLoginAttempts(clientIp);
    logAuthAttempt(clientIp, true);

    return NextResponse.json({
      success: true,
      message: 'Authentication successful',
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'An error occurred during authentication',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/auth/login
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