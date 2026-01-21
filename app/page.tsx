'use client';

import { useState } from 'react';
import axios from 'axios';
import StockChart from '@/components/StockChart';
import QuestionInput from '@/components/QuestionInput';
import MessageHistory from '@/components/MessageHistory';
import LoadingSpinner from '@/components/LoadingSpinner';
import DynamicUIRenderer from '@/components/DynamicUIRenderer';
import { Message, StockQueryResult } from '@/types';
import { ComponentSpec } from '@/types/ui-spec';

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stockDataHistory, setStockDataHistory] = useState<StockQueryResult[]>([]);

  const handleQuestion = async (question: string) => {
    setIsLoading(true);
    setError(null);

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: question,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);

    try {
      const response = await axios.post<StockQueryResult>('/api/ask-stock', {
        question,
      });

      const result = response.data;

      // Add assistant message
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: result.answer,
        timestamp: new Date(),
        stockData: result.stockData,
      };
      setMessages(prev => [...prev, assistantMessage]);

      // Add to stock data history for chart or components
      if (result.components && result.components.length > 0) {
        // Agent returned UI components
        setStockDataHistory(prev => [...prev, result]);
      } else if (result.stockData && result.stockData.length > 0) {
        // Legacy: Agent returned raw stock data
        setStockDataHistory(prev => [...prev, result]);
      }
    } catch (err) {
      const errorMessage = axios.isAxiosError(err)
        ? err.response?.data?.error || err.message
        : 'An unexpected error occurred';
      
      setError(errorMessage);
      
      // Add error message
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Error: ${errorMessage}`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMsg]);
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
          <div className="space-y-8 w-full pb-4">
            {/* Error Display */}
            {error && (
              <div className="error-message pixel-border">
                <p>ERROR: {error}</p>
              </div>
            )}

            {/* Stock Data History - All charts/components */}
            {stockDataHistory.map((stockData, index) => (
              <div key={index}>
                {stockData.components && stockData.components.length > 0 ? (
                  <div className="animate-fade-in mb-12 pb-12 border-b-4 border-[#00ff9f]/30 pixel-border">
                    <DynamicUIRenderer components={stockData.components} />
                  </div>
                ) : stockData.stockData && stockData.stockData.length > 0 ? (
                  <div className="animate-fade-in mb-12 pb-12 border-b-4 border-[#00ff9f]/30 pixel-border">
                    <StockChart
                      data={stockData.stockData}
                      symbol={stockData.symbol}
                    />
                  </div>
                ) : null}
              </div>
            ))}

            {/* Message History */}
            <MessageHistory messages={messages} />
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
