/**
 * Tests for Secure Error Handling Utility
 * 
 * Verifies that error handling prevents information leakage while maintaining
 * proper server-side logging.
 */

import { NextRequest } from 'next/server';
import {
  SafeError,
  generateErrorId,
  sanitizeError,
  sanitizeServiceError,
  createValidationError,
  createAuthError,
  createForbiddenError,
  createRateLimitError,
  createNotFoundError,
  logError,
} from '@/lib/error-handling';

// Mock console.error to prevent test output pollution
const originalConsoleError = console.error;
let consoleErrorMock: jest.Mock;

beforeEach(() => {
  consoleErrorMock = jest.fn();
  console.error = consoleErrorMock;
});

afterEach(() => {
  console.error = originalConsoleError;
});

describe('Error Handling Utility', () => {
  describe('generateErrorId', () => {
    it('should generate unique error IDs', () => {
      const id1 = generateErrorId();
      const id2 = generateErrorId();
      
      expect(id1).toMatch(/^ERR-\d+-[a-f0-9]{8}$/);
      expect(id2).toMatch(/^ERR-\d+-[a-f0-9]{8}$/);
      expect(id1).not.toBe(id2);
    });
    
    it('should include timestamp in error ID', () => {
      const beforeTime = Date.now();
      const errorId = generateErrorId();
      const afterTime = Date.now();
      
      const timestamp = parseInt(errorId.split('-')[1]);
      expect(timestamp).toBeGreaterThanOrEqual(beforeTime);
      expect(timestamp).toBeLessThanOrEqual(afterTime);
    });
  });

  describe('SafeError', () => {
    it('should create SafeError with all properties', () => {
      const error = new SafeError(
        'Internal message',
        'User-friendly message',
        400,
        'TEST-ERROR-ID'
      );
      
      expect(error.message).toBe('Internal message');
      expect(error.userMessage).toBe('User-friendly message');
      expect(error.statusCode).toBe(400);
      expect(error.errorId).toBe('TEST-ERROR-ID');
      expect(error.name).toBe('SafeError');
    });
    
    it('should generate error ID if not provided', () => {
      const error = new SafeError(
        'Internal message',
        'User message',
        500
      );
      
      expect(error.errorId).toMatch(/^ERR-\d+-[a-f0-9]{8}$/);
    });
    
    it('should default to status 500', () => {
      const error = new SafeError('Internal', 'User');
      expect(error.statusCode).toBe(500);
    });
  });

  describe('logError', () => {
    it('should log error with full context', () => {
      const error = new Error('Test error');
      error.stack = 'Error: Test error\n    at test.ts:1:1';
      
      logError('TEST-ID', error, {
        endpoint: '/api/test',
        ip: '127.0.0.1',
        userId: 'user123',
        sessionId: 'session456',
        additionalInfo: { custom: 'data' },
      });
      
      expect(consoleErrorMock).toHaveBeenCalledTimes(1);
      const loggedData = JSON.parse(consoleErrorMock.mock.calls[0][1]);
      
      expect(loggedData.errorId).toBe('TEST-ID');
      expect(loggedData.endpoint).toBe('/api/test');
      expect(loggedData.ip).toBe('127.0.0.1');
      expect(loggedData.userId).toBe('user123');
      expect(loggedData.sessionId).toBe('session456');
      expect(loggedData.error.name).toBe('Error');
      expect(loggedData.error.message).toBe('Test error');
      expect(loggedData.error.stack).toContain('Error: Test error');
      expect(loggedData.additionalInfo.custom).toBe('data');
    });
    
    it('should handle non-Error objects', () => {
      logError('TEST-ID', 'String error', {
        endpoint: '/api/test',
      });
      
      expect(consoleErrorMock).toHaveBeenCalledTimes(1);
      const loggedData = JSON.parse(consoleErrorMock.mock.calls[0][1]);
      
      expect(loggedData.error.type).toBe('string');
      expect(loggedData.error.value).toBe('String error');
    });
    
    it('should include timestamp', () => {
      const beforeTime = Date.now();
      logError('TEST-ID', new Error('Test'));
      const afterTime = Date.now();
      
      const loggedData = JSON.parse(consoleErrorMock.mock.calls[0][1]);
      const loggedTimestamp = new Date(loggedData.timestamp).getTime();
      expect(loggedTimestamp).toBeGreaterThanOrEqual(beforeTime);
      expect(loggedTimestamp).toBeLessThanOrEqual(afterTime);
    });
  });

  describe('sanitizeError', () => {
    it('should sanitize SafeError and preserve user message', () => {
      const error = new SafeError(
        'Internal details',
        'User-friendly message',
        400,
        'SAFE-ERROR-ID'
      );
      
      const result = sanitizeError(error);
      
      expect(result.message).toBe('User-friendly message');
      expect(result.statusCode).toBe(400);
      expect(result.errorId).toBe('SAFE-ERROR-ID');
      expect(result.timestamp).toBeDefined();
      expect(consoleErrorMock).toHaveBeenCalled();
    });
    
    it('should sanitize generic Error and return generic message', () => {
      const error = new Error('Internal error with sensitive data: /path/to/file.ts');
      
      const result = sanitizeError(error);
      
      expect(result.message).toBe('An unexpected error occurred. Please try again later.');
      expect(result.statusCode).toBe(500);
      expect(result.errorId).toMatch(/^ERR-\d+-[a-f0-9]{8}$/);
      expect(result.message).not.toContain('/path/to/file.ts');
      expect(consoleErrorMock).toHaveBeenCalled();
    });
    
    it('should handle ValidationError with appropriate message', () => {
      const error = new Error('Validation failed');
      error.name = 'ValidationError';
      
      const result = sanitizeError(error);
      
      expect(result.message).toBe('Invalid input. Please check your request and try again.');
      expect(result.statusCode).toBe(400);
    });
    
    it('should handle UnauthorizedError', () => {
      const error = new Error('Unauthorized access');
      error.name = 'UnauthorizedError';
      
      const result = sanitizeError(error);
      
      expect(result.message).toBe('Authentication required. Please log in and try again.');
      expect(result.statusCode).toBe(401);
    });
    
    it('should handle ForbiddenError', () => {
      const error = new Error('Forbidden resource');
      error.name = 'ForbiddenError';
      
      const result = sanitizeError(error);
      
      expect(result.message).toBe('Access denied. You do not have permission to perform this action.');
      expect(result.statusCode).toBe(403);
    });
    
    it('should handle NotFoundError', () => {
      const error = new Error('Resource not found');
      error.name = 'NotFoundError';
      
      const result = sanitizeError(error);
      
      expect(result.message).toBe('The requested resource was not found.');
      expect(result.statusCode).toBe(404);
    });
    
    it('should handle timeout errors', () => {
      const error = new Error('Request timeout after 30s');
      
      const result = sanitizeError(error);
      
      expect(result.message).toBe('The request timed out. Please try again.');
      expect(result.statusCode).toBe(504);
    });
    
    it('should never expose stack traces', () => {
      const error = new Error('Test error');
      error.stack = 'Error: Test error\n    at /sensitive/path/file.ts:123:45';
      
      const result = sanitizeError(error);
      
      expect(result.message).not.toContain('stack');
      expect(result.message).not.toContain('/sensitive/path');
      expect(result.message).not.toContain('file.ts');
    });
    
    it('should never expose file paths', () => {
      const error = new Error('Failed to read /etc/passwd');
      
      const result = sanitizeError(error);
      
      expect(result.message).not.toContain('/etc/passwd');
      expect(result.message).toBe('An unexpected error occurred. Please try again later.');
    });
    
    it('should log context information', () => {
      const error = new Error('Test error');
      
      sanitizeError(error, {
        endpoint: '/api/test',
        ip: '192.168.1.1',
        userId: 'user123',
        sessionId: 'session456',
      });
      
      const loggedData = JSON.parse(consoleErrorMock.mock.calls[0][1]);
      expect(loggedData.endpoint).toBe('/api/test');
      expect(loggedData.ip).toBe('192.168.1.1');
      expect(loggedData.userId).toBe('user123');
      expect(loggedData.sessionId).toBe('session456');
    });
  });

  describe('sanitizeServiceError', () => {
    it('should sanitize service errors and hide service details', () => {
      const error = new Error('Connection failed to http://internal-service:8080/api');
      
      const result = sanitizeServiceError(error, 'Langflow');
      
      expect(result.message).toBe('Service temporarily unavailable. Please try again later.');
      expect(result.statusCode).toBe(503);
      expect(result.message).not.toContain('http://internal-service');
      expect(result.message).not.toContain('8080');
    });
    
    it('should log service name in context', () => {
      const error = new Error('Service error');
      
      sanitizeServiceError(error, 'EverArt', {
        endpoint: '/api/generate',
        ip: '127.0.0.1',
      });
      
      const loggedData = JSON.parse(consoleErrorMock.mock.calls[0][1]);
      expect(loggedData.additionalInfo.serviceName).toBe('EverArt');
    });
    
    it('should never expose API keys', () => {
      const error = new Error('API key sk-1234567890abcdef is invalid');
      
      const result = sanitizeServiceError(error, 'ExternalAPI');
      
      expect(result.message).not.toContain('sk-1234567890abcdef');
      expect(result.message).toBe('Service temporarily unavailable. Please try again later.');
    });
  });

  describe('Helper Functions', () => {
    describe('createValidationError', () => {
      it('should create validation error with user message', () => {
        const error = createValidationError('Invalid email format');
        
        expect(error.userMessage).toBe('Invalid email format');
        expect(error.statusCode).toBe(400);
        expect(error.name).toBe('SafeError');
      });
      
      it('should use internal message if provided', () => {
        const error = createValidationError(
          'Invalid email',
          'Email validation failed: regex mismatch'
        );
        
        expect(error.message).toBe('Email validation failed: regex mismatch');
        expect(error.userMessage).toBe('Invalid email');
      });
    });

    describe('createAuthError', () => {
      it('should create auth error with default message', () => {
        const error = createAuthError();
        
        expect(error.userMessage).toBe('Authentication required');
        expect(error.statusCode).toBe(401);
      });
      
      it('should create auth error with custom message', () => {
        const error = createAuthError('Invalid credentials');
        
        expect(error.userMessage).toBe('Invalid credentials');
        expect(error.statusCode).toBe(401);
      });
    });

    describe('createForbiddenError', () => {
      it('should create forbidden error with default message', () => {
        const error = createForbiddenError();
        
        expect(error.userMessage).toBe('Access denied');
        expect(error.statusCode).toBe(403);
      });
      
      it('should create forbidden error with custom message', () => {
        const error = createForbiddenError('Insufficient permissions');
        
        expect(error.userMessage).toBe('Insufficient permissions');
        expect(error.statusCode).toBe(403);
      });
    });

    describe('createRateLimitError', () => {
      it('should create rate limit error without retry time', () => {
        const error = createRateLimitError();
        
        expect(error.userMessage).toBe('Too many requests. Please try again later.');
        expect(error.statusCode).toBe(429);
      });
      
      it('should create rate limit error with retry time', () => {
        const error = createRateLimitError(60);
        
        expect(error.userMessage).toBe('Too many requests. Please try again in 60 seconds.');
        expect(error.statusCode).toBe(429);
      });
    });

    describe('createNotFoundError', () => {
      it('should create not found error with default message', () => {
        const error = createNotFoundError();
        
        expect(error.userMessage).toBe('Resource not found');
        expect(error.statusCode).toBe(404);
      });
      
      it('should create not found error with custom message', () => {
        const error = createNotFoundError('User not found');
        
        expect(error.userMessage).toBe('User not found');
        expect(error.statusCode).toBe(404);
      });
    });
  });

  describe('Security Requirements', () => {
    it('should NEVER expose stack traces in sanitized errors', () => {
      const error = new Error('Test error');
      error.stack = 'Error: Test error\n    at Object.<anonymous> (/app/src/api/route.ts:42:15)';
      
      const result = sanitizeError(error);
      
      expect(JSON.stringify(result)).not.toContain('stack');
      expect(JSON.stringify(result)).not.toContain('/app/src');
      expect(JSON.stringify(result)).not.toContain('route.ts');
    });
    
    it('should NEVER expose file paths in sanitized errors', () => {
      const error = new Error('ENOENT: no such file or directory, open \'/var/app/config.json\'');
      
      const result = sanitizeError(error);
      
      expect(result.message).not.toContain('/var/app');
      expect(result.message).not.toContain('config.json');
      expect(result.message).not.toContain('ENOENT');
    });
    
    it('should NEVER expose internal URLs in sanitized errors', () => {
      const error = new Error('Failed to connect to http://internal-db:5432/database');
      
      const result = sanitizeError(error);
      
      expect(result.message).not.toContain('http://internal-db');
      expect(result.message).not.toContain('5432');
      expect(result.message).not.toContain('database');
    });
    
    it('should NEVER expose environment variables in sanitized errors', () => {
      const error = new Error('DATABASE_URL=postgresql://user:pass@localhost:5432/db is invalid');
      
      const result = sanitizeError(error);
      
      expect(result.message).not.toContain('DATABASE_URL');
      expect(result.message).not.toContain('postgresql://');
      expect(result.message).not.toContain('user:pass');
    });
    
    it('should ALWAYS include error ID for tracking', () => {
      const error = new Error('Test error');
      
      const result = sanitizeError(error);
      
      expect(result.errorId).toBeDefined();
      expect(result.errorId).toMatch(/^ERR-\d+-[a-f0-9]{8}$/);
    });
    
    it('should ALWAYS include timestamp', () => {
      const error = new Error('Test error');
      
      const result = sanitizeError(error);
      
      expect(result.timestamp).toBeDefined();
      expect(new Date(result.timestamp).getTime()).toBeGreaterThan(0);
    });
    
    it('should ALWAYS log full details server-side', () => {
      const error = new Error('Sensitive internal error');
      error.stack = 'Error: Sensitive internal error\n    at /app/src/secret.ts:123:45';
      
      sanitizeError(error, {
        endpoint: '/api/secret',
        ip: '192.168.1.1',
      });
      
      expect(consoleErrorMock).toHaveBeenCalled();
      const loggedData = JSON.parse(consoleErrorMock.mock.calls[0][1]);
      
      // Server logs should contain full details
      expect(loggedData.error.message).toBe('Sensitive internal error');
      expect(loggedData.error.stack).toContain('/app/src/secret.ts');
      expect(loggedData.endpoint).toBe('/api/secret');
      expect(loggedData.ip).toBe('192.168.1.1');
    });
  });
});

// Made with Bob