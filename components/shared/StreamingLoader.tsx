'use client';

import { useEffect, useState } from 'react';

interface StreamingLoaderProps {
  /** Optional message to display alongside the animation */
  message?: string;
  /** Number of pixel blocks to display (default: 8) */
  blockCount?: number;
  /** Animation speed in milliseconds (default: 150) */
  speed?: number;
}

/**
 * StreamingLoader - A pixel-themed loading component for streaming data
 * 
 * Displays animated pixel blocks that fill progressively to indicate
 * data is actively streaming in. Designed for cyberpunk/pixel aesthetic.
 * 
 * Features:
 * - Progressive fill animation showing data streaming
 * - Pulsing glow effect on active blocks
 * - Scanline effect for retro CRT feel
 * - Customizable message display
 * 
 * @example
 * ```tsx
 * <StreamingLoader message="RECEIVING DATA..." />
 * <StreamingLoader blockCount={12} speed={100} />
 * ```
 */
export function StreamingLoader({
  message = 'STREAMING DATA...',
  blockCount = 8,
  speed = 150,
}: StreamingLoaderProps) {
  const [activeBlocks, setActiveBlocks] = useState<number[]>([]);
  const [cycle, setCycle] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCycle((prev) => {
        const nextCycle = (prev + 1) % (blockCount + 2);
        
        // Create wave effect: fill blocks progressively, then reset
        if (nextCycle === 0) {
          setActiveBlocks([]);
        } else if (nextCycle <= blockCount) {
          setActiveBlocks((prev) => [...prev, nextCycle - 1]);
        }
        
        return nextCycle;
      });
    }, speed);

    return () => clearInterval(interval);
  }, [blockCount, speed]);

  return (
    <div className="flex flex-col items-center justify-center space-y-6 p-6">
      {/* Message text with glitch effect */}
      <div className="text-[var(--color-primary)] text-xs font-pixel glow-text-subtle animate-pulse">
        {message}
      </div>

      {/* Streaming blocks container with scanline effect */}
      <div className="relative scanline-container">
        <div className="flex items-end space-x-2 h-16">
          {Array.from({ length: blockCount }).map((_, index) => {
            const isActive = activeBlocks.includes(index);
            const isMostRecent = activeBlocks[activeBlocks.length - 1] === index;
            
            // Calculate height based on position for wave effect
            const heightClass = isActive
              ? index % 3 === 0
                ? 'h-16'
                : index % 3 === 1
                ? 'h-12'
                : 'h-14'
              : 'h-4';

            return (
              <div
                key={index}
                className={`
                  w-3 transition-all duration-200 pixel-border
                  ${heightClass}
                  ${
                    isActive
                      ? 'bg-[var(--color-primary)]'
                      : 'bg-[var(--color-bg-card)] opacity-30'
                  }
                  ${
                    isMostRecent
                      ? 'shadow-[0_0_15px_var(--color-primary)] animate-pulse'
                      : isActive
                      ? 'shadow-[0_0_8px_var(--color-primary)]'
                      : ''
                  }
                `}
                style={{
                  imageRendering: 'pixelated',
                }}
              />
            );
          })}
        </div>

        {/* Data stream indicator line */}
        <div className="mt-2 h-0.5 bg-gradient-to-r from-transparent via-[var(--color-primary)] to-transparent opacity-50" />
      </div>

      {/* Status indicator */}
      <div className="flex items-center space-x-2">
        <div className="flex space-x-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 bg-[var(--color-primary)] pixel-dot"
              style={{
                animation: `pulse 1.5s ease-in-out infinite`,
                animationDelay: `${i * 0.2}s`,
                boxShadow: '0 0 8px var(--color-primary)',
              }}
            />
          ))}
        </div>
        <span className="text-[var(--color-primary)]/70 text-[0.6rem] font-pixel">
          {activeBlocks.length}/{blockCount} BLOCKS
        </span>
      </div>
    </div>
  );
}

// Made with Bob