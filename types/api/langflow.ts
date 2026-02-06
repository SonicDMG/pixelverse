/**
 * Langflow API Types
 * Types for Langflow API requests and responses
 */

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

// Made with Bob