'use client';

import { useState, useCallback, useRef } from 'react';
import axios from 'axios';
import QuestionInput from '@/components/QuestionInput';
import LoadingSpinner from '@/components/LoadingSpinner';
import ConversationGroup from '@/components/ConversationGroup';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Message, StockQueryResult, ConversationGroup as ConversationGroupType, LoadingStatus } from '@/types';
import { useCompletionSound } from '@/hooks/useCompletionSound';
import { useRequestSound } from '@/hooks/useRequestSound';
import { useBackgroundMusic } from '@/hooks/useBackgroundMusic';
import { AUDIO } from '@/constants/theme';

/**
 * API Error response interface
 */
interface ApiErrorResponse {
  error: string;
  details?: string;
}

export default function Home() {
  const [conversationGroups, setConversationGroups] = useState<ConversationGroupType[]>([]);
  const [loadingStatus, setLoadingStatus] = useState<LoadingStatus>(null);
  const [error, setError] = useState<string | null>(null);
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);
  const { playCompletionSound } = useCompletionSound({ volume: AUDIO.soundEffectsVolume, enabled: true });
  const { playRequestSound } = useRequestSound({ volume: AUDIO.soundEffectsVolume, enabled: true });
  const { isPlaying, isMuted, togglePlayback, toggleMute, isReady } = useBackgroundMusic({
    volume: 0.175, // Decreased by 30% from 0.25
    autoPlay: false // Don't auto-play to respect browser policies
  });

  const handleQuestion = useCallback(async (question: string) => {
    // Play request sound immediately when request is initiated
    playRequestSound();

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
      content: question,
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

      const errorGroup: ConversationGroupType = {
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
      
      // Play completion sound only on successful requests
      if (requestSuccessful) {
        playCompletionSound();
      }
    }
  }, [playCompletionSound, playRequestSound]);

  const handleClearConversation = useCallback(() => {
    setConversationGroups([]);
    setError(null);
  }, []);

  return (
    <div className="h-screen flex items-center justify-center p-4">
      <div className="h-full w-full max-w-7xl flex flex-col overflow-hidden">
        {/* Header */}
        <header className="text-center space-y-4 py-8 px-4 border-b-4 border-[#00ff9f]/30 pixel-border flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex-1 flex justify-start gap-2">
              {/* Background Music Controls */}
              <button
                onClick={togglePlayback}
                disabled={!isReady}
                className="px-4 py-2 bg-[#1a1f3a] border-2 border-[#00ff9f] text-[#00ff9f] text-xs font-pixel hover:bg-[#00ff9f] hover:text-[#0a0e27] transition-colors disabled:opacity-50 disabled:cursor-not-allowed pixel-border"
                title={isPlaying ? "Stop background music" : "Play background music"}
              >
                {isPlaying ? '⏸ MUSIC' : '▶ MUSIC'}
              </button>
              {isPlaying && (
                <button
                  onClick={toggleMute}
                  className="px-4 py-2 bg-[#1a1f3a] border-2 border-[#00ff9f] text-[#00ff9f] text-xs font-pixel hover:bg-[#00ff9f] hover:text-[#0a0e27] transition-colors pixel-border"
                  title={isMuted ? "Unmute music" : "Mute music"}
                >
                  {isMuted ? '🔇' : '🔊'}
                </button>
              )}
            </div>
            <div className="flex-1 flex flex-col items-center">
              <h1 className="text-3xl md:text-5xl font-pixel text-[#00ff9f] glow-text">
                PIXELTICKER
              </h1>
              <p className="text-xs md:text-sm text-[#ff00ff] font-pixel mt-2">
                {'>'} RETRO STOCK ANALYSIS POWERED BY LANGFLOW + MCP
              </p>
            </div>
            <div className="flex-1 flex justify-end">
              {conversationGroups.length > 0 && (
                <button
                  onClick={handleClearConversation}
                  disabled={loadingStatus !== null && loadingStatus !== 'done'}
                  className="px-4 py-2 bg-[#1a1f3a] border-2 border-[#ff00ff] text-[#ff00ff] text-xs font-pixel hover:bg-[#ff00ff] hover:text-[#0a0e27] transition-colors disabled:opacity-50 disabled:cursor-not-allowed pixel-border"
                  title="Clear conversation history"
                >
                  CLEAR
                </button>
              )}
            </div>
          </div>
          {/* Loading State in Header */}
          {loadingStatus !== null && loadingStatus !== 'done' && (
            <div className="flex flex-col items-center justify-center py-4">
              <LoadingSpinner status={loadingStatus} />
            </div>
          )}
        </header>

        {/* Main Content - Scrollable */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="w-full pb-8 space-y-8">
            {/* Error Display */}
            {error && (
              <div className="error-message pixel-border mb-6">
                <p>ERROR: {error}</p>
              </div>
            )}

            {/* Conversation Groups - Each group contains user question, assistant response, and visualizations */}
            {conversationGroups.map((group) => (
              <ErrorBoundary key={group.id}>
                <ConversationGroup
                  userMessage={group.userMessage}
                  assistantMessage={group.assistantMessage}
                  components={group.components}
                  stockData={group.stockData}
                  symbol={group.symbol}
                />
              </ErrorBoundary>
            ))}
          </div>
        </main>

        {/* Question Input - Fixed above footer */}
        <div className="flex-shrink-0 bg-[#0a0e27]/95 p-4 mt-4 border-t-4 border-[#00ff9f] pixel-border backdrop-blur-sm">
          <QuestionInput onSubmit={handleQuestion} loadingStatus={loadingStatus} />
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
