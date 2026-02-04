'use client';

import { ConversationGroup as ConversationGroupType, LoadingStatus } from '@/types';
import { ConversationGroup } from '@/components/ConversationGroup';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { StreamingDataLoader } from '@/components/dynamic/StreamingDataLoader';

/**
 * ConversationContainer Component
 *
 * Displays the conversation history with user questions and assistant responses.
 * Each conversation group is wrapped in an error boundary for resilience.
 * Shows a streaming data loader during active requests.
 *
 * @param groups - Array of conversation groups to display
 * @param isLoading - Whether a request is currently loading
 * @param loadingStatus - Current loading status for progress tracking
 * @param error - Error message to display, if any
 * @param onSetQuestion - Callback to set a question in the input field
 */
interface ConversationContainerProps {
  groups: ConversationGroupType[];
  isLoading: boolean;
  loadingStatus?: LoadingStatus;
  streamingChunks?: number;
  error: string | null;
  onSetQuestion: (question: string) => void;
}

export function ConversationContainer({
  groups,
  isLoading,
  loadingStatus,
  streamingChunks = 0,
  error,
  onSetQuestion,
}: ConversationContainerProps) {
  // Map loading status to streaming loader status
  const getStreamingStatus = (): 'connecting' | 'streaming' | 'processing' | 'complete' => {
    switch (loadingStatus) {
      case 'choosing_agent':
        return 'connecting';
      case 'getting_data':
        return 'streaming';
      case 'processing':
        return 'processing';
      default:
        return 'streaming';
    }
  };

  return (
    <div className="w-full pb-8 space-y-8">
      {/* Error Display */}
      {error && (
        <div className="error-message pixel-border mb-6">
          <p>ERROR: {error}</p>
        </div>
      )}

      {/* Conversation Groups - Each group contains user question, assistant response, and visualizations */}
      {groups.map((group) => (
        <ErrorBoundary key={group.id}>
          <ConversationGroup
            userMessage={group.userMessage}
            assistantMessage={group.assistantMessage}
            components={group.components}
            stockData={group.stockData}
            symbol={group.symbol}
            durationSeconds={group.durationSeconds}
            streamingChunks={group.streamingChunks}
            onSetQuestion={onSetQuestion}
          />
        </ErrorBoundary>
      ))}

      {/* Streaming Data Loader - Shows during active requests */}
      {isLoading && loadingStatus && loadingStatus !== 'done' && (
        <div className="conversation-group">
          <StreamingDataLoader
            status={getStreamingStatus()}
            chunksReceived={streamingChunks}
          />
        </div>
      )}
    </div>
  );
}

// Made with Bob