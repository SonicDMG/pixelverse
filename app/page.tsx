'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import axios from 'axios';
import QuestionInput from '@/components/QuestionInput';
import LoadingSpinner from '@/components/LoadingSpinner';
import ConversationGroup from '@/components/ConversationGroup';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import AudioVisualizer from '@/components/AudioVisualizer';
import AppSwitcher from '@/components/AppSwitcher';
import { SongSelector } from '@/components/SongSelector';
import { MusicAttribution } from '@/components/MusicAttribution';
import { useTheme } from '@/contexts/ThemeContext';
import { Message, StockQueryResult, ConversationGroup as ConversationGroupType, LoadingStatus } from '@/types';
import { useBackgroundMusic } from '@/hooks/useBackgroundMusic';
import { useCyberpunkVoice } from '@/hooks/useCyberpunkVoice';
import { useSession } from '@/hooks/useSession';

/**
 * API Error response interface
 */
interface ApiErrorResponse {
  error: string;
  details?: string;
}

export default function Home() {
  const { appMode, theme } = useTheme();
  const [conversationGroups, setConversationGroups] = useState<ConversationGroupType[]>([]);
  const [loadingStatus, setLoadingStatus] = useState<LoadingStatus>(null);
  const [error, setError] = useState<string | null>(null);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [question, setQuestion] = useState('');
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);
  
  // Session management for conversation tracking
  const { sessionId, resetSession } = useSession();
  
  // Use MP3 background music
  const {
    isPlaying,
    isMuted,
    togglePlayback,
    toggleMute,
    isReady,
    analyserNode,
    volume: musicVolume,
    setVolume: setMusicVolume,
    currentSong,
    availableSongs,
    isAutoCycling,
    setSong,
    start: startMusic,
    stop: stopMusic,
  } = useBackgroundMusic(appMode, {
    volume: 0.175,
    autoPlay: false // Can't autoplay due to browser policy - user must click
  });
  
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

  // Clear conversation when switching modes
  // Music will automatically reload with new theme's tracks
  useEffect(() => {
    // Clear conversation history
    setConversationGroups([]);
    setError(null);
  }, [appMode]);

  const handleQuestion = useCallback(async (questionText: string) => {
    // Announce request submission with voice
    if (isVoiceSupported) {
      announce(`Processing your request: ${questionText}`, 'info').catch(err =>
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
      const apiEndpoint = theme.apiEndpoint;
      console.log('[Home] Sending request to:', apiEndpoint);
      console.log('[Home] Using session ID:', sessionId);
      const response = await axios.post<StockQueryResult>(apiEndpoint, {
        question: questionText,
        session_id: sessionId,
      });

      const result = response.data;
      console.log('[Home] Received API response:', {
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
      setQuestion(''); // Clear the question input after successful submission
      requestSuccessful = true;

      // Announce completion
      if (isVoiceSupported) {
        announce('Request complete', 'info').catch(err =>
          console.error('Voice announcement failed:', err)
        );
      }

      // Read the answer text with voice
      if (isVoiceSupported && result.answer) {
        // Use a slight delay to let the "Request complete" announcement finish
        setTimeout(() => {
          announce(result.answer, 'info').catch(err =>
            console.error('Voice announcement failed:', err)
          );
        }, 1000);
      }

      // Announce key information from the response (for stock data)
      if (isVoiceSupported && result.stockData && result.stockData.length > 0) {
        // Get the most recent price (last item in the array)
        const latestData = result.stockData[result.stockData.length - 1];
        const priceAnnouncement = `${result.symbol || 'Stock'} price: ${latestData.price} dollars`;
        // Delay this announcement to let the answer finish
        setTimeout(() => {
          announce(priceAnnouncement, 'price').catch(err =>
            console.error('Voice announcement failed:', err)
          );
        }, 2000);
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
  }, [announce, isVoiceSupported, sessionId, theme.apiEndpoint]);

  const handleClearConversation = useCallback(() => {
    setConversationGroups([]);
    setError(null);
    // Reset session when clearing conversation to start fresh
    resetSession();
  }, [resetSession]);

  return (
    <div className="h-screen flex items-center justify-center p-4">
      <div className="h-full w-full max-w-7xl flex flex-col overflow-hidden">
        {/* Header */}
        <header className="py-4 md:py-6 px-2 md:px-4 border-b-4 pixel-border flex-shrink-0" style={{ borderColor: `${theme.colors.primary}30` }}>
          <div className="max-w-7xl mx-auto">
            {/* Mobile Layout: Stacked vertically (below lg breakpoint) */}
            <div className="flex flex-col gap-4 lg:hidden">
              {/* 1. App Switcher Buttons - Full width row */}
              <div className="flex items-center justify-center gap-2 px-2">
                {/* TICKER button */}
                <button
                  onClick={() => window.location.href = '?app=ticker'}
                  className={`flex-shrink-0 px-3 py-2 border-2 text-xs font-pixel transition-all pixel-border ${
                    appMode === 'ticker'
                      ? 'text-[#0a0e27]'
                      : 'bg-[#0a0e27] border-gray-600 text-gray-500 hover:border-gray-500'
                  }`}
                  style={appMode === 'ticker' ? {
                    backgroundColor: '#00ff41',
                    borderColor: '#00ff41',
                    boxShadow: '0 0 10px #00ff41',
                  } : {
                    backgroundColor: '#0a0e27',
                    borderColor: '#4a5568',
                  }}
                  title="Switch to TICKER"
                >
                  📈 TICKER
                </button>
                
                {/* SPACE button */}
                <button
                  onClick={() => window.location.href = '?app=space'}
                  className={`flex-shrink-0 px-3 py-2 border-2 text-xs font-pixel transition-all pixel-border ${
                    appMode === 'space'
                      ? 'text-[#0a0e27]'
                      : 'bg-[#0a0e27] border-gray-600 text-gray-500 hover:border-gray-500'
                  }`}
                  style={appMode === 'space' ? {
                    backgroundColor: '#00d4ff',
                    borderColor: '#00d4ff',
                    boxShadow: '0 0 10px #00d4ff',
                  } : {
                    backgroundColor: '#0a0e27',
                    borderColor: '#4a5568',
                  }}
                  title="Switch to SPACE"
                >
                  🚀 SPACE
                </button>
              </div>

              {/* 2. Title and Tagline - Full width, no constraints */}
              <div className="flex flex-col items-center text-center w-full px-2">
                <h1 className="text-xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-pixel glow-text leading-tight whitespace-nowrap" style={{ color: theme.colors.primary }}>
                  {theme.name.toUpperCase()}
                </h1>
                {/* Tagline - can wrap to multiple lines */}
                <p className="text-xs md:text-sm font-pixel mt-1 break-words w-full" style={{ color: theme.colors.accent }}>
                  {'>'} {theme.tagline}
                </p>
              </div>

              {/* 3. Music and Voice Buttons - Side by Side */}
              <div className="flex gap-2 px-4">
                {/* Music Button */}
                <button
                  onClick={togglePlayback}
                  disabled={!isReady}
                  className={`flex-1 px-4 py-2 border-2 text-xs font-pixel transition-colors pixel-border ${
                    isPlaying
                      ? 'bg-[#0a0e27] border-[#00ff41] text-[#00ff41]'
                      : 'bg-[#0a0e27] border-gray-600 text-gray-500'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                  title={isPlaying ? "Stop background music" : "Play background music"}
                >
                  🎵 MUSIC
                </button>

                {/* Voice Button */}
                {isMounted && (
                  <button
                    onClick={toggleVoice}
                    disabled={!isVoiceSupported}
                    className={`flex-1 px-4 py-2 border-2 text-xs font-pixel transition-colors pixel-border ${
                      isVoiceEnabled
                        ? 'bg-[#0a0e27] border-[#00ff41] text-[#00ff41]'
                        : 'bg-[#0a0e27] border-gray-600 text-gray-500'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                    title={isVoiceEnabled ? "Disable voice announcements" : "Enable voice announcements"}
                  >
                    🗣️ VOICE
                  </button>
                )}
              </div>

              {/* 4. Volume Controls - Side by Side under respective buttons */}
              <div className="flex gap-2 px-4">
                {/* Music Volume Control */}
                <div className="flex-1 flex items-center gap-2">
                  <span className="text-[10px] font-pixel flex-shrink-0" style={{ color: theme.colors.primary }}>VOL</span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={Math.round(musicVolume * 100)}
                    onChange={(e) => setMusicVolume(parseInt(e.target.value) / 100)}
                    disabled={!isReady}
                    className="flex-1 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed
                      [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2 [&::-webkit-slider-thumb]:h-2
                      [&::-webkit-slider-thumb]:rounded-full
                      [&::-moz-range-thumb]:w-2 [&::-moz-range-thumb]:h-2 [&::-moz-range-thumb]:rounded-full
                      [&::-moz-range-thumb]:border-0"
                    style={{
                      ['--thumb-color' as any]: theme.colors.primary,
                    }}
                    title={`Music volume: ${Math.round(musicVolume * 100)}%`}
                  />
                  <span className="text-[10px] font-pixel w-6 text-right flex-shrink-0" style={{ color: theme.colors.primary }}>
                    {Math.round(musicVolume * 100)}
                  </span>
                </div>

                {/* Voice Volume Control */}
                {isMounted && (
                  <div className="flex-1 flex items-center gap-2">
                    <span className="text-[10px] font-pixel flex-shrink-0" style={{ color: theme.colors.neonMagenta }}>VOL</span>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={Math.round(voiceVolume * 100)}
                      onChange={(e) => setVoiceVolume(parseInt(e.target.value) / 100)}
                      disabled={!isVoiceSupported}
                      className="flex-1 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed
                        [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2 [&::-webkit-slider-thumb]:h-2
                        [&::-webkit-slider-thumb]:rounded-full
                        [&::-moz-range-thumb]:w-2 [&::-moz-range-thumb]:h-2 [&::-moz-range-thumb]:rounded-full
                        [&::-moz-range-thumb]:border-0"
                      title={`Voice volume: ${Math.round(voiceVolume * 100)}%`}
                    />
                    <span className="text-[10px] font-pixel w-6 text-right flex-shrink-0" style={{ color: theme.colors.neonMagenta }}>
                      {Math.round(voiceVolume * 100)}
                    </span>
                  </div>
                )}
              </div>

              {/* 5. Song Selector - Full Width */}
              {availableSongs.length > 0 && (
                <div className="w-full">
                  <SongSelector
                    currentSong={currentSong}
                    availableSongs={availableSongs}
                    isAutoCycling={isAutoCycling}
                    onSongChange={setSong}
                    className="w-full"
                  />
                </div>
              )}

              {/* 6. Audio Visualizer - Full Width */}
              <div className="w-full px-4">
                <AudioVisualizer
                  analyserNode={analyserNode}
                  isPlaying={isPlaying}
                  height={40}
                />
              </div>

              {/* Clear Button */}
              {conversationGroups.length > 0 && (
                <div className="flex justify-center mb-8">
                  <button
                    onClick={handleClearConversation}
                    disabled={loadingStatus !== null && loadingStatus !== 'done'}
                    className="px-4 py-2 bg-[#1a1f3a] border-2 text-xs font-pixel hover:text-[#0a0e27] transition-colors disabled:opacity-50 disabled:cursor-not-allowed pixel-border whitespace-nowrap"
                    style={{
                      borderColor: theme.colors.accent,
                      color: theme.colors.accent,
                    }}
                    title="Clear conversation history"
                  >
                    CLEAR
                  </button>
                </div>
              )}
            </div>

            {/* Desktop Layout: Three-column grid (lg breakpoint and above) */}
            <div className="hidden lg:grid lg:grid-cols-[1fr_2fr_1fr] lg:gap-8 lg:items-start">
              {/* Left Column: Audio Controls + Visualizer */}
              <div className="flex flex-col gap-4 max-w-[240px]">
                {/* Audio Buttons - Side by Side */}
                <div className="flex gap-2">
                  {/* Music Button with Volume */}
                  <div className="flex flex-col gap-1 flex-1 min-w-0">
                    <button
                      onClick={togglePlayback}
                      disabled={!isReady}
                      className={`w-full px-4 py-2 border-2 text-xs font-pixel transition-colors pixel-border ${
                        isPlaying
                          ? 'bg-[#0a0e27] border-[#00ff41] text-[#00ff41]'
                          : 'bg-[#0a0e27] border-gray-600 text-gray-500'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                      title={isPlaying ? "Stop background music" : "Play background music"}
                    >
                      🎵 MUSIC
                    </button>
                    {/* Music Volume directly under button */}
                    <div className="flex items-center gap-1 w-full">
                      <span className="text-[10px] font-pixel opacity-60 flex-shrink-0" style={{ color: theme.colors.primary }}>VOL</span>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={Math.round(musicVolume * 100)}
                        onChange={(e) => setMusicVolume(parseInt(e.target.value) / 100)}
                        disabled={!isReady}
                        className="flex-1 min-w-0 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed
                          [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2 [&::-webkit-slider-thumb]:h-2
                          [&::-webkit-slider-thumb]:rounded-full
                          [&::-moz-range-thumb]:w-2 [&::-moz-range-thumb]:h-2 [&::-moz-range-thumb]:rounded-full
                          [&::-moz-range-thumb]:border-0"
                        style={{
                          ['--thumb-color' as any]: theme.colors.primary,
                        }}
                        title={`Music volume: ${Math.round(musicVolume * 100)}%`}
                      />
                      <span className="text-[10px] font-pixel opacity-60 w-6 text-right flex-shrink-0" style={{ color: theme.colors.primary }}>
                        {Math.round(musicVolume * 100)}
                      </span>
                    </div>
                  </div>

                  {/* Voice Button with Volume */}
                  {isMounted && (
                    <div className="flex flex-col gap-1 flex-1 min-w-0">
                      <button
                        onClick={toggleVoice}
                        disabled={!isVoiceSupported}
                        className={`w-full px-4 py-2 border-2 text-xs font-pixel transition-colors pixel-border ${
                          isVoiceEnabled
                            ? 'bg-[#0a0e27] border-[#00ff41] text-[#00ff41]'
                            : 'bg-[#0a0e27] border-gray-600 text-gray-500'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                        title={isVoiceEnabled ? "Disable voice announcements" : "Enable voice announcements"}
                      >
                        🗣️ VOICE
                      </button>
                      {/* Voice Volume directly under button */}
                      <div className="flex items-center gap-1 w-full">
                        <span className="text-[10px] font-pixel opacity-60 flex-shrink-0" style={{ color: theme.colors.neonMagenta }}>VOL</span>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={Math.round(voiceVolume * 100)}
                          onChange={(e) => setVoiceVolume(parseInt(e.target.value) / 100)}
                          disabled={!isVoiceSupported}
                          className="flex-1 min-w-0 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed
                            [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2 [&::-webkit-slider-thumb]:h-2
                            [&::-webkit-slider-thumb]:rounded-full
                            [&::-moz-range-thumb]:w-2 [&::-moz-range-thumb]:h-2 [&::-moz-range-thumb]:rounded-full
                            [&::-moz-range-thumb]:border-0"
                          title={`Voice volume: ${Math.round(voiceVolume * 100)}%`}
                        />
                        <span className="text-[10px] font-pixel opacity-60 w-6 text-right flex-shrink-0" style={{ color: theme.colors.neonMagenta }}>
                          {Math.round(voiceVolume * 100)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Song Selector - Under music volume */}
                {availableSongs.length > 0 && (
                  <SongSelector
                    currentSong={currentSong}
                    availableSongs={availableSongs}
                    isAutoCycling={isAutoCycling}
                    onSongChange={setSong}
                    className="w-full"
                  />
                )}

                {/* Audio Visualizer - At the bottom */}
                <div className="w-full">
                  <AudioVisualizer
                    analyserNode={analyserNode}
                    isPlaying={isPlaying}
                    height={40}
                  />
                </div>
              </div>

              {/* Center Column: Title */}
              <div className="flex flex-col items-center justify-center text-center mx-auto">
                <h1 className="text-4xl md:text-5xl font-pixel glow-text" style={{ color: theme.colors.primary }}>
                  {theme.name.toUpperCase()}
                </h1>
                <p className="text-sm md:text-base font-pixel mt-2" style={{ color: theme.colors.accent }}>
                  {'>'} {theme.tagline}
                </p>
              </div>

              {/* Right Column: App Switcher + Clear Button */}
              <div className="flex flex-col gap-4 items-end max-w-[240px] ml-auto">
                <AppSwitcher />
                
                {/* Clear Button (right column on desktop, under app switcher) */}
                {conversationGroups.length > 0 && (
                  <button
                    onClick={handleClearConversation}
                    disabled={loadingStatus !== null && loadingStatus !== 'done'}
                    className="px-4 py-2 bg-[#1a1f3a] border-2 text-xs font-pixel hover:text-[#0a0e27] transition-colors disabled:opacity-50 disabled:cursor-not-allowed pixel-border whitespace-nowrap"
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
          </div>
        </header>

        {/* Loading State - Between Header and Main */}
        {loadingStatus !== null && loadingStatus !== 'done' && (
          <div className="flex flex-col items-center justify-center pt-24 pb-8 border-b-4 pixel-border flex-shrink-0" style={{ borderColor: `${theme.colors.primary}30` }}>
            <LoadingSpinner status={loadingStatus} />
          </div>
        )}

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
                  onSetQuestion={setQuestion}
                />
              </ErrorBoundary>
            ))}
          </div>
        </main>

        {/* Question Input - Fixed above footer */}
        <div className="flex-shrink-0 bg-[#0a0e27]/95 p-4 mt-4 border-t-4 pixel-border backdrop-blur-sm" style={{ borderColor: theme.colors.primary }}>
          <QuestionInput
            key={appMode}
            onSubmit={handleQuestion}
            loadingStatus={loadingStatus}
            question={question}
            setQuestion={setQuestion}
          />
        </div>

        {/* Footer */}
        <footer className="text-center py-4 px-4 border-t-4 pixel-border flex-shrink-0 space-y-2" style={{ borderColor: `${theme.colors.primary}30` }}>
          {/* Music Attribution */}
          <MusicAttribution
            currentSong={currentSong}
            isPlaying={isPlaying}
            className="mb-2"
          />
          
          <p className="text-xs text-gray-500 font-pixel">
            2026 {theme.name.toUpperCase()} | POWERED BY {appMode === 'ticker' ? 'LANGFLOW' : 'OPENRAG'}
          </p>
        </footer>
      </div>
    </div>
  );
}

// Made with Bob
