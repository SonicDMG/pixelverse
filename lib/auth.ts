/**
 * Authentication utilities for HTTP Basic Auth
 * Provides password validation, rate limiting, and secure cookie management
 */

import { cookies } from 'next/headers';

// Rate limiting store (in-memory for simplicity)
// In production, use Redis or similar distributed cache
const loginAttempts = new Map<string, { count: number; resetAt: number }>();

// Constants
const MAX_LOGIN_ATTEMPTS = 5;
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const AUTH_COOKIE_NAME = 'pixelverse_auth';
const GUEST_COOKIE_NAME = 'pixelverse_guest';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

/**
 * Rate limiting for login attempts
 * @param ip - Client IP address
 * @returns true if rate limit exceeded, false otherwise
 */
export function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const attempts = loginAttempts.get(ip);

  if (!attempts) {
    return false;
  }

  // Reset if window has passed
  if (now > attempts.resetAt) {
    loginAttempts.delete(ip);
    return false;
  }

  return attempts.count >= MAX_LOGIN_ATTEMPTS;
}

/**
 * Record a login attempt
 * @param ip - Client IP address
 */
export function recordLoginAttempt(ip: string): void {
  const now = Date.now();
  const attempts = loginAttempts.get(ip);

  if (!attempts || now > attempts.resetAt) {
    loginAttempts.set(ip, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    });
  } else {
    attempts.count++;
  }
}

/**
 * Reset login attempts for an IP (on successful login)
 * @param ip - Client IP address
 */
export function resetLoginAttempts(ip: string): void {
  loginAttempts.delete(ip);
}

/**
 * Validate password against environment variable
 * @param password - Password to validate
 * @returns true if password is correct
 */
export function validatePassword(password: string): boolean {
  const correctPassword = process.env.AUTH_PASSWORD;
  
  if (!correctPassword) {
    console.error('AUTH_PASSWORD environment variable is not set');
    return false;
  }

  // Use timing-safe comparison to prevent timing attacks
  return timingSafeEqual(password, correctPassword);
}

/**
 * Timing-safe string comparison to prevent timing attacks
 * @param a - First string
 * @param b - Second string
 * @returns true if strings are equal
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return result === 0;
}

/**
 * Set authentication cookie
 */
export async function setAuthCookie(): Promise<void> {
  const cookieStore = await cookies();
  
  // Generate a simple token (in production, use JWT or similar)
  const token = Buffer.from(`authenticated:${Date.now()}`).toString('base64');
  
  cookieStore.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE,
    path: '/',
  });
}

/**
 * Check if user is authenticated via cookie
 * @returns true if authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get(AUTH_COOKIE_NAME);
  
  if (!authCookie) {
    return false;
  }

  try {
    // Validate token format
    const decoded = Buffer.from(authCookie.value, 'base64').toString();
    return decoded.startsWith('authenticated:');
  } catch {
    return false;
  }
}

/**
 * Check if user has guest access via cookie
 * @returns true if guest session exists
 */
export async function isGuest(): Promise<boolean> {
  const cookieStore = await cookies();
  const guestCookie = cookieStore.get(GUEST_COOKIE_NAME);
  
  if (!guestCookie) {
    return false;
  }

  try {
    // Validate token format
    const decoded = Buffer.from(guestCookie.value, 'base64').toString();
    return decoded.startsWith('guest:');
  } catch {
    return false;
  }
}

/**
 * Check if user has any access (authenticated or guest)
 * @returns true if user has access
 */
export async function hasAccess(): Promise<boolean> {
  const authenticated = await isAuthenticated();
  if (authenticated) return true;
  
  const guest = await isGuest();
  return guest;
}

/**
 * Clear authentication cookie
 */
export async function clearAuthCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE_NAME);
  cookieStore.delete(GUEST_COOKIE_NAME);
}

/**
 * Get client IP address from request headers
 * @param headers - Request headers
 * @returns Client IP address
 */
export function getClientIp(headers: Headers): string {
  // Check various headers for IP address
  const forwarded = headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  const realIp = headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  // Fallback to a default (for local development)
  return '127.0.0.1';
}

/**
 * Log authentication attempt
 * @param ip - Client IP address
 * @param success - Whether the attempt was successful
 */
export function logAuthAttempt(ip: string, success: boolean): void {
  const timestamp = new Date().toISOString();
  const status = success ? 'SUCCESS' : 'FAILED';
  console.log(`[AUTH] ${timestamp} - ${status} login attempt from ${ip}`);
}

// Made with Bob