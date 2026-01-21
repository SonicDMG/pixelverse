'use client';

export default function LoadingSpinner() {
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
        ANALYZING STOCK DATA
      </div>
      
      {/* Progress bar */}
      <div className="w-64 h-2 bg-[#0a0e27] border-2 border-[#00ff9f] pixel-border overflow-hidden">
        <div className="h-full bg-[#00ff9f] animate-loading-bar"></div>
      </div>
    </div>
  );
}

// Made with Bob
