'use client';

import { LoadingStatus } from '@/types';

interface LoadingSpinnerProps {
  status?: LoadingStatus;
}

const STATUS_CONFIG = {
  choosing_agent: {
    text: 'CHOOSING AGENT',
    progress: 25,
  },
  getting_data: {
    text: 'GETTING STOCK DATA',
    progress: 50,
  },
  processing: {
    text: 'PROCESSING DATA',
    progress: 75,
  },
  done: {
    text: 'COMPLETE',
    progress: 100,
  },
};

export default function LoadingSpinner({ status = 'choosing_agent' }: LoadingSpinnerProps) {
  const config = status && status !== 'done' ? STATUS_CONFIG[status] : STATUS_CONFIG.choosing_agent;

  return (
    <div className="flex flex-col items-center justify-center space-y-4 p-8">
      {/* Animated pixel dots */}
      <div className="flex items-center justify-center space-x-2">
        <div
          className="w-4 h-4 bg-[#00ff9f] pixel-dot animate-bounce"
          style={{ animationDelay: '0ms', animationDuration: '1s' }}
        ></div>
        <div
          className="w-4 h-4 bg-[#00ff9f] pixel-dot animate-bounce"
          style={{ animationDelay: '200ms', animationDuration: '1s' }}
        ></div>
        <div
          className="w-4 h-4 bg-[#00ff9f] pixel-dot animate-bounce"
          style={{ animationDelay: '400ms', animationDuration: '1s' }}
        ></div>
      </div>
      
      {/* Animated text */}
      <div className="text-[#00ff9f] text-sm font-pixel animate-pulse">
        {config.text}
      </div>
      
      {/* Progress bar with stage indicator */}
      <div className="w-64 space-y-2">
        <div className="h-2 bg-[#0a0e27] border-2 border-[#00ff9f] pixel-border overflow-hidden">
          <div
            className="h-full bg-[#00ff9f] transition-all duration-500 ease-out"
            style={{ width: `${config.progress}%` }}
          ></div>
        </div>
        <div className="text-[#00ff9f]/70 text-xs font-pixel text-center">
          {config.progress}% COMPLETE
        </div>
      </div>
    </div>
  );
}

// Made with Bob
