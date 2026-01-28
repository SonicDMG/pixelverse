'use client';

import { useState, useCallback, useRef } from 'react';
import axios from 'axios';
import { Message, StockQueryResult, ConversationGroup, LoadingStatus } from '@/types';

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
  const [error, setError] = useState<string | null>(null);
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);

  /**
   * Submit a question to the API and update conversation state
   */
  const submitQuestion = useCallback(async (questionText: string): Promise<boolean> => {
    // Clear any existing timeouts
    timeoutsRef.current.forEach(timeout => clearTimeout(timeout));
    timeoutsRef.current = [];

    setLoadingStatus('choosing_agent');
    setError(null);
    let requestSuccessful = false;

    // Create user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: questionText,
      timestamp: new Date(),
    };

    // Progress through loading states with timing
    const timeout1 = setTimeout(() => {
      setLoadingStatus('getting_data');
    }, 5000); // 5s for choosing_agent
    timeoutsRef.current.push(timeout1);

    const timeout2 = setTimeout(() => {
      setLoadingStatus('processing');
    }, 25000); // 5s + 20s for getting_data
    timeoutsRef.current.push(timeout2);

    try {
      console.log('[useConversation] Sending request to:', apiEndpoint);
      console.log('[useConversation] Using session ID:', sessionId);
      const response = await axios.post<StockQueryResult>(apiEndpoint, {
        question: questionText,
        session_id: sessionId,
      });

      const result = response.data;
      console.log('[useConversation] Received API response:', {
        hasAnswer: !!result.answer,
        answerLength: result.answer?.length,
        hasComponents: !!result.components,
        componentCount: result.components?.length,
        componentTypes: result.components?.map(c => c.type),
        hasStockData: !!result.stockData,
        stockDataLength: result.stockData?.length,
        symbol: result.symbol,
      });

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
      };

      setConversationGroups(prev => [...prev, newGroup]);
      requestSuccessful = true;
    } catch (err) {
      const errorMessage = axios.isAxiosError(err)
        ? err.response?.data?.error || err.message
        : 'An unexpected error occurred';
      
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
    } finally {
      // Clear all timeouts
      timeoutsRef.current.forEach(timeout => clearTimeout(timeout));
      timeoutsRef.current = [];
      setLoadingStatus(null);
    }

    return requestSuccessful;
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
    error,
    submitQuestion,
    clearConversation,
  };
}

// Made with Bob