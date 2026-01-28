'use client';

import { useState, useCallback, useEffect } from 'react';
import QuestionInput from '@/components/QuestionInput';
import LoadingSpinner from '@/components/LoadingSpinner';
import { MusicAttribution } from '@/components/MusicAttribution';
import { useTheme } from '@/contexts/ThemeContext';
import { useSession } from '@/hooks/useSession';
import { useConversation } from '@/hooks/useConversation';
import { useAudioControls } from '@/hooks/useAudioControls';
import { ConversationContainer } from '@/components/conversation/ConversationContainer';
import { AudioControlPanel } from '@/components/audio/AudioControlPanel';
import { AppHeader } from '@/components/layout/AppHeader';

export default function Home() {
  const { appMode, theme } = useTheme();
  const { sessionId, resetSession } = useSession();
  const [question, setQuestion] = useState('');

  // Conversation management
  const conversation = useConversation(sessionId, theme.apiEndpoint);

  // Audio controls
  const audio = useAudioControls(appMode, theme);

  // Clear conversation when switching modes
  useEffect(() => {
    conversation.clearConversation();
  }, [appMode]);

  // Handle question submission with voice announcements
  const handleQuestion = useCallback(async (questionText: string) => {
    // Announce request submission with voice
    await audio.announceWithVoice(`Processing your request: ${questionText}`, 'info');

    // Submit question
    const success = await conversation.submitQuestion(questionText);

    if (success) {
      setQuestion(''); // Clear the question input after successful submission
      
      // Announce completion
      await audio.announceWithVoice('Request complete', 'info');

      // Read the answer text with voice (get the latest conversation group)
      const latestGroup = conversation.conversationGroups[conversation.conversationGroups.length - 1];
      if (latestGroup?.assistantMessage?.content) {
        setTimeout(() => {
          audio.announceWithVoice(latestGroup.assistantMessage.content, 'info');
        }, 1000);
      }

      // Announce key information from the response (for stock data)
      if (latestGroup?.stockData && latestGroup.stockData.length > 0) {
        const latestData = latestGroup.stockData[latestGroup.stockData.length - 1];
        const priceAnnouncement = `${latestGroup.symbol || 'Stock'} price: ${latestData.price} dollars`;
        setTimeout(() => {
          audio.announceWithVoice(priceAnnouncement, 'price');
        }, 2000);
      }
    } else {
      // Announce error with voice
      await audio.announceWithVoice('Request failed. Error occurred.', 'alert');
    }
  }, [conversation, audio]);

  const handleClearConversation = useCallback(() => {
    conversation.clearConversation();
    resetSession();
  }, [conversation, resetSession]);

  return (
    <div className="h-screen flex items-center justify-center p-4">
      <div className="h-full w-full max-w-7xl flex flex-col overflow-hidden">
        {/* Header - Contains app switcher, title, and integrates with audio controls */}
        <header className="py-4 md:py-6 px-2 md:px-4 border-b-4 border-[var(--color-primary)]/20 pixel-border flex-shrink-0">
          <div className="max-w-7xl mx-auto">
            {/* Mobile Layout: Stacked vertically */}
            <div className="flex flex-col gap-4 lg:hidden">
              <AppHeader
                appMode={appMode}
                theme={theme}
                hasConversation={conversation.conversationGroups.length > 0}
                loadingStatus={conversation.loadingStatus}
                onClearConversation={handleClearConversation}
              />
              <AudioControlPanel
                isMusicPlaying={audio.isMusicPlaying}
                isMusicReady={audio.isMusicReady}
                musicVolume={audio.musicVolume}
                currentSong={audio.currentSong}
                availableSongs={audio.availableSongs}
                isAutoCycling={audio.isAutoCycling}
                analyserNode={audio.analyserNode}
                onToggleMusic={audio.toggleMusic}
                onSetMusicVolume={audio.setMusicVolume}
                onSetSong={audio.setSong}
                isVoiceSupported={audio.isVoiceSupported}
                isVoiceEnabled={audio.isVoiceEnabled}
                voiceVolume={audio.voiceVolume}
                onToggleVoice={audio.toggleVoice}
                onSetVoiceVolume={audio.setVoiceVolume}
                isMounted={audio.isMounted}
                theme={theme}
              />
            </div>

            {/* Desktop Layout: Three-column grid */}
            <div className="hidden lg:grid lg:grid-cols-[1fr_2fr_1fr] lg:gap-8 lg:items-start">
              {/* Left Column: Audio Controls */}
              <AudioControlPanel
                isMusicPlaying={audio.isMusicPlaying}
                isMusicReady={audio.isMusicReady}
                musicVolume={audio.musicVolume}
                currentSong={audio.currentSong}
                availableSongs={audio.availableSongs}
                isAutoCycling={audio.isAutoCycling}
                analyserNode={audio.analyserNode}
                onToggleMusic={audio.toggleMusic}
                onSetMusicVolume={audio.setMusicVolume}
                onSetSong={audio.setSong}
                isVoiceSupported={audio.isVoiceSupported}
                isVoiceEnabled={audio.isVoiceEnabled}
                voiceVolume={audio.voiceVolume}
                onToggleVoice={audio.toggleVoice}
                onSetVoiceVolume={audio.setVoiceVolume}
                isMounted={audio.isMounted}
                theme={theme}
              />

              {/* Center and Right Columns: Title and App Switcher */}
              <AppHeader
                appMode={appMode}
                theme={theme}
                hasConversation={conversation.conversationGroups.length > 0}
                loadingStatus={conversation.loadingStatus}
                onClearConversation={handleClearConversation}
              />
            </div>
          </div>
        </header>

        {/* Loading State */}
        {conversation.loadingStatus !== null && conversation.loadingStatus !== 'done' && (
          <div className="flex flex-col items-center justify-center pt-24 pb-8 border-b-4 border-[var(--color-primary)]/20 pixel-border flex-shrink-0">
            <LoadingSpinner status={conversation.loadingStatus} />
          </div>
        )}

        {/* Main Content - Scrollable */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <ConversationContainer
            groups={conversation.conversationGroups}
            isLoading={conversation.loadingStatus !== null}
            error={conversation.error}
            onSetQuestion={setQuestion}
          />
        </main>

        {/* Question Input - Fixed above footer */}
        <div className="flex-shrink-0 bg-[var(--color-bg-dark)]/95 p-4 mt-4 border-t-4 pixel-border backdrop-blur-sm" style={{ borderColor: theme.colors.primary }}>
          <QuestionInput
            key={appMode}
            onSubmit={handleQuestion}
            loadingStatus={conversation.loadingStatus}
            question={question}
            setQuestion={setQuestion}
          />
        </div>

        {/* Footer */}
        <footer className="text-center py-4 px-4 border-t-4 border-[var(--color-primary)]/20 pixel-border flex-shrink-0 space-y-2">
          <MusicAttribution
            currentSong={audio.currentSong}
            isPlaying={audio.isMusicPlaying}
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
