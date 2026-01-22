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
const LANGFLOW_FLOW_ID = process.env.LANGFLOW_FLOW_ID || '97cc8b65-0fb1-4f87-8d2b-a2359082f322';
const LANGFLOW_API_KEY = process.env.LANGFLOW_API_KEY || '';

/**
 * Parse stock data from Langflow response
 * This function attempts to extract structured stock data from the response
 */
function parseStockData(responseText: string, data?: any): StockDataPoint[] | undefined {
  try {
    // Check if data object contains stock information
    if (data && Array.isArray(data)) {
      return data.map((item: any) => ({
        date: item.date || item.timestamp || '',
        price: parseFloat(item.price || item.close || item.value || 0),
        volume: item.volume ? parseInt(item.volume) : undefined,
      }));
    }

    // Try to parse JSON from response text
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (Array.isArray(parsed)) {
        return parsed.map((item: any) => ({
          date: item.date || item.timestamp || '',
          price: parseFloat(item.price || item.close || item.value || 0),
          volume: item.volume ? parseInt(item.volume) : undefined,
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
 * Query Langflow with a stock-related question
 */
export async function queryLangflow(question: string): Promise<StockQueryResult> {
  try {
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
      `${LANGFLOW_URL}/api/v1/run/${LANGFLOW_FLOW_ID}`,
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
