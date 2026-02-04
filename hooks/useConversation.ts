'use client';

import { useState, useCallback, useRef } from 'react';
import axios from 'axios';
import { Message, StockQueryResult, ConversationGroup, LoadingStatus } from '@/types';

/**
 * Streaming state for tracking real-time data chunks
 */
interface StreamingState {
  chunksReceived: number;
  isStreaming: boolean;
}

/**
 * Conversation Management Hook
 * 
 * Manages conversation state, API calls, and loading states for the chat interface.
 * Handles question submission, error management, and conversation history.
 * 
 * @param sessionId - Current session UUID for conversation tracking
 * @param apiEndpoint - API endpoint URL for the current theme
 * @returns Conversation management interface
 * 
 * @example
 * ```tsx
 * const conversation = useConversation(sessionId, '/api/ask-stock');
 * 
 * // Submit a question
 * await conversation.submitQuestion('What is AAPL?');
 * 
 * // Clear conversation history
 * conversation.clearConversation();
 * ```
 */
export function useConversation(sessionId: string, apiEndpoint: string) {
  const [conversationGroups, setConversationGroups] = useState<ConversationGroup[]>([]);
  const [loadingStatus, setLoadingStatus] = useState<LoadingStatus>(null);
  const [streamingState, setStreamingState] = useState<StreamingState>({ chunksReceived: 0, isStreaming: false });
  const [error, setError] = useState<string | null>(null);
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);

  /**
   * Submit a question with OpenAI-compatible streaming support
   */
  const submitQuestion = useCallback(async (questionText: string): Promise<ConversationGroup | null> => {
    // Clear any existing timeouts
    timeoutsRef.current.forEach(timeout => clearTimeout(timeout));
    timeoutsRef.current = [];

    setLoadingStatus('choosing_agent');
    setStreamingState({ chunksReceived: 0, isStreaming: false });
    setError(null);
    let createdGroup: ConversationGroup | null = null;

    // Create user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: questionText,
      timestamp: new Date(),
    };

    // Start with choosing agent state
    const timeout1 = setTimeout(() => {
      setLoadingStatus('getting_data');
      setStreamingState({ chunksReceived: 0, isStreaming: true });
    }, 1000); // 1s for choosing_agent
    timeoutsRef.current.push(timeout1);

    try {
      // Use streaming endpoint
      const streamEndpoint = apiEndpoint.replace('/api/ask-', '/api/stream-');
      
      const streamResponse = await fetch(streamEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: questionText,
          session_id: sessionId,
          stream: true,
        }),
      });

      if (!streamResponse.ok) {
        throw new Error(`HTTP error! status: ${streamResponse.status}`);
      }

      if (!streamResponse.body) {
        throw new Error('Response body is null');
      }

      const reader = streamResponse.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let chunkIndex = 0;
      let accumulatedText = '';
      let finalResult: any = null;

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          // Skip empty lines
          if (!line.trim()) continue;
          
          try {
            // Langflow sends raw JSON objects, not SSE format
            const parsed = JSON.parse(line);
            
            // Handle different Langflow event types
            if (parsed.event === 'token') {
              // Token streaming event
              chunkIndex++;
              setStreamingState(prev => ({
                ...prev,
                chunksReceived: chunkIndex,
                isStreaming: true
              }));
              
              const chunkText = parsed.data?.chunk || '';
              if (chunkText) {
                accumulatedText += chunkText;
              }
            } else if (parsed.event === 'end') {
              // Final result event
              finalResult = parsed.data?.result;
            } else if (parsed.event === 'add_message') {
              // Message event (might contain final text)
              if (!finalResult) {
                finalResult = { outputs: [{ outputs: [{ results: { message: parsed.data } }] }] };
              }
            }
          } catch (e) {
            console.error('[useConversation] Failed to parse streaming data:', e);
          }
        }
      }

      // Process final result
      setLoadingStatus('processing');
      setStreamingState({ chunksReceived: chunkIndex, isStreaming: false });
      
      // Parse the final result from the stream
      let result: StockQueryResult;
      
      // Helper function to extract symbol from question
      const extractSymbol = (q: string): string | undefined => {
        const symbolMatch = q.match(/\b([A-Z]{1,5})\b/);
        return symbolMatch ? symbolMatch[1] : undefined;
      };
      
      if (finalResult) {
        // Try to extract from Langflow's standard response format
        const outputs = finalResult.outputs?.[0]?.outputs?.[0]?.results;
        const messageText = outputs?.message?.text || accumulatedText || 'No response received';
        
        // Try to parse as UI specification response
        let uiResponse: any = null;
        try {
          if (messageText.trim().startsWith('{')) {
            uiResponse = JSON.parse(messageText);
          }
        } catch (e) {
          // Not JSON, use as plain text
        }
        
        // Build result
        if (uiResponse && uiResponse.components && Array.isArray(uiResponse.components)) {
          result = {
            answer: uiResponse.answer || uiResponse.text || messageText,
            components: uiResponse.components,
            symbol: extractSymbol(questionText),
          };
        } else {
          result = {
            answer: messageText,
            symbol: extractSymbol(questionText),
          };
        }
      } else {
        // Fallback: use accumulated text
        result = {
          answer: accumulatedText || 'No response received',
        };
      }

      // Create assistant message
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: result.answer,
        timestamp: new Date(),
        stockData: result.stockData,
      };

      // Create conversation group with user question, assistant response, and any visualizations
      const newGroup: ConversationGroup = {
        id: Date.now().toString(),
        userMessage,
        assistantMessage,
        components: result.components,
        stockData: result.stockData,
        symbol: result.symbol,
        timestamp: new Date(),
        streamingChunks: chunkIndex, // Store the number of chunks received
      };

      setConversationGroups(prev => [...prev, newGroup]);
      createdGroup = newGroup;
    } catch (err) {
      const errorMessage = axios.isAxiosError(err)
        ? err.response?.data?.error || err.message
        : err instanceof Error ? err.message : 'An unexpected error occurred';
      
      console.error('[useConversation] Error:', errorMessage);
      setError(errorMessage);
      
      // Create error conversation group
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Error: ${errorMessage}`,
        timestamp: new Date(),
      };

      const errorGroup: ConversationGroup = {
        id: Date.now().toString(),
        userMessage,
        assistantMessage,
        timestamp: new Date(),
      };

      setConversationGroups(prev => [...prev, errorGroup]);
      createdGroup = errorGroup;
    } finally {
      // Clear all timeouts
      timeoutsRef.current.forEach(timeout => clearTimeout(timeout));
      timeoutsRef.current = [];
      setLoadingStatus(null);
    }

    return createdGroup;
  }, [sessionId, apiEndpoint]);

  /**
   * Clear all conversation history and errors
   */
  const clearConversation = useCallback(() => {
    setConversationGroups([]);
    setError(null);
  }, []);

  return {
    conversationGroups,
    loadingStatus,
    streamingState,
    error,
    submitQuestion,
    clearConversation,
  };
}

// Made with Bob