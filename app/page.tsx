'use client';

import { useState } from 'react';
import axios from 'axios';
import QuestionInput from '@/components/QuestionInput';
import LoadingSpinner from '@/components/LoadingSpinner';
import ConversationGroup from '@/components/ConversationGroup';
import { Message, StockQueryResult, ConversationGroup as ConversationGroupType } from '@/types';

export default function Home() {
  const [conversationGroups, setConversationGroups] = useState<ConversationGroupType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleQuestion = async (question: string) => {
    setIsLoading(true);
    setError(null);

    // Create user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: question,
      timestamp: new Date(),
    };

    try {
      const response = await axios.post<StockQueryResult>('/api/ask-stock', {
        question,
      });

      const result = response.data;

      // Create assistant message
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: result.answer,
        timestamp: new Date(),
        stockData: result.stockData,
      };

      // Create conversation group with user question, assistant response, and any visualizations
      const newGroup: ConversationGroupType = {
        id: Date.now().toString(),
        userMessage,
        assistantMessage,
        components: result.components,
        stockData: result.stockData,
        symbol: result.symbol,
        timestamp: new Date(),
      };

      setConversationGroups(prev => [...prev, newGroup]);
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

      const errorGroup: ConversationGroupType = {
        id: Date.now().toString(),
        userMessage,
        assistantMessage,
        timestamp: new Date(),
      };

      setConversationGroups(prev => [...prev, errorGroup]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center p-4">
      <div className="h-full w-full max-w-7xl flex flex-col overflow-hidden">
        {/* Header */}
        <header className="text-center space-y-4 py-8 px-4 border-b-4 border-[#00ff9f]/30 pixel-border flex-shrink-0">
          <h1 className="text-3xl md:text-5xl font-pixel text-[#00ff9f] glow-text">
            PIXELTICKER
          </h1>
          <p className="text-xs md:text-sm text-[#ff00ff] font-pixel">
            {'>'} RETRO STOCK ANALYSIS POWERED BY LANGFLOW + MCP
          </p>
          {/* Loading State in Header */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-4">
              <LoadingSpinner />
            </div>
          )}
        </header>

        {/* Main Content - Scrollable */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="w-full pb-4 space-y-8">
            {/* Error Display */}
            {error && (
              <div className="error-message pixel-border mb-6">
                <p>ERROR: {error}</p>
              </div>
            )}

            {/* Conversation Groups - Each group contains user question, assistant response, and visualizations */}
            {conversationGroups.map((group) => (
              <ConversationGroup
                key={group.id}
                userMessage={group.userMessage}
                assistantMessage={group.assistantMessage}
                components={group.components}
                stockData={group.stockData}
                symbol={group.symbol}
              />
            ))}
          </div>
        </main>

        {/* Question Input - Fixed above footer */}
        <div className="flex-shrink-0 bg-[#0a0e27]/95 p-4 border-t-4 border-[#00ff9f] pixel-border backdrop-blur-sm">
          <QuestionInput onSubmit={handleQuestion} isLoading={isLoading} />
        </div>

        {/* Footer */}
        <footer className="text-center py-4 px-4 border-t-4 border-[#00ff9f]/30 pixel-border flex-shrink-0">
          <p className="text-xs text-gray-500 font-pixel">
            2026 PIXELTICKER | POWERED BY LANGFLOW
          </p>
        </footer>
      </div>
    </div>
  );
}

// Made with Bob
