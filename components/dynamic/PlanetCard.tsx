'use client';

interface PlanetCardProps {
  name: string;
  description: string;
  diameter: string;
  mass: string;
  distanceFromSun: string;
  orbitalPeriod: string;
  moons?: number;
  imageUrl?: string;
}

export default function PlanetCard({
  name,
  description,
  diameter,
  mass,
  distanceFromSun,
  orbitalPeriod,
  moons,
  imageUrl,
}: PlanetCardProps) {
  return (
    <div className="w-full p-6 bg-gradient-to-br from-[#0a0e27] to-[#1a1f3a] border-4 border-[#9370DB] rounded-lg pixel-border hover:border-[#00CED1] transition-all duration-300 glitch-hover scanline-container">
      <div className="space-y-4">
        {/* Planet Name */}
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-pixel text-[#9370DB] glow-text uppercase tracking-wider">
            {name}
          </h2>
          {moons !== undefined && (
            <div className="flex items-center gap-2 px-3 py-1 bg-[#4169E1]/20 border-2 border-[#4169E1] rounded pixel-border">
              <span className="text-[#00CED1] text-xl">🌙</span>
              <span className="font-pixel text-xs text-[#00CED1]">
                {moons} {moons === 1 ? 'Moon' : 'Moons'}
              </span>
            </div>
          )}
        </div>

        {/* Image (if provided) */}
        {imageUrl && (
          <div className="relative w-full h-48 rounded border-2 border-[#4169E1]/50 overflow-hidden">
            <img
              src={imageUrl}
              alt={name}
              className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0e27] to-transparent opacity-50" />
          </div>
        )}

        {/* Description */}
        <p className="font-pixel text-sm text-gray-300 leading-relaxed border-l-4 border-[#9370DB] pl-4">
          {description}
        </p>

        {/* Physical Properties Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t-2 border-[#4169E1]/30">
          {/* Diameter */}
          <div className="space-y-1">
            <div className="text-xs font-pixel text-[#4169E1] uppercase tracking-wide">
              Diameter
            </div>
            <div className="text-lg font-pixel text-white glow-text">
              {diameter}
            </div>
          </div>

          {/* Mass */}
          <div className="space-y-1">
            <div className="text-xs font-pixel text-[#4169E1] uppercase tracking-wide">
              Mass
            </div>
            <div className="text-lg font-pixel text-white glow-text">
              {mass}
            </div>
          </div>

          {/* Distance from Sun */}
          <div className="space-y-1">
            <div className="text-xs font-pixel text-[#4169E1] uppercase tracking-wide">
              Distance from Sun
            </div>
            <div className="text-lg font-pixel text-[#00CED1] glow-text">
              {distanceFromSun}
            </div>
          </div>

          {/* Orbital Period */}
          <div className="space-y-1">
            <div className="text-xs font-pixel text-[#4169E1] uppercase tracking-wide">
              Orbital Period
            </div>
            <div className="text-lg font-pixel text-[#00CED1] glow-text">
              {orbitalPeriod}
            </div>
          </div>
        </div>

        {/* Decorative cosmic elements */}
        <div className="flex justify-center gap-2 pt-2 opacity-50">
          <span className="text-[#9370DB] animate-pulse">✦</span>
          <span className="text-[#4169E1] animate-pulse delay-100">✦</span>
          <span className="text-[#00CED1] animate-pulse delay-200">✦</span>
        </div>
      </div>
    </div>
  );
}

// Made with Bob