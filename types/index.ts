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
}

// Made with Bob
