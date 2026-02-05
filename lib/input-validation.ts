/**
 * Input Validation and Sanitization Utility
 * 
 * Implements comprehensive input validation to protect against:
 * - SQL Injection attacks
 * - Prompt Injection attacks
 * - Command Injection attacks
 * - Data Exfiltration attempts
 * - Control character injection
 * 
 * Following OWASP security standards for input validation.
 * VULN-001 Mitigation: Critical Prompt Injection Protection
 */

export interface ValidationResult {
  valid: boolean;
  sanitized?: string;
  error?: string;
}

/**
 * SQL injection patterns to detect and block
 * Using word boundaries to catch SQL keywords in any context
 * Note: Removed 'g' flag to avoid regex state issues with test()
 */
const SQL_INJECTION_PATTERNS = [
  // SQL DML keywords
  /\b(SELECT|INSERT|UPDATE|DELETE)\b/i,
  // SQL DDL keywords
  /\b(DROP|CREATE|ALTER|TRUNCATE)\b/i,
  // SQL execution keywords
  /\b(EXEC|EXECUTE|UNION|DECLARE|CAST|CONVERT)\b/i,
  // SQL operators and syntax
  /(\-\-|\/\*|\*\/|;|\|\|)/,
  // SQL functions
  /\b(CONCAT|SUBSTRING|ASCII|CHAR|NCHAR|SLEEP|BENCHMARK|WAITFOR)\b/i,
  // SQL comments
  /(\/\*[\s\S]*?\*\/|--[^\n]*)/,
];

/**
 * Prompt injection patterns to detect and block
 * Note: Removed 'g' flag to avoid regex state issues with test()
 */
const PROMPT_INJECTION_PATTERNS = [
  // Direct instruction manipulation - more flexible matching
  /\b(ignore|disregard|forget|override)\s+(previous|all|above|prior|past)?\s*(instructions?|prompts?|rules?|commands?)/i,
  
  // System prompt manipulation
  /\b(system\s*:?\s*(prompt|message|instruction|role))/i,
  /\b(you\s+are\s+now|act\s+as|pretend\s+to\s+be|roleplay\s+as|behave\s+as)/i,
  /\b(new\s+(instructions?|role|personality|character))/i,
  
  // Secret/credential extraction
  /\b(reveal|show|display|tell|give|provide)\s+(me\s+)?(the\s+)?(secret|password|key|token|credential|api[_\s]?key)/i,
  /\b(what\s+(is|are)\s+(your|the)\s+(secret|password|key|token|api[_\s]?key|credential))/i,
  
  // Environment/system information extraction
  /\b(show|display|list|print)\s+(all\s+)?(environment|env|system)\s+(variable|setting|config)/i,
  /\b(database\s+(credential|password|connection|config))/i,
  
  // Prompt leakage attempts
  /\b(repeat|echo|output|print)\s+(your|the)\s+(prompt|instruction|system\s+message)/i,
  /\b(what\s+(is|are)\s+your\s+(instruction|prompt|rule|guideline))/i,
];

/**
 * Command injection patterns to detect and block
 * Note: Removed 'g' flag to avoid regex state issues with test()
 */
const COMMAND_INJECTION_PATTERNS = [
  // Shell command separators
  /[;&|`$()]/,
  // Command substitution
  /\$\{[^}]*\}/,
  /\$\([^)]*\)/,
  // Backticks
  /`[^`]*`/,
  // Common dangerous commands
  /\b(rm|del|format|mkfs|dd|wget|curl|nc|netcat|bash|sh|cmd|powershell|eval|exec)\b/i,
];

/**
 * Data exfiltration patterns to detect and block
 * Note: Removed 'g' flag to avoid regex state issues with test()
 */
const DATA_EXFILTRATION_PATTERNS = [
  /\b(admin|root|administrator)\s+(table|database|user|account)/i,
  /\b(dump|export|extract)\s+(all|entire)?\s*(data|database|table|user)/i,
  /\b(list\s+all\s+(user|admin|account|credential))/i,
];

/**
 * Maximum allowed input length
 */
const MAX_INPUT_LENGTH = 500;

/**
 * Minimum allowed input length
 */
const MIN_INPUT_LENGTH = 1;

/**
 * Validate and sanitize user input question
 * 
 * @param question - User input to validate
 * @returns ValidationResult with valid flag, sanitized input, or error message
 */
export function validateAndSanitizeQuestion(question: unknown): ValidationResult {
  // Type validation
  if (question === null || question === undefined) {
    return { 
      valid: false, 
      error: 'Input is required' 
    };
  }

  if (typeof question !== 'string') {
    return { 
      valid: false, 
      error: 'Input must be text' 
    };
  }

  // Trim whitespace
  const trimmed = question.trim();

  // Length validation
  if (trimmed.length < MIN_INPUT_LENGTH) {
    return { 
      valid: false, 
      error: 'Input cannot be empty' 
    };
  }

  if (trimmed.length > MAX_INPUT_LENGTH) {
    return { 
      valid: false, 
      error: `Input too long (maximum ${MAX_INPUT_LENGTH} characters)` 
    };
  }

  // Check for SQL injection patterns
  for (const pattern of SQL_INJECTION_PATTERNS) {
    if (pattern.test(trimmed)) {
      console.warn('[Input Validation] Blocked SQL injection attempt:', {
        pattern: pattern.source,
        input: trimmed.substring(0, 50) + '...'
      });
      return { 
        valid: false, 
        error: 'Invalid input detected' 
      };
    }
  }

  // Check for prompt injection patterns
  for (const pattern of PROMPT_INJECTION_PATTERNS) {
    if (pattern.test(trimmed)) {
      console.warn('[Input Validation] Blocked prompt injection attempt:', {
        pattern: pattern.source,
        input: trimmed.substring(0, 50) + '...'
      });
      return { 
        valid: false, 
        error: 'Invalid input detected' 
      };
    }
  }

  // Check for command injection patterns
  for (const pattern of COMMAND_INJECTION_PATTERNS) {
    if (pattern.test(trimmed)) {
      console.warn('[Input Validation] Blocked command injection attempt:', {
        pattern: pattern.source,
        input: trimmed.substring(0, 50) + '...'
      });
      return { 
        valid: false, 
        error: 'Invalid input detected' 
      };
    }
  }

  // Check for data exfiltration patterns
  for (const pattern of DATA_EXFILTRATION_PATTERNS) {
    if (pattern.test(trimmed)) {
      console.warn('[Input Validation] Blocked data exfiltration attempt:', {
        pattern: pattern.source,
        input: trimmed.substring(0, 50) + '...'
      });
      return { 
        valid: false, 
        error: 'Invalid input detected' 
      };
    }
  }

  // Remove control characters (but preserve newlines and tabs for legitimate use)
  const sanitized = trimmed.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

  // Additional sanitization: normalize whitespace
  const normalized = sanitized.replace(/\s+/g, ' ').trim();

  // Final length check after sanitization
  if (normalized.length < MIN_INPUT_LENGTH) {
    return { 
      valid: false, 
      error: 'Input cannot be empty' 
    };
  }

  return { 
    valid: true, 
    sanitized: normalized 
  };
}

/**
 * Validate session ID format
 * 
 * @param sessionId - Session ID to validate
 * @returns ValidationResult
 */
export function validateSessionId(sessionId: unknown): ValidationResult {
  if (sessionId === undefined || sessionId === null) {
    // Session ID is optional
    return { valid: true };
  }

  if (typeof sessionId !== 'string') {
    return { 
      valid: false, 
      error: 'Session ID must be a string' 
    };
  }

  // Session IDs should be alphanumeric with hyphens (UUID format)
  const sessionIdPattern = /^[a-zA-Z0-9-_]{1,128}$/;
  if (!sessionIdPattern.test(sessionId)) {
    return { 
      valid: false, 
      error: 'Invalid session ID format' 
    };
  }

  return { 
    valid: true, 
    sanitized: sessionId 
  };
}

/**
 * Sanitize text for safe display (secondary layer)
 * Removes any remaining potentially dangerous content
 * 
 * @param text - Text to sanitize
 * @returns Sanitized text
 */
export function sanitizeForDisplay(text: string): string {
  // Remove any HTML tags
  let sanitized = text.replace(/<[^>]*>/g, '');
  
  // Remove control characters
  sanitized = sanitized.replace(/[\x00-\x1F\x7F]/g, '');
  
  // Normalize whitespace
  sanitized = sanitized.replace(/\s+/g, ' ').trim();
  
  return sanitized;
}

/**
 * Validate and sanitize image generation parameters
 *
 * Note: Both names and descriptions are typically AI-generated and don't need
 * the same strict security validation as direct user input. We only validate
 * length and sanitize control characters.
 *
 * @param name - Object name (AI-generated)
 * @param description - Object description (AI-generated)
 * @returns ValidationResult for both fields
 */
export function validateImageGenerationInput(
  name: unknown,
  description: unknown
): { valid: boolean; errors?: { name?: string; description?: string }; sanitized?: { name: string; description: string } } {
  const errors: { name?: string; description?: string } = {};
  
  // Validate name (lenient validation for AI-generated content)
  if (name !== undefined && name !== null) {
    if (typeof name !== 'string') {
      errors.name = 'Name must be text';
    } else {
      const trimmedName = name.trim();
      if (trimmedName.length > 100) {
        errors.name = 'Name too long (maximum 100 characters)';
      }
      // Note: No security pattern checks for AI-generated names
    }
  }
  
  // Validate description (lenient validation for AI-generated content)
  if (!description || typeof description !== 'string') {
    errors.description = 'Description is required';
  } else {
    const trimmedDesc = description.trim();
    if (trimmedDesc.length === 0) {
      errors.description = 'Description cannot be empty';
    } else if (trimmedDesc.length > 500) {
      errors.description = 'Description too long (maximum 500 characters)';
    }
    // Note: No security pattern checks for AI-generated descriptions
  }
  
  if (Object.keys(errors).length > 0) {
    return { valid: false, errors };
  }
  
  // Sanitize both fields (remove control characters only)
  const sanitizedName = name && typeof name === 'string'
    ? name.trim().replace(/[\x00-\x1F\x7F]/g, '').substring(0, 100)
    : '';
  const sanitizedDescription = typeof description === 'string'
    ? description.trim().replace(/[\x00-\x1F\x7F]/g, '').substring(0, 500)
    : '';
  
  return {
    valid: true,
    sanitized: {
      name: sanitizedName,
      description: sanitizedDescription
    }
  };
}

// Made with Bob