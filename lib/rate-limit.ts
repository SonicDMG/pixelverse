/**
 * Rate Limiting Middleware for API Endpoints
 * Provides configurable rate limiting with support for:
 * - Request-based rate limiting (requests per time window)
 * - Concurrent connection limiting (for streaming endpoints)
 * - IP-based tracking
 * - Automatic cleanup of expired entries
 */

// Types
export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
  retryAfter?: number;
}

export interface RateLimitConfig {
  limit: number;
  windowMs: number;
}

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

interface ConnectionRecord {
  count: number;
  connections: Set<string>;
}

// In-memory stores
const requestStore = new Map<string, RateLimitRecord>();
const connectionStore = new Map<string, ConnectionRecord>();

// Cleanup interval (run every 5 minutes)
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;
let cleanupTimer: NodeJS.Timeout | null = null;

/**
 * Start automatic cleanup of expired entries
 */
function startCleanup(): void {
  if (cleanupTimer) return;
  
  cleanupTimer = setInterval(() => {
    const now = Date.now();
    
    // Clean up expired request records
    for (const [key, record] of requestStore.entries()) {
      if (now > record.resetTime) {
        requestStore.delete(key);
      }
    }
    
    // Clean up empty connection records
    for (const [key, record] of connectionStore.entries()) {
      if (record.count === 0 && record.connections.size === 0) {
        connectionStore.delete(key);
      }
    }
  }, CLEANUP_INTERVAL_MS);
}

// Start cleanup on module load
startCleanup();

/**
 * Rate limit based on request count per time window
 * @param identifier - Unique identifier (typically IP address)
 * @param config - Rate limit configuration
 * @returns Rate limit result with success status and metadata
 */
export function rateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now();
  const key = `req:${identifier}`;
  const record = requestStore.get(key);
  
  // No existing record or window expired - create new record
  if (!record || now > record.resetTime) {
    const resetTime = now + config.windowMs;
    requestStore.set(key, { count: 1, resetTime });
    
    return {
      success: true,
      limit: config.limit,
      remaining: config.limit - 1,
      reset: resetTime,
    };
  }
  
  // Rate limit exceeded
  if (record.count >= config.limit) {
    const retryAfter = Math.ceil((record.resetTime - now) / 1000);
    
    // Log rate limit violation
    logRateLimitViolation(identifier, 'request', config.limit);
    
    return {
      success: false,
      limit: config.limit,
      remaining: 0,
      reset: record.resetTime,
      retryAfter,
    };
  }
  
  // Increment count
  record.count++;
  
  return {
    success: true,
    limit: config.limit,
    remaining: config.limit - record.count,
    reset: record.resetTime,
  };
}

/**
 * Track concurrent connections for streaming endpoints
 * @param identifier - Unique identifier (typically IP address)
 * @param connectionId - Unique connection identifier
 * @param maxConnections - Maximum concurrent connections allowed
 * @returns Rate limit result
 */
export function trackConnection(
  identifier: string,
  connectionId: string,
  maxConnections: number
): RateLimitResult {
  const key = `conn:${identifier}`;
  let record = connectionStore.get(key);
  
  if (!record) {
    record = { count: 0, connections: new Set() };
    connectionStore.set(key, record);
  }
  
  // Check if this connection is already tracked
  if (record.connections.has(connectionId)) {
    return {
      success: true,
      limit: maxConnections,
      remaining: maxConnections - record.count,
      reset: Date.now() + 60000, // Arbitrary reset time for connections
    };
  }
  
  // Check if limit exceeded
  if (record.count >= maxConnections) {
    logRateLimitViolation(identifier, 'connection', maxConnections);
    
    return {
      success: false,
      limit: maxConnections,
      remaining: 0,
      reset: Date.now() + 60000,
      retryAfter: 60, // Wait 1 minute before retry
    };
  }
  
  // Add connection
  record.connections.add(connectionId);
  record.count++;
  
  return {
    success: true,
    limit: maxConnections,
    remaining: maxConnections - record.count,
    reset: Date.now() + 60000,
  };
}

/**
 * Release a tracked connection
 * @param identifier - Unique identifier (typically IP address)
 * @param connectionId - Unique connection identifier
 */
export function releaseConnection(
  identifier: string,
  connectionId: string
): void {
  const key = `conn:${identifier}`;
  const record = connectionStore.get(key);
  
  if (!record) return;
  
  if (record.connections.has(connectionId)) {
    record.connections.delete(connectionId);
    record.count = Math.max(0, record.count - 1);
  }
}

/**
 * Get current connection count for an identifier
 * @param identifier - Unique identifier
 * @returns Current connection count
 */
export function getConnectionCount(identifier: string): number {
  const key = `conn:${identifier}`;
  const record = connectionStore.get(key);
  return record ? record.count : 0;
}

/**
 * Log rate limit violation
 * @param identifier - Identifier that exceeded limit
 * @param type - Type of rate limit (request or connection)
 * @param limit - The limit that was exceeded
 */
function logRateLimitViolation(
  identifier: string,
  type: 'request' | 'connection',
  limit: number
): void {
  const timestamp = new Date().toISOString();
  console.warn(
    `[RATE_LIMIT] ${timestamp} - ${type.toUpperCase()} limit exceeded for ${identifier} (limit: ${limit})`
  );
}

/**
 * Create rate limit headers for HTTP response
 * @param result - Rate limit result
 * @returns Headers object
 */
export function createRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  const headers: Record<string, string> = {
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': result.reset.toString(),
  };
  
  if (result.retryAfter !== undefined) {
    headers['Retry-After'] = result.retryAfter.toString();
  }
  
  return headers;
}

/**
 * Get client IP address from request headers
 * Handles various proxy configurations
 * @param headers - Request headers
 * @returns Client IP address
 */
export function getClientIp(headers: Headers): string {
  // Check x-forwarded-for (most common proxy header)
  const forwarded = headers.get('x-forwarded-for');
  if (forwarded) {
    // Take the first IP in the chain (original client)
    return forwarded.split(',')[0].trim();
  }
  
  // Check x-real-ip (nginx)
  const realIp = headers.get('x-real-ip');
  if (realIp) {
    return realIp.trim();
  }
  
  // Check cf-connecting-ip (Cloudflare)
  const cfIp = headers.get('cf-connecting-ip');
  if (cfIp) {
    return cfIp.trim();
  }
  
  // Fallback for local development
  return '127.0.0.1';
}

/**
 * Predefined rate limit configurations
 */
export const RateLimitPresets = {
  // Authentication endpoints: 5 requests per minute
  AUTH: { limit: 5, windowMs: 60 * 1000 },
  
  // AI query endpoints: 10 requests per minute
  AI_QUERY: { limit: 10, windowMs: 60 * 1000 },
  
  // Image generation: 10 requests per minute
  IMAGE_GEN: { limit: 10, windowMs: 60 * 1000 },
  
  // Streaming: 5 concurrent connections
  STREAMING: { limit: 5, windowMs: 60 * 1000 },
  
  // Music/media: 20 requests per minute
  MEDIA: { limit: 20, windowMs: 60 * 1000 },
} as const;

/**
 * Stop cleanup timer (for testing)
 */
export function stopCleanup(): void {
  if (cleanupTimer) {
    clearInterval(cleanupTimer);
    cleanupTimer = null;
  }
}

/**
 * Clear all rate limit data (for testing)
 */
export function clearAllLimits(): void {
  requestStore.clear();
  connectionStore.clear();
}

// Made with Bob