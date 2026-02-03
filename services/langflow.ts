import axios from 'axios';
import { LangflowRequest, LangflowResponse, StockQueryResult, StockDataPoint } from '@/types';
import { randomUUID } from 'crypto';

/**
 * Extract stock symbol from question
 */
function extractSymbol(question: string): string | undefined {
  const symbolMatch = question.match(/\b([A-Z]{1,5})\b/);
  return symbolMatch ? symbolMatch[1] : undefined;
}

// Server-side only - no NEXT_PUBLIC_ prefix for security
const LANGFLOW_URL = process.env.LANGFLOW_URL || 'http://localhost:7861';
const LANGFLOW_API_KEY = process.env.LANGFLOW_API_KEY || '';

// Theme-specific flow IDs
const FLOW_IDS = {
  ticker: process.env.LANGFLOW_FLOW_ID_TICKER || process.env.LANGFLOW_FLOW_ID || '97cc8b65-0fb1-4f87-8d2b-a2359082f322',
  space: process.env.LANGFLOW_FLOW_ID_SPACE || process.env.LANGFLOW_FLOW_ID || '97cc8b65-0fb1-4f87-8d2b-a2359082f322',
};

/**
 * Valid theme types for Langflow queries
 */
export type LangflowTheme = 'ticker' | 'space';

/**
 * Get the flow ID for a specific theme
 * @param theme - The theme to get the flow ID for
 * @returns The flow ID for the specified theme
 * @throws Error if the theme is invalid or flow ID is not configured
 */
function getFlowIdForTheme(theme: LangflowTheme): string {
  const flowId = FLOW_IDS[theme];
  
  if (!flowId) {
    throw new Error(`Flow ID not configured for theme: ${theme}`);
  }
  
  return flowId;
}

/**
 * Raw stock data item from external sources
 */
interface RawStockDataItem {
  date?: string;
  timestamp?: string;
  price?: number | string;
  close?: number | string;
  value?: number | string;
  volume?: number | string;
}

/**
 * Type guard to check if value is a RawStockDataItem
 */
function isRawStockDataItem(item: unknown): item is RawStockDataItem {
  return (
    typeof item === 'object' &&
    item !== null &&
    ('date' in item || 'timestamp' in item)
  );
}

/**
 * Parse stock data from Langflow response
 * This function attempts to extract structured stock data from the response
 */
function parseStockData(responseText: string, data?: unknown): StockDataPoint[] | undefined {
  try {
    // Check if data object contains stock information
    if (Array.isArray(data)) {
      return data
        .filter(isRawStockDataItem)
        .map((item) => ({
          date: item.date || item.timestamp || '',
          price: parseFloat(String(item.price || item.close || item.value || 0)),
          volume: item.volume ? parseInt(String(item.volume), 10) : undefined,
        }));
    }

    // Try to parse JSON from response text
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const parsed: unknown = JSON.parse(jsonMatch[0]);
      if (Array.isArray(parsed)) {
        return parsed
          .filter(isRawStockDataItem)
          .map((item) => ({
            date: item.date || item.timestamp || '',
            price: parseFloat(String(item.price || item.close || item.value || 0)),
            volume: item.volume ? parseInt(String(item.volume), 10) : undefined,
          }));
      }
    }

    return undefined;
  } catch (error) {
    console.error('Error parsing stock data:', error);
    return undefined;
  }
}

/**
 * Query Langflow with a question for a specific theme
 * @param question - The question to ask
 * @param theme - The theme to use for selecting the appropriate flow ID (default: 'ticker')
 * @param sessionId - Optional session ID for conversation tracking. If not provided, a new UUID will be generated.
 */
export async function queryLangflow(
  question: string,
  theme: LangflowTheme = 'ticker',
  sessionId?: string
): Promise<StockQueryResult> {
  try {
    console.log(`[${new Date().toISOString()}] [Langflow] Starting API request for: "${question}"`);
    
    // Get the appropriate flow ID for the theme
    const flowId = getFlowIdForTheme(theme);

    const request: LangflowRequest = {
      input_value: question,
      output_type: 'chat',
      input_type: 'chat',
    };

    // Use provided session ID or generate fallback (for backward compatibility)
    const payload = {
      ...request,
      session_id: sessionId || randomUUID(),
    };

    // Log session info for debugging
    console.log('[Langflow] Using session_id:', payload.session_id);
    console.log('[Langflow] Session provided by client:', !!sessionId);

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Add API key if provided
    if (LANGFLOW_API_KEY) {
      headers['x-api-key'] = LANGFLOW_API_KEY;
    }

    console.log(`[${new Date().toISOString()}] [Langflow] Sending HTTP request to Langflow`);
    const response = await axios.post<LangflowResponse>(
      `${LANGFLOW_URL}/api/v1/run/${flowId}`,
      payload,
      {
        headers,
        timeout: 120000, // 120 second (2 minute) timeout for complex queries
      }
    );
    console.log(`[${new Date().toISOString()}] [Langflow] Received HTTP response from Langflow`);

    // Extract the response text
    const outputs = response.data.outputs?.[0]?.outputs?.[0]?.results;
    const messageText = outputs?.message?.text || 'No response received';
    const messageData = outputs?.message?.data;

    // Helper function to strip JavaScript-style comments from JSON
    const stripJsonComments = (jsonString: string): string => {
      // Remove single-line comments (// ...)
      let cleaned = jsonString.replace(/\/\/.*$/gm, '');
      // Remove multi-line comments (/* ... */)
      cleaned = cleaned.replace(/\/\*[\s\S]*?\*\//g, '');
      return cleaned;
    };

    // Try to parse as UI specification response
    let uiResponse: any = null;
    console.log('[Langflow] Raw messageText:', messageText.substring(0, 500)); // Log first 500 chars
    console.log('[Langflow] messageText starts with {:', messageText.trim().startsWith('{'));
    console.log('[Langflow] messageText starts with [:', messageText.trim().startsWith('['));
    
    try {
      // Check if messageText is JSON with components
      if (messageText.trim().startsWith('{')) {
        const cleanedMessageText = stripJsonComments(messageText);
        uiResponse = JSON.parse(cleanedMessageText);
        console.log('[Langflow] Successfully parsed JSON response:', {
          hasComponents: !!uiResponse.components,
          componentCount: uiResponse.components?.length,
          hasAnswer: !!uiResponse.answer,
          hasText: !!uiResponse.text,
          topLevelKeys: Object.keys(uiResponse)
        });
      }
    } catch (e) {
      console.error('[Langflow] Failed to parse messageText as JSON:', e);
      console.log('[Langflow] Failed messageText:', messageText);
    }

    // If we have a UI response with components, use it
    if (uiResponse && uiResponse.components && Array.isArray(uiResponse.components)) {
      // Support both "text" and "answer" field names for the response text
      const answerText = uiResponse.answer || uiResponse.text || messageText;
      console.log('[Langflow] Parsed UI response with components:', {
        hasAnswer: !!answerText,
        componentCount: uiResponse.components.length,
        componentTypes: uiResponse.components.map((c: any) => c.type),
      });
      return {
        answer: answerText,
        components: uiResponse.components,
        symbol: extractSymbol(question),
      };
    } else {
      console.log('[Langflow] No valid UI response found, falling back to stock data parsing');
    }

    // Otherwise, fall back to legacy stock data parsing
    const stockData = parseStockData(messageText, messageData);
    const symbol = extractSymbol(question);

    return {
      answer: messageText,
      stockData,
      symbol,
    };
  } catch (error) {
    console.error('Langflow query error:', error);
    
    if (axios.isAxiosError(error)) {
      return {
        answer: '',
        error: error.response?.data?.message || error.message || 'Failed to connect to Langflow',
      };
    }

    return {
      answer: '',
      error: 'An unexpected error occurred',
    };
  }
}

// Made with Bob
