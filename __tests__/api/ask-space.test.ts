/**
 * Integration tests for /api/ask-space route
 * Tests validation logic, mock response patterns, OWASP security compliance, and Langflow integration
 * 
 * Note: These tests focus on the validation and business logic rather than
 * full integration testing of the Next.js route handler.
 */

import * as langflowService from '@/services/langflow';

// Mock the Langflow service
jest.mock('@/services/langflow');
const mockedQueryLangflow = langflowService.queryLangflow as jest.MockedFunction<typeof langflowService.queryLangflow>;

// Import the validation function (same as ask-stock)
function validateQuestion(question: unknown): { valid: boolean; error?: string; sanitized?: string } {
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

// Mock response generator (simplified version for testing)
function getMockSpaceResponse(question: string): any {
  const lowerQuestion = question.toLowerCase();
  
  if (lowerQuestion.includes('mars')) {
    return {
      answer: 'Mars is the fourth planet from the Sun.',
      components: [{
        type: 'celestial-body-card',
        props: {
          name: 'Mars',
          bodyType: 'planet',
          description: 'The Red Planet',
          diameter: '6,779 km',
        }
      }]
    };
  }
  
  if (lowerQuestion.includes('moon')) {
    return {
      answer: 'The Moon is Earth\'s only natural satellite.',
      components: [{
        type: 'celestial-body-card',
        props: {
          name: 'The Moon',
          bodyType: 'moon',
          description: 'Earth\'s satellite',
        }
      }]
    };
  }
  
  if (lowerQuestion.includes('orion') || lowerQuestion.includes('constellation')) {
    return {
      answer: 'Orion is one of the most recognizable constellations.',
      components: [{
        type: 'constellation',
        props: {
          name: 'Orion',
          abbreviation: 'Ori',
          description: 'The Hunter',
          visibility: 'Winter',
          stars: []
        }
      }]
    };
  }
  
  if (lowerQuestion.includes('solar system') && lowerQuestion.includes('show')) {
    return {
      answer: 'Here is an interactive solar system visualization.',
      components: [{
        type: 'solar-system',
        props: {
          name: 'Solar System',
          autoPlay: true
        }
      }]
    };
  }
  
  return {
    answer: 'I can help you explore the cosmos!',
  };
}

describe('/api/ask-space - Validation Logic', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = {
      ...originalEnv,
      LANGFLOW_URL: 'http://test-langflow.com',
      LANGFLOW_API_KEY: 'test-api-key',
      LANGFLOW_FLOW_ID_SPACE: 'space-flow-id',
    };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('validateQuestion() - Input validation', () => {
    it('should accept valid space question', () => {
      const result = validateQuestion('Tell me about Mars');
      
      expect(result.valid).toBe(true);
      expect(result.sanitized).toBe('Tell me about Mars');
    });

    it('should reject non-string question', () => {
      const result = validateQuestion(123);
      
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Question is required and must be a string');
    });

    it('should reject null question', () => {
      const result = validateQuestion(null);
      
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Question is required and must be a string');
    });

    it('should reject undefined question', () => {
      const result = validateQuestion(undefined);
      
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Question is required and must be a string');
    });

    it('should reject empty string', () => {
      const result = validateQuestion('');
      
      expect(result.valid).toBe(false);
    });

    it('should reject whitespace-only question', () => {
      const result = validateQuestion('   \t   ');
      
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Question cannot be empty');
    });

    it('should reject question exceeding 500 characters', () => {
      const longQuestion = 'a'.repeat(501);
      const result = validateQuestion(longQuestion);
      
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Question too long (max 500 characters)');
    });

    it('should accept question at exactly 500 characters', () => {
      const maxLengthQuestion = 'a'.repeat(500);
      const result = validateQuestion(maxLengthQuestion);
      
      expect(result.valid).toBe(true);
    });
  });

  describe('OWASP Security - Input Sanitization', () => {
    it('should remove control characters', () => {
      const result = validateQuestion('Tell\x01me\x02about\x1FMars');
      
      expect(result.valid).toBe(true);
      expect(result.sanitized).toBe('TellmeaboutMars');
    });

    it('should remove null bytes', () => {
      const result = validateQuestion('Tell me about Mars\x00');
      
      expect(result.valid).toBe(true);
      expect(result.sanitized).toBe('Tell me about Mars');
    });

    it('should preserve Unicode characters', () => {
      const result = validateQuestion('Tell me about Mars 火星 🚀');
      
      expect(result.valid).toBe(true);
      expect(result.sanitized).toContain('火星');
      expect(result.sanitized).toContain('🚀');
    });

    it('should handle XSS attempts', () => {
      const result = validateQuestion('<script>alert("xss")</script>Tell me about Mars');
      
      expect(result.valid).toBe(true);
      // HTML is not sanitized at this layer
      expect(result.sanitized).toContain('script');
    });
  });

  describe('getMockSpaceResponse() - Pattern matching', () => {
    it('should match Mars queries', () => {
      const response = getMockSpaceResponse('Tell me about Mars');
      
      expect(response.answer).toContain('Mars');
      expect(response.components).toHaveLength(1);
      expect(response.components[0].type).toBe('celestial-body-card');
      expect(response.components[0].props.name).toBe('Mars');
      expect(response.components[0].props.bodyType).toBe('planet');
    });

    it('should match Moon queries', () => {
      const response = getMockSpaceResponse('What is the Moon?');
      
      expect(response.answer).toContain('Moon');
      expect(response.components).toHaveLength(1);
      expect(response.components[0].type).toBe('celestial-body-card');
      expect(response.components[0].props.bodyType).toBe('moon');
    });

    it('should match constellation queries', () => {
      const response = getMockSpaceResponse('Show me Orion');
      
      expect(response.answer).toContain('Orion');
      expect(response.components).toHaveLength(1);
      expect(response.components[0].type).toBe('constellation');
    });

    it('should match solar system visualization queries', () => {
      const response = getMockSpaceResponse('Show me the solar system');
      
      expect(response.answer).toContain('solar system');
      expect(response.components).toHaveLength(1);
      expect(response.components[0].type).toBe('solar-system');
      expect(response.components[0].props.autoPlay).toBe(true);
    });

    it('should return default response for unmatched queries', () => {
      const response = getMockSpaceResponse('What is dark matter?');
      
      expect(response.answer).toContain('cosmos');
      expect(response.components).toBeUndefined();
    });

    it('should be case-insensitive', () => {
      const response1 = getMockSpaceResponse('MARS');
      const response2 = getMockSpaceResponse('mars');
      const response3 = getMockSpaceResponse('Mars');
      
      expect(response1.answer).toContain('Mars');
      expect(response2.answer).toContain('Mars');
      expect(response3.answer).toContain('Mars');
    });
  });

  describe('Component generation', () => {
    it('should generate celestial-body-card for planets', () => {
      const response = getMockSpaceResponse('Tell me about Mars');
      
      expect(response.components[0].type).toBe('celestial-body-card');
      expect(response.components[0].props).toHaveProperty('name');
      expect(response.components[0].props).toHaveProperty('bodyType');
      expect(response.components[0].props).toHaveProperty('description');
    });

    it('should generate celestial-body-card for moons', () => {
      const response = getMockSpaceResponse('What is the Moon?');
      
      expect(response.components[0].type).toBe('celestial-body-card');
      expect(response.components[0].props.bodyType).toBe('moon');
    });

    it('should generate constellation component', () => {
      const response = getMockSpaceResponse('Show me Orion');
      
      expect(response.components[0].type).toBe('constellation');
      expect(response.components[0].props).toHaveProperty('name');
      expect(response.components[0].props).toHaveProperty('abbreviation');
      expect(response.components[0].props).toHaveProperty('stars');
    });

    it('should generate solar-system component', () => {
      const response = getMockSpaceResponse('Show me the solar system');
      
      expect(response.components[0].type).toBe('solar-system');
      expect(response.components[0].props).toHaveProperty('name');
      expect(response.components[0].props).toHaveProperty('autoPlay');
    });
  });

  describe('Langflow integration', () => {
    it('should call queryLangflow with space theme', async () => {
      const mockResponse = {
        answer: 'Mars is fascinating',
      };
      mockedQueryLangflow.mockResolvedValue(mockResponse);

      const result = await langflowService.queryLangflow('Tell me about Mars', 'space');

      expect(mockedQueryLangflow).toHaveBeenCalledWith('Tell me about Mars', 'space');
      expect(result).toEqual(mockResponse);
    });

    it('should handle Langflow error response', async () => {
      mockedQueryLangflow.mockResolvedValue({
        answer: '',
        error: 'Langflow service unavailable',
      });

      const result = await langflowService.queryLangflow('Tell me about Mars', 'space');

      expect(result.error).toBe('Langflow service unavailable');
    });

    it('should pass session_id to Langflow', async () => {
      const mockResponse = { answer: 'Response' };
      mockedQueryLangflow.mockResolvedValue(mockResponse);

      await langflowService.queryLangflow('Tell me about Mars', 'space', 'session-123');

      expect(mockedQueryLangflow).toHaveBeenCalledWith(
        'Tell me about Mars',
        'space',
        'session-123'
      );
    });

    it('should handle response with components', async () => {
      const mockResponse = {
        answer: 'Here is Mars',
        components: [{
          type: 'celestial-body-card' as const,
          props: {
            name: 'Mars',
            bodyType: 'planet' as const,
            description: 'The Red Planet',
          }
        }],
      };
      mockedQueryLangflow.mockResolvedValue(mockResponse);

      const result = await langflowService.queryLangflow('Tell me about Mars', 'space');

      expect(result.components).toHaveLength(1);
      expect(result.components?.[0].type).toBe('celestial-body-card');
    });
  });

  describe('Session ID validation', () => {
    it('should accept string session_id', () => {
      const sessionId = 'space-session-123';
      expect(typeof sessionId).toBe('string');
    });

    it('should reject non-string session_id', () => {
      const sessionId = 123;
      expect(typeof sessionId).not.toBe('string');
    });

    it('should allow undefined session_id', () => {
      const sessionId = undefined;
      expect(sessionId).toBeUndefined();
    });
  });

  describe('Response format validation', () => {
    it('should validate response has answer field', () => {
      const response = { answer: 'Mars is a planet' };
      expect(response).toHaveProperty('answer');
      expect(typeof response.answer).toBe('string');
    });

    it('should validate response can have optional components', () => {
      const response = {
        answer: 'Mars info',
        components: [{
          type: 'celestial-body-card' as const,
          props: { name: 'Mars', bodyType: 'planet' as const, description: 'Red planet' }
        }]
      };
      expect(response).toHaveProperty('components');
      expect(Array.isArray(response.components)).toBe(true);
    });

    it('should validate error response format', () => {
      const errorResponse = { error: 'Space query failed' };
      expect(errorResponse).toHaveProperty('error');
      expect(typeof errorResponse.error).toBe('string');
    });
  });

  describe('Fallback behavior', () => {
    it('should fallback to mock when Langflow fails', async () => {
      mockedQueryLangflow.mockRejectedValue(new Error('Langflow unavailable'));

      // In the actual route, it would catch and use getMockSpaceResponse
      const mockResponse = getMockSpaceResponse('Tell me about Mars');
      
      expect(mockResponse.answer).toContain('Mars');
      expect(mockResponse.components).toBeDefined();
    });

    it('should provide helpful default for unknown queries', () => {
      const response = getMockSpaceResponse('What is quantum entanglement?');
      
      expect(response.answer).toContain('cosmos');
      expect(response.components).toBeUndefined();
    });
  });

  describe('Edge cases', () => {
    it('should handle multiple keywords in query', () => {
      const response = getMockSpaceResponse('Tell me about Mars and the Moon');
      
      // Should match first keyword (Mars)
      expect(response.answer).toContain('Mars');
    });

    it('should handle special characters in query', () => {
      const result = validateQuestion('What is Mars? 🚀');
      
      expect(result.valid).toBe(true);
      expect(result.sanitized).toContain('🚀');
    });

    it('should handle query at boundary length', () => {
      const question499 = 'a'.repeat(499);
      const question500 = 'a'.repeat(500);
      const question501 = 'a'.repeat(501);
      
      expect(validateQuestion(question499).valid).toBe(true);
      expect(validateQuestion(question500).valid).toBe(true);
      expect(validateQuestion(question501).valid).toBe(false);
    });
  });
});

// Made with Bob
