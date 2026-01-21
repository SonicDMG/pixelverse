'use client';

import { useState } from 'react';
import axios from 'axios';
import StockChart from '@/components/StockChart';
import QuestionInput from '@/components/QuestionInput';
import MessageHistory from '@/components/MessageHistory';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Message, StockQueryResult } from '@/types';

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStockData, setCurrentStockData] = useState<StockQueryResult | null>(null);

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

      // Update current stock data for chart
      if (result.stockData && result.stockData.length > 0) {
        setCurrentStockData(result);
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
    <main className="min-h-screen p-4 md:p-8 relative">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <header className="text-center space-y-4 py-8">
          <h1 className="text-3xl md:text-5xl font-pixel text-[#00ff9f] glow-text">
            PIXELTICKER
          </h1>
          <p className="text-xs md:text-sm text-[#ff00ff] font-pixel">
            {'>'} RETRO STOCK ANALYSIS POWERED BY LANGFLOW + MCP
          </p>
        </header>

        {/* Error Display */}
        {error && (
          <div className="error-message pixel-border">
            <p>ERROR: {error}</p>
          </div>
        )}

        {/* Stock Chart */}
        {currentStockData?.stockData && currentStockData.stockData.length > 0 && (
          <div className="animate-fade-in">
            <StockChart 
              data={currentStockData.stockData} 
              symbol={currentStockData.symbol}
            />
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <LoadingSpinner />
            <p className="text-[#00ff9f] text-xs font-pixel">ANALYZING STOCK DATA...</p>
          </div>
        )}

        {/* Message History */}
        <MessageHistory messages={messages} />

        {/* Question Input */}
        <div className="sticky bottom-4 bg-[#0a0e27]/95 p-4 border-4 border-[#00ff9f] pixel-border backdrop-blur-sm">
          <QuestionInput onSubmit={handleQuestion} isLoading={isLoading} />
        </div>

        {/* Footer */}
        <footer className="text-center py-8">
          <p className="text-xs text-gray-500 font-pixel">
            &copy; 2026 PIXELTICKER | POWERED BY LANGFLOW
          </p>
        </footer>
      </div>
    </main>
  );
}

// Made with Bob
