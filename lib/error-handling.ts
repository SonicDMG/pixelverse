/**
 * Secure Error Handling Utility
 * 
 * Addresses VULN-007: Sensitive Information Disclosure in Error Messages
 * 
 * This module provides secure error handling that prevents information leakage
 * while maintaining detailed server-side logging for debugging.
 * 
 * Security Requirements:
 * - NEVER expose stack traces to clients
 * - NEVER expose file system paths to clients
 * - NEVER expose internal service URLs to clients
 * - NEVER expose database connection strings to clients
 * - ALWAYS log full error details server-side
 * - ALWAYS return generic messages for unexpected errors
 * - ALWAYS include error ID for tracking
 */

import { NextRequest } from 'next/server';
import { randomUUID } from 'crypto';

/**
 * SafeError class for user-facing errors with controlled messaging
 */
export class SafeError extends Error {
  constructor(
    message: string,
    public userMessage: string,
    public statusCode: number = 500,
    public errorId?: string
  ) {
    super(message);
    this.name = 'SafeError';
    
    // Ensure error ID is set
    if (!this.errorId) {
      this.errorId = generateErrorId();
    }
  }
}

/**
 * Generate a unique error ID for tracking
 */
export function generateErrorId(): string {
  return `ERR-${Date.now()}-${randomUUID().substring(0, 8)}`;
}

/**
 * Get client IP address from request headers
 */
export function getClientIp(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}

/**
 * Log error with full context for server-side debugging
 */
export function logError(
  errorId: string,
  error: unknown,
  context?: {
    endpoint?: string;
    ip?: string;
    userId?: string;
    sessionId?: string;
    additionalInfo?: Record<string, any>;
  }
): void {
  const timestamp = new Date().toISOString();
  
  const logEntry = {
    errorId,
    timestamp,
    endpoint: context?.endpoint,
    ip: context?.ip,
    userId: context?.userId,
    sessionId: context?.sessionId,
    error: error instanceof Error ? {
      name: error.name,
      message: error.message,
      stack: error.stack,
    } : {
      type: typeof error,
      value: String(error),
    },
    additionalInfo: context?.additionalInfo,
  };
  
  // Log to console (in production, this should go to a logging service)
  console.error('[ERROR]', JSON.stringify(logEntry, null, 2));
}

/**
 * Sanitized error response interface
 */
export interface SanitizedErrorResponse {
  message: string;
  statusCode: number;
  errorId: string;
  timestamp: string;
}

/**
 * Sanitize error for client response
 * 
 * This function ensures that only safe, generic error messages are sent to clients
 * while logging full error details server-side.
 */
export function sanitizeError(
  error: unknown,
  context?: {
    endpoint?: string;
    ip?: string;
    userId?: string;
    sessionId?: string;
    additionalInfo?: Record<string, any>;
  }
): SanitizedErrorResponse {
  const errorId = generateErrorId();
  const timestamp = new Date().toISOString();
  
  // Log full error details server-side
  logError(errorId, error, context);
  
  // Handle SafeError instances (controlled error messages)
  if (error instanceof SafeError) {
    return {
      message: error.userMessage,
      statusCode: error.statusCode,
      errorId: error.errorId || errorId,
      timestamp,
    };
  }
  
  // Handle known error types with safe messages
  if (error instanceof Error) {
    // Check for specific error types that can have more specific messages
    if (error.name === 'ValidationError') {
      return {
        message: 'Invalid input. Please check your request and try again.',
        statusCode: 400,
        errorId,
        timestamp,
      };
    }
    
    if (error.name === 'UnauthorizedError' || error.message.toLowerCase().includes('unauthorized')) {
      return {
        message: 'Authentication required. Please log in and try again.',
        statusCode: 401,
        errorId,
        timestamp,
      };
    }
    
    if (error.name === 'ForbiddenError' || error.message.toLowerCase().includes('forbidden')) {
      return {
        message: 'Access denied. You do not have permission to perform this action.',
        statusCode: 403,
        errorId,
        timestamp,
      };
    }
    
    if (error.name === 'NotFoundError' || error.message.toLowerCase().includes('not found')) {
      return {
        message: 'The requested resource was not found.',
        statusCode: 404,
        errorId,
        timestamp,
      };
    }
    
    if (error.message.toLowerCase().includes('timeout')) {
      return {
        message: 'The request timed out. Please try again.',
        statusCode: 504,
        errorId,
        timestamp,
      };
    }
  }
  
  // Generic message for all other errors
  return {
    message: 'An unexpected error occurred. Please try again later.',
    statusCode: 500,
    errorId,
    timestamp,
  };
}

/**
 * Sanitize service error (for errors from external services like Langflow, EverArt)
 * 
 * This prevents leaking internal service URLs, API keys, or implementation details
 */
export function sanitizeServiceError(
  error: unknown,
  serviceName: string,
  context?: {
    endpoint?: string;
    ip?: string;
    userId?: string;
    sessionId?: string;
    additionalInfo?: Record<string, any>;
  }
): SanitizedErrorResponse {
  const errorId = generateErrorId();
  const timestamp = new Date().toISOString();
  
  // Log full error details server-side
  logError(errorId, error, {
    ...context,
    additionalInfo: {
      ...context?.additionalInfo,
      serviceName,
    },
  });
  
  // Return generic service error message
  return {
    message: `Service temporarily unavailable. Please try again later.`,
    statusCode: 503,
    errorId,
    timestamp,
  };
}

/**
 * Create a SafeError for validation failures
 */
export function createValidationError(userMessage: string, internalMessage?: string): SafeError {
  return new SafeError(
    internalMessage || userMessage,
    userMessage,
    400
  );
}

/**
 * Create a SafeError for authentication failures
 */
export function createAuthError(userMessage: string = 'Authentication required'): SafeError {
  return new SafeError(
    'Authentication failed',
    userMessage,
    401
  );
}

/**
 * Create a SafeError for authorization failures
 */
export function createForbiddenError(userMessage: string = 'Access denied'): SafeError {
  return new SafeError(
    'Authorization failed',
    userMessage,
    403
  );
}

/**
 * Create a SafeError for rate limiting
 */
export function createRateLimitError(retryAfter?: number): SafeError {
  const message = retryAfter
    ? `Too many requests. Please try again in ${retryAfter} seconds.`
    : 'Too many requests. Please try again later.';
  
  return new SafeError(
    'Rate limit exceeded',
    message,
    429
  );
}

/**
 * Create a SafeError for not found resources
 */
export function createNotFoundError(userMessage: string = 'Resource not found'): SafeError {
  return new SafeError(
    'Resource not found',
    userMessage,
    404
  );
}

/**
 * Wrap an async function with error handling
 * 
 * This is useful for wrapping API route handlers to ensure consistent error handling
 */
export function withErrorHandling<T extends (...args: any[]) => Promise<any>>(
  handler: T,
  context?: {
    endpoint?: string;
  }
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await handler(...args);
    } catch (error) {
      // Extract request if available (first argument is typically NextRequest)
      const request = args[0] as NextRequest | undefined;
      const ip = request ? getClientIp(request) : undefined;
      
      const sanitized = sanitizeError(error, {
        endpoint: context?.endpoint || request?.url,
        ip,
      });
      
      // Return error response
      const { NextResponse } = await import('next/server');
      return NextResponse.json(
        {
          error: sanitized.message,
          errorId: sanitized.errorId,
          timestamp: sanitized.timestamp,
        },
        { status: sanitized.statusCode }
      );
    }
  }) as T;
}

// Made with Bob