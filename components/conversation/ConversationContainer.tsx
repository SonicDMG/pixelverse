'use client';

import { ConversationGroup as ConversationGroupType, LoadingStatus } from '@/types';
import ConversationGroup from '@/components/ConversationGroup';
import { ErrorBoundary } from '@/components/ErrorBoundary';

/**
 * ConversationContainer Component
 * 
 * Displays the conversation history with user questions and assistant responses.
 * Each conversation group is wrapped in an error boundary for resilience.
 * 
 * @param groups - Array of conversation groups to display
 * @param isLoading - Whether a request is currently loading
 * @param error - Error message to display, if any
 * @param onSetQuestion - Callback to set a question in the input field
 */
interface ConversationContainerProps {
  groups: ConversationGroupType[];
  isLoading: boolean;
  error: string | null;
  onSetQuestion: (question: string) => void;
}

export function ConversationContainer({
  groups,
  isLoading,
  error,
  onSetQuestion,
}: ConversationContainerProps) {
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
            onSetQuestion={onSetQuestion}
          />
        </ErrorBoundary>
      ))}
    </div>
  );
}

// Made with Bob