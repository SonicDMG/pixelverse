/**
 * Guest Access API Route
 * Sets a guest session cookie for limited access
 */

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const GUEST_COOKIE_NAME = 'pixelverse_guest';
const COOKIE_MAX_AGE = 60 * 60 * 24; // 24 hours

/**
 * POST /api/auth/guest
 * Create a guest session
 */
export async function POST() {
  try {
    const cookieStore = await cookies();
    
    // Generate a guest token
    const guestToken = Buffer.from(`guest:${Date.now()}`).toString('base64');
    
    cookieStore.set(GUEST_COOKIE_NAME, guestToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: COOKIE_MAX_AGE,
      path: '/',
    });

    return NextResponse.json({
      success: true,
      message: 'Guest session created',
    });
  } catch (error) {
    console.error('Guest session error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'An error occurred creating guest session',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/auth/guest
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