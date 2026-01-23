'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import axios from 'axios';
import QuestionInput from '@/components/QuestionInput';
import LoadingSpinner from '@/components/LoadingSpinner';
import ConversationGroup from '@/components/ConversationGroup';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import AudioVisualizer from '@/components/AudioVisualizer';
import AppSwitcher from '@/components/AppSwitcher';
import { MusicModeSelector, useMusicMode } from '@/components/MusicModeSelector';
import { useTheme } from '@/contexts/ThemeContext';
import { Message, StockQueryResult, ConversationGroup as ConversationGroupType, LoadingStatus } from '@/types';
import { useBackgroundMusic } from '@/hooks/useBackgroundMusic';
import { useProceduralMusic } from '@/hooks/useProceduralMusic';
import { useCyberpunkVoice } from '@/hooks/useCyberpunkVoice';

/**
 * API Error response interface
 */
interface ApiErrorResponse {
  error: string;
  details?: string;
}

export default function Home() {
  const { appMode, theme } = useTheme();
  const musicMode = useMusicMode();
  const [conversationGroups, setConversationGroups] = useState<ConversationGroupType[]>([]);
  const [loadingStatus, setLoadingStatus] = useState<LoadingStatus>(null);
  const [error, setError] = useState<string | null>(null);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);
  
  // Use the appropriate music hook based on user preference
  // Only initialize the hook that matches the current mode to prevent both from running
  const mp3Music = useBackgroundMusic(appMode, {
    volume: 0.175,
    autoPlay: false
  });
  
  const proceduralMusic = useProceduralMusic(appMode, {
    volume: 0.175,
    autoPlay: false
  });
  
  // Select the active music system based on mode
  const activeMusic = musicMode === 'generated' ? proceduralMusic : mp3Music;
  const { isPlaying, isMuted, togglePlayback, toggleMute, isReady, analyserNode, volume: musicVolume, setVolume: setMusicVolume } = activeMusic;
  
  // Stop the inactive music system when switching modes
  useEffect(() => {
    console.log(`[Music Mode] Switched to: ${musicMode}`);
    
    // Always stop MP3 music when switching to generated mode
    if (musicMode === 'generated') {
      console.log('[Music Mode] Stopping MP3 music');
      mp3Music.stop();
    }
    
    // Always stop procedural music when switching to MP3 mode
    if (musicMode === 'mp3') {
      console.log('[Music Mode] Stopping procedural music');
      proceduralMusic.stop();
    }
  }, [musicMode, mp3Music, proceduralMusic]);
  
  const { announce, isSupported: isVoiceSupported, isEnabled: isVoiceEnabled, toggleEnabled: toggleVoice, volume: voiceVolume, setVolume: setVoiceVolume } = useCyberpunkVoice({ audioContext });

  // Initialize shared AudioContext for voice synthesis
  useEffect(() => {
    setIsMounted(true);
    
    if (typeof window !== 'undefined' && !audioContext) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        const ctx = new AudioContextClass();
        setAudioContext(ctx);
      }
    }

    return () => {
      if (audioContext) {
        audioContext.close().catch(err => console.error('Error closing audio context:', err));
      }
    };
  }, []);

  const handleQuestion = useCallback(async (question: string) => {
    // Announce request submission with voice
    if (isVoiceSupported) {
      announce('Processing your request', 'info').catch(err =>
        console.error('Voice announcement failed:', err)
      );
    }

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
      const response = await axios.post<StockQueryResult>(theme.apiEndpoint, {
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

      // Announce completion
      if (isVoiceSupported) {
        announce('Request complete', 'info').catch(err =>
          console.error('Voice announcement failed:', err)
        );
      }

      // Announce key information from the response
      if (isVoiceSupported && result.stockData && result.stockData.length > 0) {
        // Get the most recent price (last item in the array)
        const latestData = result.stockData[result.stockData.length - 1];
        const priceAnnouncement = `${result.symbol || 'Stock'} price: ${latestData.price} dollars`;
        announce(priceAnnouncement, 'price').catch(err =>
          console.error('Voice announcement failed:', err)
        );
      }
    } catch (err) {
      const errorMessage = axios.isAxiosError(err)
        ? err.response?.data?.error || err.message
        : 'An unexpected error occurred';
      
      setError(errorMessage);

      // Announce error with voice
      if (isVoiceSupported) {
        announce('Request failed. Error occurred.', 'alert').catch(err =>
          console.error('Voice announcement failed:', err)
        );
      }
      
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
    }
  }, [announce, isVoiceSupported]);

  const handleClearConversation = useCallback(() => {
    setConversationGroups([]);
    setError(null);
  }, []);

  return (
    <div className="h-screen flex items-center justify-center p-4">
      <div className="h-full w-full max-w-7xl flex flex-col overflow-hidden">
        {/* Header */}
        <header className="text-center space-y-4 py-8 px-4 border-b-4 pixel-border flex-shrink-0" style={{ borderColor: `${theme.colors.primary}30` }}>
          <div className="relative grid grid-cols-[1fr_auto_1fr] items-center gap-4">
            {/* Left section: Music & Voice Controls with Visualizer below */}
            <div className="flex flex-col gap-2 justify-start">
              {/* Controls Row */}
              <div className="flex gap-4 items-start">
                {/* Music Control with Volume */}
                <div className="flex flex-col gap-1">
                  <button
                    onClick={togglePlayback}
                    disabled={!isReady}
                    className={`px-4 py-2 border-2 text-xs font-pixel transition-colors pixel-border ${
                      isPlaying
                        ? `bg-[#1a1f3a] text-[#0a0e27]`
                        : 'bg-[#0a0e27] border-gray-600 text-gray-500'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                    title={isPlaying ? "Stop background music" : "Play background music"}
                  >
                    🎵 MUSIC
                  </button>
                  {/* Music Volume Slider */}
                  <div className="flex items-center gap-1 px-1">
                    <span className="text-[10px] font-pixel opacity-60" style={{ color: theme.colors.primary }}>VOL</span>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={Math.round(musicVolume * 100)}
                      onChange={(e) => setMusicVolume(parseInt(e.target.value) / 100)}
                      disabled={!isReady}
                      className="w-20 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed
                        [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2 [&::-webkit-slider-thumb]:h-2
                        [&::-webkit-slider-thumb]:rounded-full
                        [&::-moz-range-thumb]:w-2 [&::-moz-range-thumb]:h-2 [&::-moz-range-thumb]:rounded-full
                        [&::-moz-range-thumb]:border-0"
                      style={{
                        ['--thumb-color' as any]: theme.colors.primary,
                      }}
                      title={`Music volume: ${Math.round(musicVolume * 100)}%`}
                    />
                    <span className="text-[10px] font-pixel opacity-60 w-6 text-right" style={{ color: theme.colors.primary }}>
                      {Math.round(musicVolume * 100)}
                    </span>
                  </div>
                  {/* Music Mode Selector */}
                  <MusicModeSelector className="px-1" />
                </div>
                
                {/* Voice Control with Volume */}
                {isMounted && (
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={toggleVoice}
                      disabled={!isVoiceSupported}
                      className={`px-4 py-2 border-2 text-xs font-pixel transition-colors pixel-border ${
                        isVoiceEnabled
                          ? `bg-[#1a1f3a] text-[#0a0e27]`
                          : 'bg-[#0a0e27] border-gray-600 text-gray-500'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                      title={isVoiceEnabled ? "Disable voice announcements" : "Enable voice announcements"}
                    >
                      🗣️ VOICE
                    </button>
                    {/* Voice Volume Slider */}
                    <div className="flex items-center gap-1 px-1">
                      <span className="text-[10px] font-pixel opacity-60" style={{ color: theme.colors.neonMagenta }}>VOL</span>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={Math.round(voiceVolume * 100)}
                        onChange={(e) => setVoiceVolume(parseInt(e.target.value) / 100)}
                        disabled={!isVoiceSupported}
                        className="w-20 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed
                          [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2 [&::-webkit-slider-thumb]:h-2
                          [&::-webkit-slider-thumb]:rounded-full
                          [&::-moz-range-thumb]:w-2 [&::-moz-range-thumb]:h-2 [&::-moz-range-thumb]:rounded-full
                          [&::-moz-range-thumb]:border-0"
                        title={`Voice volume: ${Math.round(voiceVolume * 100)}%`}
                      />
                      <span className="text-[10px] font-pixel opacity-60 w-6 text-right" style={{ color: theme.colors.neonMagenta }}>
                        {Math.round(voiceVolume * 100)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Audio Visualizer - Below controls, matching full width */}
              <AudioVisualizer
                analyserNode={analyserNode}
                isPlaying={isPlaying}
                height={40}
              />
            </div>
            
            {/* Center section: Title (absolutely centered) */}
            <div className="flex flex-col items-center justify-self-center self-start">
              <h1 className="text-3xl md:text-5xl font-pixel glow-text whitespace-nowrap" style={{ color: theme.colors.primary }}>
                {theme.name.toUpperCase()}
              </h1>
              <p className="text-xs md:text-sm font-pixel mt-2 whitespace-nowrap" style={{ color: theme.colors.accent }}>
                {'>'} {theme.tagline}
              </p>
            </div>
            
            {/* Right section: App Switcher and Clear Button */}
            <div className="flex flex-col gap-2 justify-end self-start items-end">
              <AppSwitcher />
              {conversationGroups.length > 0 && (
                <button
                  onClick={handleClearConversation}
                  disabled={loadingStatus !== null && loadingStatus !== 'done'}
                  className="px-4 py-2 bg-[#1a1f3a] border-2 text-xs font-pixel hover:text-[#0a0e27] transition-colors disabled:opacity-50 disabled:cursor-not-allowed pixel-border"
                  style={{
                    borderColor: theme.colors.accent,
                    color: theme.colors.accent,
                  }}
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
        <div className="flex-shrink-0 bg-[#0a0e27]/95 p-4 mt-4 border-t-4 pixel-border backdrop-blur-sm" style={{ borderColor: theme.colors.primary }}>
          <QuestionInput onSubmit={handleQuestion} loadingStatus={loadingStatus} />
        </div>

        {/* Footer */}
        <footer className="text-center py-4 px-4 border-t-4 pixel-border flex-shrink-0" style={{ borderColor: `${theme.colors.primary}30` }}>
          <p className="text-xs text-gray-500 font-pixel">
            2026 {theme.name.toUpperCase()} | POWERED BY LANGFLOW
          </p>
        </footer>
      </div>
    </div>
  );
}

// Made with Bob
