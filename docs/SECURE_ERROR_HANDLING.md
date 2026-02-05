# Secure Error Handling Implementation

**Status**: ✅ Implemented (Phase 5 - VULN-007 Mitigation)  
**Security Level**: High  
**Last Updated**: 2026-02-05

## Overview

This document describes the secure error handling implementation that addresses **VULN-007: Sensitive Information Disclosure in Error Messages** from the security audit. The implementation prevents information leakage while maintaining detailed server-side logging for debugging.

## Security Requirements Met

✅ **NEVER** expose stack traces to clients  
✅ **NEVER** expose file system paths to clients  
✅ **NEVER** expose internal service URLs to clients  
✅ **NEVER** expose database connection strings to clients  
✅ **ALWAYS** log full error details server-side  
✅ **ALWAYS** return generic messages for unexpected errors  
✅ **ALWAYS** include error ID for tracking

## Implementation Components

### 1. Error Handling Utility (`lib/error-handling.ts`)

Core utility providing:
- `SafeError` class for controlled error messages
- `sanitizeError()` function to clean error responses
- `sanitizeServiceError()` for external service errors
- `logError()` for structured server-side logging
- Helper functions for common error types

### 2. Updated API Routes

All API routes now use sanitized error handling:
- `app/api/ask-space/route.ts`
- `app/api/ask-stock/route.ts`
- `app/api/stream-space/route.ts`
- `app/api/stream-stock/route.ts`
- `app/api/generate-space-image/route.ts`
- `app/api/auth/login/route.ts`
- `app/api/auth/guest/route.ts`
- `app/api/auth/logout/route.ts`
- `app/api/auth/status/route.ts`
- `app/api/music/[theme]/route.ts`

### 3. Updated Services

Service layer errors are sanitized:
- `services/langflow.ts` - Langflow API errors
- `services/image/everart-service.ts` - EverArt API errors

## Before/After Examples

### Example 1: Generic Error (Development Mode)

#### ❌ BEFORE (Vulnerable)
```json
{
  "error": "Internal server error",
  "details": "ENOENT: no such file or directory, open '/var/app/config/database.json'"
}
```

**Issues:**
- Exposes file system path (`/var/app/config/database.json`)
- Reveals internal directory structure
- Provides reconnaissance information to attackers

#### ✅ AFTER (Secure)
```json
{
  "error": "An unexpected error occurred. Please try again later.",
  "errorId": "ERR-1738774800000-a1b2c3d4",
  "timestamp": "2026-02-05T16:00:00.000Z"
}
```

**Server-side log:**
```json
{
  "errorId": "ERR-1738774800000-a1b2c3d4",
  "timestamp": "2026-02-05T16:00:00.000Z",
  "endpoint": "/api/ask-space",
  "ip": "192.168.1.100",
  "error": {
    "name": "Error",
    "message": "ENOENT: no such file or directory, open '/var/app/config/database.json'",
    "stack": "Error: ENOENT: no such file or directory...\n    at Object.openSync (fs.js:476:3)\n    at /var/app/src/api/route.ts:42:15"
  }
}
```

**Benefits:**
- Client receives generic message
- Error ID allows support to find full details in logs
- Full error details preserved server-side
- No sensitive information leaked

---

### Example 2: Service Error (Langflow)

#### ❌ BEFORE (Vulnerable)
```json
{
  "error": "Langflow error: 500",
  "details": "Connection refused to http://internal-langflow:7861/api/v1/run/abc123"
}
```

**Issues:**
- Exposes internal service URL (`http://internal-langflow:7861`)
- Reveals internal network topology
- Exposes flow ID (`abc123`)
- Aids in attack surface mapping

#### ✅ AFTER (Secure)
```json
{
  "error": "Service temporarily unavailable. Please try again later.",
  "errorId": "ERR-1738774800001-e5f6g7h8",
  "timestamp": "2026-02-05T16:00:01.000Z"
}
```

**Server-side log:**
```json
{
  "errorId": "ERR-1738774800001-e5f6g7h8",
  "timestamp": "2026-02-05T16:00:01.000Z",
  "endpoint": "/api/ask-space",
  "ip": "192.168.1.100",
  "error": {
    "name": "Error",
    "message": "Langflow returned status 500",
    "stack": "Error: Langflow returned status 500..."
  },
  "additionalInfo": {
    "service": "Langflow",
    "statusCode": 500
  }
}
```

**Benefits:**
- No internal URLs exposed
- Generic service error message
- Full details logged for debugging
- Error ID for tracking

---

### Example 3: Stack Trace Exposure

#### ❌ BEFORE (Vulnerable)
```json
{
  "error": "Internal server error",
  "details": "TypeError: Cannot read property 'data' of undefined\n    at queryLangflow (/app/services/langflow.ts:156:23)\n    at POST (/app/api/ask-space/route.ts:756:28)"
}
```

**Issues:**
- Exposes full stack trace
- Reveals file paths and line numbers
- Shows internal code structure
- Provides attack surface information

#### ✅ AFTER (Secure)
```json
{
  "error": "An unexpected error occurred. Please try again later.",
  "errorId": "ERR-1738774800002-i9j0k1l2",
  "timestamp": "2026-02-05T16:00:02.000Z"
}
```

**Server-side log:**
```json
{
  "errorId": "ERR-1738774800002-i9j0k1l2",
  "timestamp": "2026-02-05T16:00:02.000Z",
  "endpoint": "/api/ask-space",
  "ip": "192.168.1.100",
  "error": {
    "name": "TypeError",
    "message": "Cannot read property 'data' of undefined",
    "stack": "TypeError: Cannot read property 'data' of undefined\n    at queryLangflow (/app/services/langflow.ts:156:23)\n    at POST (/app/api/ask-space/route.ts:756:28)"
  }
}
```

**Benefits:**
- No stack trace in client response
- No file paths exposed
- Full stack trace preserved in logs
- Error ID for correlation

---

### Example 4: Image Generation Error

#### ❌ BEFORE (Vulnerable)
```json
{
  "success": false,
  "error": "Image generation failed: API key sk-1234567890abcdef is invalid"
}
```

**Issues:**
- Exposes API key format
- Reveals authentication mechanism
- Provides information for credential attacks

#### ✅ AFTER (Secure)
```json
{
  "success": false,
  "error": "Service temporarily unavailable. Please try again later."
}
```

**Server-side log:**
```json
{
  "errorId": "ERR-1738774800003-m3n4o5p6",
  "timestamp": "2026-02-05T16:00:03.000Z",
  "endpoint": "/api/generate-space-image",
  "ip": "192.168.1.100",
  "error": {
    "name": "Error",
    "message": "Image generation service temporarily unavailable"
  },
  "additionalInfo": {
    "serviceName": "EverArt"
  }
}
```

**Benefits:**
- No API key information leaked
- Generic service error
- Service name logged for debugging
- No authentication details exposed

---

### Example 5: File System Error

#### ❌ BEFORE (Vulnerable)
```json
{
  "error": "File system error",
  "message": "Unable to read music directory",
  "files": []
}
```

**Issues:**
- Hints at file system operations
- Could reveal directory structure through timing attacks
- Provides information about server architecture

#### ✅ AFTER (Secure)
```json
{
  "error": "An unexpected error occurred. Please try again later.",
  "errorId": "ERR-1738774800004-q7r8s9t0",
  "files": []
}
```

**Server-side log:**
```json
{
  "errorId": "ERR-1738774800004-q7r8s9t0",
  "timestamp": "2026-02-05T16:00:04.000Z",
  "endpoint": "/api/music/space",
  "ip": "192.168.1.100",
  "error": {
    "name": "Error",
    "message": "EACCES: permission denied, scandir '/app/public/audio/music/space'",
    "stack": "Error: EACCES: permission denied..."
  },
  "additionalInfo": {
    "theme": "space"
  }
}
```

**Benefits:**
- No file system details exposed
- Generic error message
- Full path logged for debugging
- Theme context preserved in logs

---

## Usage Examples

### Basic Error Handling in API Routes

```typescript
import { sanitizeError, getClientIp } from '@/lib/error-handling';

export async function POST(request: NextRequest) {
  try {
    // Your API logic here
  } catch (error) {
    const sanitized = sanitizeError(error, {
      endpoint: request.url,
      ip: getClientIp(request),
    });
    
    return NextResponse.json(
      {
        error: sanitized.message,
        errorId: sanitized.errorId,
        timestamp: sanitized.timestamp,
      },
      { status: sanitized.statusCode }
    );
  }
}
```

### Service Error Handling

```typescript
import { sanitizeServiceError } from '@/lib/error-handling';

try {
  const result = await externalService.call();
} catch (error) {
  const sanitized = sanitizeServiceError(error, 'ServiceName', {
    endpoint: request.url,
    ip: getClientIp(request),
  });
  
  return NextResponse.json(
    { error: sanitized.message, errorId: sanitized.errorId },
    { status: sanitized.statusCode }
  );
}
```

### Creating Safe Errors

```typescript
import { SafeError } from '@/lib/error-handling';

// Validation error
throw new SafeError(
  'Email validation failed: invalid format',  // Internal message (logged)
  'Invalid email format',                      // User message (returned)
  400                                          // Status code
);

// Or use helper functions
import { createValidationError, createAuthError } from '@/lib/error-handling';

throw createValidationError('Invalid email format');
throw createAuthError('Invalid credentials');
```

## Testing

Comprehensive test suite in `__tests__/lib/error-handling.test.ts`:

- ✅ 38 tests passing
- ✅ Verifies no stack traces in responses
- ✅ Verifies no file paths in responses
- ✅ Verifies no internal URLs in responses
- ✅ Verifies error IDs are generated
- ✅ Verifies server-side logging includes full details

Run tests:
```bash
npm test -- __tests__/lib/error-handling.test.ts
```

## Security Impact

### VULN-007 Mitigation: ✅ COMPLETE

**Before Implementation:**
- High severity vulnerability
- Stack traces exposed in development mode
- File paths visible in error messages
- Internal service URLs leaked
- Attack surface information disclosed

**After Implementation:**
- ✅ No sensitive information in client responses
- ✅ Generic error messages for all unexpected errors
- ✅ Full details preserved in server logs
- ✅ Error IDs for tracking and support
- ✅ Consistent error handling across all endpoints
- ✅ Service errors sanitized
- ✅ OWASP security standards followed

## Monitoring and Debugging

### Finding Errors in Logs

When a user reports an error, use the error ID to find full details:

```bash
# Search logs for error ID
grep "ERR-1738774800000-a1b2c3d4" application.log

# Or in structured logging system
{
  "errorId": "ERR-1738774800000-a1b2c3d4",
  "timestamp": "2026-02-05T16:00:00.000Z",
  "endpoint": "/api/ask-space",
  "ip": "192.168.1.100",
  "error": {
    "name": "Error",
    "message": "Full error details here",
    "stack": "Complete stack trace here"
  }
}
```

### Error ID Format

Error IDs follow the pattern: `ERR-{timestamp}-{uuid}`

- `ERR-` prefix for easy identification
- Timestamp for chronological ordering
- 8-character UUID for uniqueness

## Best Practices

1. **Always use sanitizeError()** for unexpected errors
2. **Use sanitizeServiceError()** for external service errors
3. **Use SafeError** for controlled error messages
4. **Include context** in error logging (endpoint, IP, user ID)
5. **Never log sensitive data** (passwords, tokens, API keys)
6. **Test error scenarios** to ensure no leakage
7. **Monitor error IDs** for patterns and issues

## Related Documentation

- [Security Audit Report](./SECURITY_AUDIT.md)
- [Input Validation](./INPUT_VALIDATION.md)
- [Rate Limiting](./RATE_LIMITING.md)
- [CSP Configuration](./CSP_CONFIGURATION.md)

## Compliance

This implementation follows:
- ✅ OWASP Top 10 - A01:2021 Broken Access Control
- ✅ OWASP Top 10 - A05:2021 Security Misconfiguration
- ✅ CWE-209: Generation of Error Message Containing Sensitive Information
- ✅ NIST SP 800-53 - SI-11 Error Handling

---

**Made with Bob** 🤖