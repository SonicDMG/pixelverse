'use client';

import { useEffect, useState } from 'react';

// Add terminal cursor blink animation
const blinkKeyframes = `
  @keyframes blink {
    0%, 49% { opacity: 1; }
    50%, 100% { opacity: 0; }
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleId = 'streaming-loader-styles';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = blinkKeyframes;
    document.head.appendChild(style);
  }
}

interface StreamingDataLoaderProps {
  /** Message to display */
  message?: string;
  /** Number of data chunks received so far */
  chunksReceived?: number;
  /** Total expected chunks (if known) */
  totalChunks?: number;
  /** Current streaming status */
  status?: 'connecting' | 'streaming' | 'processing' | 'complete';
}

/**
 * StreamingDataLoader - A dynamic component for visualizing streaming data from Langflow
 * 
 * This component is designed to be returned by the Langflow agent as part of the
 * component specification to show real-time streaming progress. It displays animated
 * pixel blocks that fill as data chunks arrive.
 * 
 * Features:
 * - Progressive block fill animation based on chunks received
 * - Status indicator showing connection/streaming state
 * - Chunk counter display
 * - Pulsing effects on active blocks
 * - Cyberpunk/pixel aesthetic
 * 
 * @example
 * Agent returns:
 * ```json
 * {
 *   "components": [
 *     {
 *       "type": "streaming-data-loader",
 *       "props": {
 *         "message": "Receiving astronomical data...",
 *         "chunksReceived": 5,
 *         "totalChunks": 10,
 *         "status": "streaming"
 *       }
 *     }
 *   ]
 * }
 * ```
 */
export function StreamingDataLoader({
  message = 'STREAMING DATA...',
  chunksReceived = 0,
  totalChunks,
  status = 'streaming',
}: StreamingDataLoaderProps) {
  // Timer for placeholder blocks - add one every second
  const [placeholderCount, setPlaceholderCount] = useState(0);
  
  // Show placeholder blocks during initial states, then actual chunks
  const showPlaceholders = status === 'connecting' || (status === 'streaming' && chunksReceived === 0);
  const blockCount = showPlaceholders ? placeholderCount : chunksReceived;

  // Add a placeholder block every second while waiting
  useEffect(() => {
    if (showPlaceholders) {
      // Start with 1 block immediately
      setPlaceholderCount(1);
      
      // Add a new block every second
      const interval = setInterval(() => {
        setPlaceholderCount(prev => prev + 1);
      }, 1000);
      
      return () => clearInterval(interval);
    } else {
      // Reset when we start getting real chunks
      setPlaceholderCount(0);
    }
  }, [showPlaceholders]);

  // Calculate fill percentage
  const fillPercentage = status === 'complete'
    ? 100 // Always show 100% when complete
    : totalChunks
    ? Math.min(100, (chunksReceived / totalChunks) * 100)
    : 0; // No percentage if we don't know total

  // Status colors and messages
  const statusConfig = {
    connecting: {
      color: 'var(--color-info)',
      text: 'CONNECTING TO AGENT...',
    },
    streaming: {
      color: 'var(--color-primary)',
      // Show "INTERACTING WITH AGENT" while waiting, "RECEIVING DATA STREAM" once chunks arrive
      text: showPlaceholders ? 'INTERACTING WITH AGENT...' : 'RECEIVING DATA STREAM...',
    },
    processing: {
      color: 'var(--color-warning)',
      text: 'PROCESSING DATA...',
    },
    complete: {
      color: 'var(--color-success)',
      text: 'STREAM COMPLETE',
    },
  };

  const currentStatus = statusConfig[status];
  // Show all blocks (one per chunk received)
  const blocksToShow = blockCount;

  return (
    <div className="p-3 bg-[var(--color-bg-card)] border-2 border-[var(--color-primary)] pixel-border">
      {/* Header with status */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div
            className="w-2 h-2 pixel-dot"
            style={{
              backgroundColor: currentStatus.color,
              boxShadow: `0 0 8px ${currentStatus.color}`,
              animation: status === 'streaming' ? 'pulse 1.5s ease-in-out infinite' : 'none',
            }}
          />
          <span
            className="text-[0.65rem] font-pixel"
            style={{ color: currentStatus.color }}
          >
            {currentStatus.text}
          </span>
        </div>
        
        {/* Chunk counter */}
        <div className="text-[var(--color-primary)]/70 text-[0.55rem] font-pixel">
          {totalChunks ? (
            <>{chunksReceived}/{totalChunks} CHUNKS</>
          ) : (
            <>{chunksReceived} CHUNKS</>
          )}
        </div>
      </div>

      {/* Streaming blocks visualization - retro terminal cursor style */}
      <div className="relative mb-3">
        <div className="flex flex-wrap gap-1">
          {Array.from({ length: blockCount }).map((_, index) => {
            const isMostRecent = index === blocksToShow - 1;
            const isPlaceholder = showPlaceholders;

            return (
              <div
                key={index}
                className={`
                  w-3 h-3 transition-all duration-200
                  ${
                    isPlaceholder
                      ? 'bg-[var(--color-primary)]/40 animate-pulse'
                      : 'bg-[var(--color-primary)]'
                  }
                  ${
                    isMostRecent && status === 'streaming' && !isPlaceholder
                      ? 'shadow-[0_0_12px_var(--color-primary)] animate-[blink_0.8s_ease-in-out_infinite]'
                      : isPlaceholder
                      ? ''
                      : 'shadow-[0_0_6px_var(--color-primary)]'
                  }
                `}
                style={{
                  imageRendering: 'pixelated',
                  border: '1px solid var(--color-primary)',
                  animationDelay: isPlaceholder ? `${index * 0.15}s` : '0s',
                }}
              />
            );
          })}
        </div>

        {/* Progress bar - only show if we know the total */}
        {totalChunks && (
          <div className="mt-2 h-1 bg-[var(--color-bg-dark)] border border-[var(--color-primary)]/30 pixel-border overflow-hidden">
            <div
              className="h-full bg-[var(--color-primary)] transition-all duration-500"
              style={{ width: `${fillPercentage}%` }}
            />
          </div>
        )}
      </div>

      {/* Status indicators - only show when streaming */}
      {status === 'streaming' && (
        <div className="flex items-center justify-center space-x-1.5 pt-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 pixel-dot"
              style={{
                backgroundColor: currentStatus.color,
                animationName: 'pulse',
                animationDuration: '1.5s',
                animationTimingFunction: 'ease-in-out',
                animationIterationCount: 'infinite',
                animationDelay: `${i * 0.2}s`,
                boxShadow: `0 0 6px ${currentStatus.color}`,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Made with Bob