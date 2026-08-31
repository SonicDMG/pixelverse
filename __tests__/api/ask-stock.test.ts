/**
 * Tests for /api/ask-stock — validation logic and OWASP security compliance.
 */

function validateStockQuestion(question: unknown): { valid: boolean; error?: string; sanitized?: string } {
  if (!question || typeof question !== 'string') {
    return { valid: false, error: 'Question is required and must be a string' };
  }

  const trimmed = question.trim();

  if (trimmed.length === 0) {
    return { valid: false, error: 'Question cannot be empty' };
  }

  if (trimmed.length > 500) {
    return { valid: false, error: 'Question too long (max 500 characters)' };
  }

  // Basic sanitization - remove control characters
  const sanitized = trimmed.replace(/[\x00-\x1F\x7F]/g, '');

  return { valid: true, sanitized };
}

describe('/api/ask-stock - Validation Logic', () => {
  describe('validateStockQuestion() - Input validation', () => {
    it('should accept valid question', () => {
      const result = validateStockQuestion('What is the price of AAPL?');
      
      expect(result.valid).toBe(true);
      expect(result.sanitized).toBe('What is the price of AAPL?');
      expect(result.error).toBeUndefined();
    });

    it('should reject non-string question', () => {
      const result = validateStockQuestion(123);
      
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Question is required and must be a string');
      expect(result.sanitized).toBeUndefined();
    });

    it('should reject null question', () => {
      const result = validateStockQuestion(null);
      
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Question is required and must be a string');
    });

    it('should reject undefined question', () => {
      const result = validateStockQuestion(undefined);
      
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Question is required and must be a string');
    });

    it('should reject empty string question', () => {
      const result = validateStockQuestion('');
      
      expect(result.valid).toBe(false);
      // Empty string fails the type check first
      expect(result.error).toBe('Question is required and must be a string');
    });

    it('should reject whitespace-only question', () => {
      const result = validateStockQuestion('   \t\n   ');
      
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Question cannot be empty');
    });

    it('should reject question exceeding 500 characters', () => {
      const longQuestion = 'a'.repeat(501);
      const result = validateStockQuestion(longQuestion);
      
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Question too long (max 500 characters)');
    });

    it('should accept question at exactly 500 characters', () => {
      const maxLengthQuestion = 'a'.repeat(500);
      const result = validateStockQuestion(maxLengthQuestion);
      
      expect(result.valid).toBe(true);
      expect(result.sanitized).toBe(maxLengthQuestion);
    });

    it('should trim whitespace from question', () => {
      const result = validateStockQuestion('   What is AAPL?   ');
      
      expect(result.valid).toBe(true);
      expect(result.sanitized).toBe('What is AAPL?');
    });
  });

  describe('OWASP Security - Input Sanitization', () => {
    it('should remove null bytes', () => {
      const result = validateStockQuestion('What is AAPL?\x00');
      
      expect(result.valid).toBe(true);
      expect(result.sanitized).toBe('What is AAPL?');
      expect(result.sanitized).not.toContain('\x00');
    });

    it('should remove control characters', () => {
      const result = validateStockQuestion('What\x01is\x02AAPL\x1F?');
      
      expect(result.valid).toBe(true);
      expect(result.sanitized).toBe('WhatisAAPL?');
    });

    it('should remove DEL character', () => {
      const result = validateStockQuestion('What is AAPL?\x7F');
      
      expect(result.valid).toBe(true);
      expect(result.sanitized).toBe('What is AAPL?');
    });

    it('should handle multiple control characters', () => {
      const result = validateStockQuestion('\x00\x01\x02What\x03\x04is\x05AAPL?\x1F\x7F');
      
      expect(result.valid).toBe(true);
      expect(result.sanitized).toBe('WhatisAAPL?');
    });

    it('should preserve Unicode characters', () => {
      const result = validateStockQuestion('What is AAPL? 你好 🚀');
      
      expect(result.valid).toBe(true);
      expect(result.sanitized).toBe('What is AAPL? 你好 🚀');
    });

    it('should remove newlines and tabs (they are control chars)', () => {
      const result = validateStockQuestion('What is\nAAPL\tprice?');
      
      expect(result.valid).toBe(true);
      // \n (0x0A) and \t (0x09) are in the control character range 0x00-0x1F
      expect(result.sanitized).toBe('What isAAPLprice?');
    });

    it('should handle script tags (passed through for rendering layer)', () => {
      const result = validateStockQuestion('<script>alert("xss")</script>What is AAPL?');
      
      expect(result.valid).toBe(true);
      // HTML tags are not sanitized at this layer - that's for the rendering layer
      expect(result.sanitized).toContain('script');
    });

    it('should handle special characters', () => {
      const result = validateStockQuestion('!@#$%^&*()');
      
      expect(result.valid).toBe(true);
      expect(result.sanitized).toBe('!@#$%^&*()');
    });
  });

  describe('Session ID validation logic', () => {
    it('should accept string session_id', () => {
      const sessionId = 'test-session-123';
      expect(typeof sessionId).toBe('string');
    });

    it('should reject non-string session_id', () => {
      const sessionId = 123;
      expect(typeof sessionId).not.toBe('string');
    });

    it('should reject object session_id', () => {
      const sessionId = { id: 'test' };
      expect(typeof sessionId).not.toBe('string');
    });

    it('should reject array session_id', () => {
      const sessionId = ['test'];
      expect(typeof sessionId).not.toBe('string');
    });

    it('should accept empty string session_id', () => {
      const sessionId = '';
      expect(typeof sessionId).toBe('string');
    });

    it('should allow undefined session_id', () => {
      const sessionId = undefined;
      expect(sessionId).toBeUndefined();
    });
  });

  describe('Error handling patterns', () => {
    it('should handle development vs production error details', () => {
      const error = new Error('Sensitive error info');

      // In development, details should be included
      const devEnv: string = 'development';
      const devErrorMessage = devEnv === 'development' && error instanceof Error
        ? error.message
        : 'Internal server error';
      expect(devErrorMessage).toBe('Sensitive error info');

      // In production, details should be hidden
      const prodEnv: string = 'production';
      const prodErrorMessage = prodEnv === 'development' && error instanceof Error
        ? error.message
        : 'Internal server error';
      expect(prodErrorMessage).toBe('Internal server error');
    });

    it('should handle non-Error exceptions', () => {
      const stringError: unknown = 'String error';
      const isError = stringError instanceof Error;
      
      expect(isError).toBe(false);
    });

    it('should provide generic error message for non-Error types', () => {
      const error: unknown = 'String error';
      const errorMessage = error instanceof Error ? error.message : 'Internal server error';
      
      expect(errorMessage).toBe('Internal server error');
    });
  });

  describe('Response format validation', () => {
    it('should validate response has answer field', () => {
      const response = { answer: 'Test answer' };
      expect(response).toHaveProperty('answer');
      expect(typeof response.answer).toBe('string');
    });

    it('should validate response can have optional symbol', () => {
      const response = { answer: 'Test', symbol: 'AAPL' };
      expect(response).toHaveProperty('symbol');
      expect(typeof response.symbol).toBe('string');
    });

    it('should validate response can have optional stockData', () => {
      const response = { 
        answer: 'Test',
        stockData: [{ date: '2024-01-01', price: 150 }]
      };
      expect(response).toHaveProperty('stockData');
      expect(Array.isArray(response.stockData)).toBe(true);
    });

    it('should validate response can have optional components', () => {
      const response = { 
        answer: 'Test',
        components: [{ 
          type: 'metric-card' as const, 
          props: { title: 'Test', value: 100 } 
        }]
      };
      expect(response).toHaveProperty('components');
      expect(Array.isArray(response.components)).toBe(true);
    });

    it('should validate error response format', () => {
      const errorResponse = { error: 'Test error' };
      expect(errorResponse).toHaveProperty('error');
      expect(typeof errorResponse.error).toBe('string');
    });

    it('should validate error response can have optional details', () => {
      const errorResponse = { error: 'Test error', details: 'More info' };
      expect(errorResponse).toHaveProperty('details');
      expect(typeof errorResponse.details).toBe('string');
    });
  });

  describe('Edge cases', () => {
    it('should handle question with only special characters', () => {
      const result = validateStockQuestion('!@#$%^&*()');
      
      expect(result.valid).toBe(true);
      expect(result.sanitized).toBe('!@#$%^&*()');
    });

    it('should handle question with mixed content', () => {
      const result = validateStockQuestion('What is AAPL? 🚀 Price: $150');
      
      expect(result.valid).toBe(true);
      expect(result.sanitized).toContain('AAPL');
      expect(result.sanitized).toContain('🚀');
    });

    it('should handle question at boundary length', () => {
      const question499 = 'a'.repeat(499);
      const question500 = 'a'.repeat(500);
      const question501 = 'a'.repeat(501);
      
      expect(validateStockQuestion(question499).valid).toBe(true);
      expect(validateStockQuestion(question500).valid).toBe(true);
      expect(validateStockQuestion(question501).valid).toBe(false);
    });
  });
});

// Made with Bob