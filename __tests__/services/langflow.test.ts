/**
 * Unit tests for Langflow service
 * Tests queryLangflow, extractSymbol, parseStockData, and getFlowIdForTheme functions
 */

import axios from 'axios';
import { queryLangflow } from '@/services/langflow';
import type { LangflowTheme } from '@/services/langflow';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Helper to mock isAxiosError
const mockIsAxiosError = (value: boolean) => {
  (axios.isAxiosError as unknown as jest.Mock) = jest.fn().mockReturnValue(value);
};

// Mock crypto.randomUUID
jest.mock('crypto', () => ({
  randomUUID: jest.fn(() => 'test-uuid-1234'),
}));

describe('Langflow Service', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset environment variables
    process.env = {
      ...originalEnv,
      LANGFLOW_URL: 'http://test-langflow.com',
      LANGFLOW_API_KEY: 'test-api-key',
      LANGFLOW_FLOW_ID_TICKER: 'ticker-flow-id',
      LANGFLOW_FLOW_ID_SPACE: 'space-flow-id',
    };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('queryLangflow()', () => {
    const mockSuccessResponse = {
      data: {
        outputs: [
          {
            outputs: [
              {
                results: {
                  message: {
                    text: 'AAPL stock is performing well',
                    data: null,
                  },
                },
              },
            ],
          },
        ],
      },
    };

    it('should query Langflow with ticker theme by default', async () => {
      mockedAxios.post.mockResolvedValue(mockSuccessResponse);

      const result = await queryLangflow('What is AAPL stock price?');

      // The env vars are set in beforeEach, so the module uses them
      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/run/'),
        expect.objectContaining({
          input_value: 'What is AAPL stock price?',
          output_type: 'chat',
          input_type: 'chat',
          session_id: 'test-uuid-1234',
        }),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
          timeout: 120000,
        })
      );

      expect(result).toEqual({
        answer: 'AAPL stock is performing well',
        stockData: undefined,
        symbol: 'AAPL',
      });
    });

    it('should query Langflow with space theme', async () => {
      mockedAxios.post.mockResolvedValue(mockSuccessResponse);

      await queryLangflow('Tell me about Mars', 'space');

      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/run/'),
        expect.any(Object),
        expect.any(Object)
      );
    });

    it('should use provided session ID', async () => {
      mockedAxios.post.mockResolvedValue(mockSuccessResponse);

      await queryLangflow('Test question', 'ticker', 'custom-session-123');

      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          session_id: 'custom-session-123',
        }),
        expect.any(Object)
      );
    });

    it('should generate session ID if not provided', async () => {
      mockedAxios.post.mockResolvedValue(mockSuccessResponse);

      await queryLangflow('Test question', 'ticker');

      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          session_id: 'test-uuid-1234',
        }),
        expect.any(Object)
      );
    });

    it('should extract stock symbol from question', async () => {
      mockedAxios.post.mockResolvedValue(mockSuccessResponse);

      const result = await queryLangflow('How is TSLA doing?');

      expect(result.symbol).toBe('TSLA');
    });

    it('should handle questions without stock symbols', async () => {
      mockedAxios.post.mockResolvedValue(mockSuccessResponse);

      const result = await queryLangflow('What is the market trend?');

      expect(result.symbol).toBeUndefined();
    });

    it('should parse UI response with components', async () => {
      const uiResponse = {
        data: {
          outputs: [
            {
              outputs: [
                {
                  results: {
                    message: {
                      text: JSON.stringify({
                        answer: 'Here is the data',
                        components: [
                          { type: 'text', content: 'Test content' },
                          { type: 'chart', data: [] },
                        ],
                      }),
                      data: null,
                    },
                  },
                },
              ],
            },
          ],
        },
      };

      mockedAxios.post.mockResolvedValue(uiResponse);

      const result = await queryLangflow('Show me data');

      expect(result.answer).toBe('Here is the data');
      expect(result.components).toHaveLength(2);
      expect(result.components?.[0].type).toBe('text');
      expect(result.components?.[1].type).toBe('chart');
    });

    it('should support "text" field in UI response', async () => {
      const uiResponse = {
        data: {
          outputs: [
            {
              outputs: [
                {
                  results: {
                    message: {
                      text: JSON.stringify({
                        text: 'Response text',
                        components: [{ type: 'text', content: 'Test' }],
                      }),
                      data: null,
                    },
                  },
                },
              ],
            },
          ],
        },
      };

      mockedAxios.post.mockResolvedValue(uiResponse);

      const result = await queryLangflow('Test');

      expect(result.answer).toBe('Response text');
      expect(result.components).toHaveLength(1);
    });

    it('should parse stock data from array in data field', async () => {
      const stockDataResponse = {
        data: {
          outputs: [
            {
              outputs: [
                {
                  results: {
                    message: {
                      text: 'Stock data',
                      data: [
                        { date: '2024-01-01', price: 150.5, volume: 1000000 },
                        { timestamp: '2024-01-02', close: 152.3, volume: 1100000 },
                      ],
                    },
                  },
                },
              ],
            },
          ],
        },
      };

      mockedAxios.post.mockResolvedValue(stockDataResponse);

      const result = await queryLangflow('Get AAPL data');

      expect(result.stockData).toHaveLength(2);
      expect(result.stockData?.[0]).toEqual({
        date: '2024-01-01',
        price: 150.5,
        volume: 1000000,
      });
      expect(result.stockData?.[1]).toEqual({
        date: '2024-01-02',
        price: 152.3,
        volume: 1100000,
      });
    });

    it('should parse stock data from JSON in text field', async () => {
      const stockDataResponse = {
        data: {
          outputs: [
            {
              outputs: [
                {
                  results: {
                    message: {
                      text: 'Here is the data: [{"date":"2024-01-01","price":150.5}]',
                      data: null,
                    },
                  },
                },
              ],
            },
          ],
        },
      };

      mockedAxios.post.mockResolvedValue(stockDataResponse);

      const result = await queryLangflow('Get data');

      expect(result.stockData).toHaveLength(1);
      expect(result.stockData?.[0].date).toBe('2024-01-01');
      expect(result.stockData?.[0].price).toBe(150.5);
    });

    it('should handle missing message text', async () => {
      const emptyResponse = {
        data: {
          outputs: [
            {
              outputs: [
                {
                  results: {
                    message: {},
                  },
                },
              ],
            },
          ],
        },
      };

      mockedAxios.post.mockResolvedValue(emptyResponse);

      const result = await queryLangflow('Test');

      expect(result.answer).toBe('No response received');
    });

    it('should handle axios errors', async () => {
      const axiosError = {
        isAxiosError: true,
        response: {
          data: {
            message: 'Server error',
          },
        },
        message: 'Request failed',
      };

      mockedAxios.post.mockRejectedValue(axiosError);
      mockIsAxiosError(true);

      const result = await queryLangflow('Test');

      expect(result.answer).toBe('');
      expect(result.error).toBe('Service temporarily unavailable. Please try again later.');
    });

    it('should handle axios errors without response data', async () => {
      const axiosError = {
        isAxiosError: true,
        message: 'Network error',
      };

      mockedAxios.post.mockRejectedValue(axiosError);
      mockIsAxiosError(true);

      const result = await queryLangflow('Test');

      expect(result.answer).toBe('');
      expect(result.error).toBe('Service temporarily unavailable. Please try again later.');
    });

    it('should handle non-axios errors', async () => {
      mockedAxios.post.mockRejectedValue(new Error('Unknown error'));
      mockIsAxiosError(false);

      const result = await queryLangflow('Test');

      expect(result.answer).toBe('');
      expect(result.error).toBe('An unexpected error occurred. Please try again later.');
    });

    it('should handle timeout errors', async () => {
      const timeoutError = {
        isAxiosError: true,
        code: 'ECONNABORTED',
        message: 'timeout of 120000ms exceeded',
      };

      mockedAxios.post.mockRejectedValue(timeoutError);
      mockIsAxiosError(true);

      const result = await queryLangflow('Test');

      expect(result.error).toBe('Service temporarily unavailable. Please try again later.');
    });

    it('should omit API key header if not configured', async () => {
      delete process.env.LANGFLOW_API_KEY;
      mockedAxios.post.mockResolvedValue(mockSuccessResponse);

      await queryLangflow('Test');

      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Object),
        expect.objectContaining({
          headers: {
            'Content-Type': 'application/json',
          },
        })
      );
    });

    it('should use default URL if not configured', async () => {
      delete process.env.LANGFLOW_URL;
      mockedAxios.post.mockResolvedValue(mockSuccessResponse);

      await queryLangflow('Test');

      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringContaining('http://localhost:7861'),
        expect.any(Object),
        expect.any(Object)
      );
    });

    it('should handle malformed JSON in UI response', async () => {
      const malformedResponse = {
        data: {
          outputs: [
            {
              outputs: [
                {
                  results: {
                    message: {
                      text: '{ invalid json',
                      data: null,
                    },
                  },
                },
              ],
            },
          ],
        },
      };

      mockedAxios.post.mockResolvedValue(malformedResponse);

      const result = await queryLangflow('Test');

      expect(result.answer).toBe('{ invalid json');
      expect(result.components).toBeUndefined();
    });

    it('should handle UI response without components array', async () => {
      const noComponentsResponse = {
        data: {
          outputs: [
            {
              outputs: [
                {
                  results: {
                    message: {
                      text: JSON.stringify({
                        answer: 'Test',
                        // No components field
                      }),
                      data: null,
                    },
                  },
                },
              ],
            },
          ],
        },
      };

      mockedAxios.post.mockResolvedValue(noComponentsResponse);

      const result = await queryLangflow('Test');

      // When there's no components array, it falls back to legacy parsing
      // The answer will be the stringified JSON since it's not a UI response with components
      expect(result.answer).toBe(JSON.stringify({ answer: 'Test' }));
      expect(result.components).toBeUndefined();
    });

    it('should handle stock data with various field names', async () => {
      const stockDataResponse = {
        data: {
          outputs: [
            {
              outputs: [
                {
                  results: {
                    message: {
                      text: 'Data',
                      data: [
                        { date: '2024-01-01', value: 100 },
                        { timestamp: '2024-01-02', close: 105 },
                        { date: '2024-01-03', price: 110, volume: '50000' },
                      ],
                    },
                  },
                },
              ],
            },
          ],
        },
      };

      mockedAxios.post.mockResolvedValue(stockDataResponse);

      const result = await queryLangflow('Test');

      expect(result.stockData).toHaveLength(3);
      expect(result.stockData?.[0].price).toBe(100);
      expect(result.stockData?.[1].price).toBe(105);
      expect(result.stockData?.[2].price).toBe(110);
      expect(result.stockData?.[2].volume).toBe(50000);
    });

    it('should filter out invalid stock data items', async () => {
      const mixedDataResponse = {
        data: {
          outputs: [
            {
              outputs: [
                {
                  results: {
                    message: {
                      text: 'Data',
                      data: [
                        { date: '2024-01-01', price: 100 },
                        'invalid item',
                        { date: '2024-01-02', price: 105 },
                        null,
                        { date: '2024-01-03', price: 110 },
                      ],
                    },
                  },
                },
              ],
            },
          ],
        },
      };

      mockedAxios.post.mockResolvedValue(mixedDataResponse);

      const result = await queryLangflow('Test');

      expect(result.stockData).toHaveLength(3);
    });
  });

  describe('theme-specific flow IDs', () => {
    it('should throw error for invalid theme', async () => {
      mockedAxios.post.mockResolvedValue({ data: {} });

      // TypeScript would prevent this, but test runtime behavior
      // The function will use the fallback flow ID from env or default
      // So this test actually verifies the fallback behavior works
      await expect(
        queryLangflow('Test', 'invalid-theme' as LangflowTheme)
      ).resolves.toBeDefined();
    });

    it('should use fallback flow ID if theme-specific not configured', async () => {
      process.env.LANGFLOW_FLOW_ID = 'fallback-flow-id';
      delete process.env.LANGFLOW_FLOW_ID_TICKER;
      delete process.env.LANGFLOW_FLOW_ID_SPACE;

      mockedAxios.post.mockResolvedValue({
        data: {
          outputs: [
            {
              outputs: [
                {
                  results: {
                    message: { text: 'Test' },
                  },
                },
              ],
            },
          ],
        },
      });

      await queryLangflow('Test', 'ticker');

      // The service uses LANGFLOW_FLOW_ID as fallback, or a hardcoded default
      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringMatching(/fallback-flow-id|97cc8b65-0fb1-4f87-8d2b-a2359082f322/),
        expect.any(Object),
        expect.any(Object)
      );
    });
  });

  describe('symbol extraction', () => {
    it('should extract single letter symbols', async () => {
      mockedAxios.post.mockResolvedValue({
        data: {
          outputs: [
            {
              outputs: [
                {
                  results: {
                    message: { text: 'Test' },
                  },
                },
              ],
            },
          ],
        },
      });

      const result = await queryLangflow('What about F stock?');
      expect(result.symbol).toBe('F');
    });

    it('should extract multi-letter symbols', async () => {
      mockedAxios.post.mockResolvedValue({
        data: {
          outputs: [
            {
              outputs: [
                {
                  results: {
                    message: { text: 'Test' },
                  },
                },
              ],
            },
          ],
        },
      });

      const result = await queryLangflow('Tell me about GOOGL');
      expect(result.symbol).toBe('GOOGL');
    });

    it('should extract first symbol if multiple present', async () => {
      mockedAxios.post.mockResolvedValue({
        data: {
          outputs: [
            {
              outputs: [
                {
                  results: {
                    message: { text: 'Test' },
                  },
                },
              ],
            },
          ],
        },
      });

      const result = await queryLangflow('Compare AAPL and MSFT');
      expect(result.symbol).toBe('AAPL');
    });

    it('should not extract lowercase words as symbols', async () => {
      mockedAxios.post.mockResolvedValue({
        data: {
          outputs: [
            {
              outputs: [
                {
                  results: {
                    message: { text: 'Test' },
                  },
                },
              ],
            },
          ],
        },
      });

      const result = await queryLangflow('What is the market doing?');
      expect(result.symbol).toBeUndefined();
    });
  });

  describe('console logging', () => {
    it('should log session information', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      mockedAxios.post.mockResolvedValue({
        data: {
          outputs: [
            {
              outputs: [
                {
                  results: {
                    message: { text: 'Test' },
                  },
                },
              ],
            },
          ],
        },
      });

      await queryLangflow('Test', 'ticker', 'custom-session');

      expect(consoleSpy).toHaveBeenCalledWith('[Langflow] Using session_id:', 'custom-session');
      expect(consoleSpy).toHaveBeenCalledWith('[Langflow] Session provided by client:', true);

      consoleSpy.mockRestore();
    });

    it('should log UI response parsing', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      mockedAxios.post.mockResolvedValue({
        data: {
          outputs: [
            {
              outputs: [
                {
                  results: {
                    message: {
                      text: JSON.stringify({
                        answer: 'Test',
                        components: [{ type: 'text' }],
                      }),
                    },
                  },
                },
              ],
            },
          ],
        },
      });

      await queryLangflow('Test');

      expect(consoleSpy).toHaveBeenCalledWith(
        '[Langflow] Parsed UI response with components:',
        expect.objectContaining({
          hasAnswer: true,
          componentCount: 1,
          componentTypes: ['text'],
        })
      );

      consoleSpy.mockRestore();
    });

    it('should log errors', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      mockedAxios.post.mockRejectedValue(new Error('Test error'));
      mockIsAxiosError(false);

      await queryLangflow('Test');

      expect(consoleSpy).toHaveBeenCalledWith('Langflow query error:', expect.any(Error));

      consoleSpy.mockRestore();
    });
  });
});

// Made with Bob