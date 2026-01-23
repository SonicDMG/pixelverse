'use client';

interface ConstellationProps {
  name: string;
  abbreviation: string;
  description: string;
  brightestStar?: string;
  visibility: string;
  stars: Array<{
    name: string;
    magnitude: number;
  }>;
}

export default function Constellation({
  name,
  abbreviation,
  description,
  brightestStar,
  visibility,
  stars,
}: ConstellationProps) {
  // Helper to render star magnitude with visual representation
  const renderStarMagnitude = (magnitude: number) => {
    // Brighter stars have lower magnitude values
    const brightness = Math.max(0, Math.min(5, 6 - magnitude));
    const starSize = brightness > 3 ? 'text-xl' : brightness > 1 ? 'text-lg' : 'text-base';
    const starColor = brightness > 3 ? 'text-[#FFD700]' : brightness > 1 ? 'text-[#00CED1]' : 'text-[#9370DB]';
    
    return (
      <span className={`${starSize} ${starColor}`}>★</span>
    );
  };

  return (
    <div className="w-full p-6 bg-gradient-to-br from-[#0a0e27] via-[#1a1f3a] to-[#0a0e27] border-4 border-[#4169E1] rounded-lg pixel-border hover:border-[#9370DB] transition-all duration-300 glitch-hover relative overflow-hidden">
      {/* Starfield background effect */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-4 left-8 w-1 h-1 bg-white rounded-full animate-pulse"></div>
        <div className="absolute top-12 right-16 w-1 h-1 bg-[#00CED1] rounded-full animate-pulse delay-100"></div>
        <div className="absolute bottom-8 left-20 w-1 h-1 bg-[#9370DB] rounded-full animate-pulse delay-200"></div>
        <div className="absolute top-20 right-8 w-1 h-1 bg-white rounded-full animate-pulse delay-300"></div>
      </div>

      <div className="relative space-y-4">
        {/* Constellation Header */}
        <div className="flex items-baseline justify-between flex-wrap gap-2">
          <div className="flex items-baseline gap-3">
            <h2 className="text-3xl font-pixel text-[#FFD700] glow-text uppercase tracking-wider">
              {name}
            </h2>
            <span className="text-lg font-pixel text-[#4169E1] opacity-80">
              ({abbreviation})
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-2xl text-[#FFD700] animate-pulse">✦</span>
            <span className="text-xl text-[#00CED1] animate-pulse delay-100">✦</span>
            <span className="text-lg text-[#9370DB] animate-pulse delay-200">✦</span>
          </div>
        </div>

        {/* Description */}
        <p className="font-pixel text-sm text-gray-300 leading-relaxed border-l-4 border-[#4169E1] pl-4 bg-[#0a0e27]/50 py-2">
          {description}
        </p>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* Brightest Star */}
          {brightestStar && (
            <div className="p-3 bg-[#1a1f3a] border-2 border-[#FFD700]/30 rounded pixel-border">
              <div className="text-xs font-pixel text-[#FFD700] uppercase tracking-wide mb-1">
                ⭐ Brightest Star
              </div>
              <div className="text-lg font-pixel text-white">
                {brightestStar}
              </div>
            </div>
          )}

          {/* Visibility */}
          <div className="p-3 bg-[#1a1f3a] border-2 border-[#00CED1]/30 rounded pixel-border">
            <div className="text-xs font-pixel text-[#00CED1] uppercase tracking-wide mb-1">
              🌍 Visibility
            </div>
            <div className="text-sm font-pixel text-white">
              {visibility}
            </div>
          </div>
        </div>

        {/* Stars List */}
        {stars && stars.length > 0 && (
          <div className="pt-4 border-t-2 border-[#4169E1]/30">
            <h3 className="text-sm font-pixel text-[#4169E1] uppercase mb-3 flex items-center gap-2">
              <span>Notable Stars</span>
              <span className="text-xs text-gray-500">({stars.length})</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {stars.map((star, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-[#0a0e27]/80 border border-[#4169E1]/20 rounded hover:border-[#00CED1]/50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    {renderStarMagnitude(star.magnitude)}
                    <span className="font-pixel text-xs text-white">
                      {star.name}
                    </span>
                  </div>
                  <span className="font-pixel text-xs text-[#9370DB]">
                    mag {star.magnitude.toFixed(1)}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-2 text-xs font-pixel text-gray-500 italic">
              * Lower magnitude = brighter star
            </div>
          </div>
        )}

        {/* Decorative constellation pattern */}
        <div className="flex justify-center items-center gap-3 pt-2 opacity-40">
          <span className="text-[#FFD700] text-sm">★</span>
          <div className="w-8 h-px bg-gradient-to-r from-transparent via-[#4169E1] to-transparent"></div>
          <span className="text-[#00CED1] text-lg">★</span>
          <div className="w-8 h-px bg-gradient-to-r from-transparent via-[#4169E1] to-transparent"></div>
          <span className="text-[#9370DB] text-sm">★</span>
        </div>
      </div>
    </div>
  );
}

// Made with Bob