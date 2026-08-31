import { useState } from 'react';
import { Message, ComponentSpec, ReferenceSource } from '@/types';
import { DynamicUIRenderer } from './DynamicUIRenderer';
import { StockChart } from './StockChart';
import { StreamingDataLoader } from './dynamic/StreamingDataLoader';
import { useTheme } from '@/contexts/ThemeContext';

interface ConversationGroupProps {
  userMessage: Message;
  assistantMessage: Message;
  components?: ComponentSpec[];
  stockData?: any[];
  symbol?: string;
  references?: ReferenceSource[];
  durationSeconds?: number;
  streamingChunks?: number;
  onSetQuestion?: (question: string) => void;
}

/**
 * ConversationGroup - Groups a user question, assistant response, and any related visualizations
 * This creates clear visual separation between different conversation exchanges
 */
export function ConversationGroup({
  userMessage,
  assistantMessage,
  components,
  stockData,
  symbol,
  references,
  durationSeconds,
  streamingChunks,
  onSetQuestion,
}: ConversationGroupProps) {
  const { theme } = useTheme();
  const [showReferences, setShowReferences] = useState(false);
  
  return (
    <div className="conversation-group">
      {/* Streaming Stats - Show completed streaming info at the top */}
      {streamingChunks !== undefined && streamingChunks > 0 && (
        <div className="animate-fade-in mb-4">
          <StreamingDataLoader
            message="DATA STREAM COMPLETE"
            status="complete"
            chunksReceived={streamingChunks}
            totalChunks={streamingChunks}
          />
        </div>
      )}

      {/* User Question */}
      <div className="p-4 border-4 pixel-border bg-[var(--color-bg-card)] border-[var(--color-primary)] ml-8 mb-4 animate-fade-in">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-pixel text-[var(--color-primary)]">
              {'>'} USER
            </span>
            <span className="text-xs text-gray-500 font-pixel">
              {new Date(userMessage.timestamp).toLocaleTimeString()}
            </span>
          </div>
          {durationSeconds !== undefined && (
            <span className="text-xs font-pixel text-cyan-400">
              {durationSeconds.toFixed(1)}s
            </span>
          )}
        </div>
        <p className="text-sm text-white font-pixel leading-relaxed whitespace-pre-wrap">
          {userMessage.content}
        </p>
      </div>

      {/* Assistant Response */}
      <div className="p-4 border-4 pixel-border bg-[var(--color-bg-dark)] mr-8 mb-6 animate-fade-in" style={{ borderColor: theme.colors.secondary }}>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-pixel" style={{ color: theme.colors.secondary }}>
            {'>'} {theme.name.toUpperCase()}
          </span>
          <span className="text-xs text-gray-500 font-pixel">
            {new Date(assistantMessage.timestamp).toLocaleTimeString()}
          </span>
        </div>
        <p className="text-sm text-white font-pixel leading-relaxed whitespace-pre-wrap">
          {assistantMessage.content}
        </p>

        {/* References / Citations Drawer */}
        {references && references.length > 0 && (
          <div className="mt-4 pt-3 border-t-2 border-[#333]">
            <button
              onClick={() => setShowReferences(prev => !prev)}
              className="flex items-center gap-2 text-xs font-pixel text-gray-400 hover:text-white transition-colors cursor-pointer py-1"
              type="button"
            >
              <span className="text-[10px]" style={{ color: theme.colors.primary }}>
                {showReferences ? '▼' : '►'}
              </span>
              <span>
                REFERENCES ({references.length})
              </span>
            </button>

            {showReferences && (
              <div className="mt-2 space-y-2 pl-2 border-l-2 border-[#444] animate-fade-in">
                {references.map((ref, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 bg-black/40 border border-[#2a2a2a] text-xs font-pixel space-y-1"
                  >
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-1.5 text-white font-medium">
                        <span className="text-cyan-400">[{idx + 1}]</span>
                        {ref.url ? (
                          <a
                            href={ref.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-cyan-300 hover:underline inline-flex items-center gap-1"
                          >
                            {ref.title}
                          </a>
                        ) : (
                          <span>{ref.title}</span>
                        )}
                      </div>
                      <div className="text-[10px] text-gray-500">
                        {ref.pageNum !== null && ref.pageNum !== undefined && `p. ${ref.pageNum}`}
                      </div>
                    </div>

                    {ref.heading && (
                      <div className="text-[11px] text-gray-400">
                        § {ref.heading}
                      </div>
                    )}

                    {ref.excerpt && (
                      <p className="text-[11px] text-gray-400/90 leading-relaxed italic bg-black/30 p-1.5 rounded-none border-l-2 border-cyan-500/40">
                        &ldquo;{ref.excerpt}&hellip;&rdquo;
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* UI Components or Charts */}
      {components && components.length > 0 && (
        <div className="animate-fade-in mt-6">
          <DynamicUIRenderer components={components} onSetQuestion={onSetQuestion} />
        </div>
      )}

      {/* Legacy Stock Chart (if no components but has stock data) */}
      {!components && stockData && stockData.length > 0 && (
        <div className="animate-fade-in mt-6">
          <StockChart data={stockData} symbol={symbol} />
        </div>
      )}
    </div>
  );
}

// Made with Bob