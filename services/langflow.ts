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
 */
export async function queryLangflow(question: string, theme: LangflowTheme = 'ticker'): Promise<StockQueryResult> {
  try {
    // Get the appropriate flow ID for the theme
    const flowId = getFlowIdForTheme(theme);

    const request: LangflowRequest = {
      input_value: question,
      output_type: 'chat',
      input_type: 'chat',
    };

    // Add session_id for conversation tracking
    const payload = {
      ...request,
      session_id: randomUUID(),
    };

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Add API key if provided
    if (LANGFLOW_API_KEY) {
      headers['x-api-key'] = LANGFLOW_API_KEY;
    }

    const response = await axios.post<LangflowResponse>(
      `${LANGFLOW_URL}/api/v1/run/${flowId}`,
      payload,
      {
        headers,
        timeout: 120000, // 120 second (2 minute) timeout for complex queries
      }
    );

    // Extract the response text
    const outputs = response.data.outputs?.[0]?.outputs?.[0]?.results;
    const messageText = outputs?.message?.text || 'No response received';
    const messageData = outputs?.message?.data;

    // Try to parse as UI specification response
    let uiResponse: any = null;
    try {
      // Check if messageText is JSON with components
      if (messageText.trim().startsWith('{')) {
        uiResponse = JSON.parse(messageText);
      }
    } catch (e) {
      // Not JSON, treat as plain text
    }

    // If we have a UI response with components, use it
    if (uiResponse && uiResponse.components && Array.isArray(uiResponse.components)) {
      return {
        answer: uiResponse.text || messageText,
        components: uiResponse.components,
        symbol: extractSymbol(question),
      };
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
