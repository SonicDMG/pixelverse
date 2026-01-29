// Stock data point for charts
export interface StockDataPoint {
  date: string;
  price: number;
  volume?: number;
}

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
  components?: import('./ui-spec').ComponentSpec[];
  stockData?: StockDataPoint[];
  symbol?: string;
  timestamp: Date;
  durationSeconds?: number;
}

// Langflow API request
export interface LangflowRequest {
  input_value: string;
  output_type?: string;
  input_type?: string;
  tweaks?: Record<string, any>;
}

// Langflow API response
export interface LangflowResponse {
  outputs: Array<{
    outputs: Array<{
      results: {
        message: {
          text: string;
          data?: any;
        };
      };
    }>;
  }>;
}

// Stock query result
export interface StockQueryResult {
  answer: string;
  stockData?: StockDataPoint[];
  symbol?: string;
  error?: string;
  components?: import('./ui-spec').ComponentSpec[];
}

// Made with Bob
