/**
 * Conversation Types
 * Types for messages and conversation groups
 */

import type { ComponentSpec } from '../ui';
import type { StockDataPoint } from '../api/stock';

// Message in the chat history
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  stockData?: StockDataPoint[];
}

/**
 * Loading status for async operations in the stock query flow
 * - 'choosing_agent': AI is selecting the appropriate agent
 * - 'getting_data': Fetching stock data from external sources
 * - 'processing': Processing and analyzing the data
 * - 'done': Operation completed successfully
 * - null: No active loading operation
 */
export type LoadingStatus = 'choosing_agent' | 'getting_data' | 'processing' | 'done' | null;

// Conversation group - pairs user question with assistant response and visualizations
export interface ConversationGroup {
  id: string;
  userMessage: Message;
  assistantMessage: Message;
  components?: ComponentSpec[];
  stockData?: StockDataPoint[];
  symbol?: string;
  timestamp: Date;
  durationSeconds?: number;
  streamingChunks?: number; // Number of chunks received during streaming
}

// Made with Bob