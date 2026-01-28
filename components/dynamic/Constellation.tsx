'use client';

import { useState, useMemo } from 'react';
import { convertStarsToCanvas } from '@/utils/celestial-coordinates';

interface Star {
  name: string;
  magnitude: number;
  ra?: string; // Right Ascension "HHh MMm"
  dec?: string; // Declination "±DD° MM'"
  x?: number;
  y?: number;
  color?: string; // Hex color or spectral class (O, B, A, F, G, K, M)
  size?: number; // Relative size multiplier (0.5-3.0)
}

interface ConstellationLine {
  from: number;
  to: number;
}

interface ConstellationProps {
  name: string;
  abbreviation: string;
  description: string;
  brightestStar?: string;
  visibility: string;
  stars: Star[];
  lines?: ConstellationLine[];
  onStarClick?: (star: Star) => void;
}

export default function Constellation({
  name,
  abbreviation,
  description,
  brightestStar,
  visibility,
  stars,
  lines = [],
  onStarClick,
}: ConstellationProps) {
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);
  const [clickedStar, setClickedStar] = useState<number | null>(null);

  // Handle star click
  const handleStarClick = (index: number) => {
    setClickedStar(index);
    if (onStarClick) {
      onStarClick(starsWithCoords[index]);
    }
  };

  // Auto-calculate coordinates from RA/Dec if not provided
  const starsWithCoords = useMemo(() => {
    // Check if any stars have RA/Dec but not x/y
    const needsConversion = stars.some(star =>
      star.ra && star.dec && (star.x === undefined || star.y === undefined)
    );

    if (!needsConversion) {
      return stars;
    }

    // Extract stars with RA/Dec for conversion
    const starsForConversion = stars.map(star => ({
      ra: star.ra || '0h 0m',
      dec: star.dec || '+0° 0\''
    }));

    try {
      const canvasCoords = convertStarsToCanvas(starsForConversion);
      
      // Merge calculated coordinates with original star data
      return stars.map((star, i) => ({
        ...star,
        x: star.x ?? canvasCoords[i].x,
        y: star.y ?? canvasCoords[i].y
      }));
    } catch (error) {
      console.error('Error converting RA/Dec to canvas coordinates:', error);
      return stars;
    }
  }, [stars]);

  // Check if we have coordinate data for visualization
  const hasCoordinates = starsWithCoords.some(star => star.x !== undefined && star.y !== undefined);

  // Helper to convert spectral class to color
  const spectralClassToColor = (spectralClass: string): string => {
    const upperClass = spectralClass.toUpperCase().charAt(0);
    const spectralColors: Record<string, string> = {
      'O': 'var(--color-spectral-o)', // Blue - hottest stars
      'B': 'var(--color-spectral-b)', // Blue-white
      'A': 'var(--color-spectral-a)', // White
      'F': 'var(--color-spectral-f)', // Yellow-white
      'G': 'var(--color-spectral-g)', // Yellow (like our Sun)
      'K': 'var(--color-spectral-k)', // Orange
      'M': 'var(--color-spectral-m)', // Red-orange - coolest stars (Betelgeuse)
    };
    return spectralColors[upperClass] || '#FFFFFF';
  };

  // Helper to get star color
  const getStarColor = (star: Star): string => {
    // If color is provided, use it
    if (star.color) {
      // Check if it's a hex color
      if (star.color.startsWith('#')) {
        return star.color;
      }
      // Otherwise treat as spectral class
      return spectralClassToColor(star.color);
    }
    
    // Fallback to magnitude-based coloring
    const brightness = Math.max(0, Math.min(5, 6 - star.magnitude));
    if (brightness > 3) return 'var(--color-accent)';
    if (brightness > 1) return 'var(--color-secondary)';
    return 'var(--color-purple)';
  };

  // Helper to get star size based on magnitude and optional size multiplier
  const getStarRadius = (star: Star): number => {
    const brightness = Math.max(0, Math.min(5, 6 - star.magnitude));
    let baseRadius: number;
    if (brightness > 3) baseRadius = 8;
    else if (brightness > 1) baseRadius = 6;
    else baseRadius = 4;
    
    // Apply size multiplier if provided
    if (star.size !== undefined) {
      return baseRadius * Math.max(0.5, Math.min(3.0, star.size));
    }
    
    return baseRadius;
  };

  // Helper to render star magnitude with visual representation
  const renderStarMagnitude = (star: Star) => {
    // Brighter stars have lower magnitude values
    const brightness = Math.max(0, Math.min(5, 6 - star.magnitude));
    const starSize = brightness > 3 ? 'text-xl' : brightness > 1 ? 'text-lg' : 'text-base';
    const color = getStarColor(star);
    
    return (
      <span className={starSize} style={{ color }}>★</span>
    );
  };

  return (
    <div className="w-full p-6 bg-gradient-to-br from-[var(--color-bg-dark)] via-[var(--color-bg-card)] to-[var(--color-bg-dark)] border-4 border-[var(--color-primary)] rounded-lg pixel-border hover:border-[var(--color-purple)] transition-all duration-300 glitch-hover relative overflow-hidden">
      {/* Starfield background effect */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-4 left-8 w-1 h-1 bg-white rounded-full animate-pulse"></div>
        <div className="absolute top-12 right-16 w-1 h-1 bg-[var(--color-secondary)] rounded-full animate-pulse delay-100"></div>
        <div className="absolute bottom-8 left-20 w-1 h-1 bg-[var(--color-purple)] rounded-full animate-pulse delay-200"></div>
        <div className="absolute top-20 right-8 w-1 h-1 bg-white rounded-full animate-pulse delay-300"></div>
      </div>

      <div className="relative space-y-4">
        {/* Constellation Header */}
        <div className="flex items-baseline justify-between flex-wrap gap-2">
          <div className="flex items-baseline gap-3">
            <h2 className="text-3xl font-pixel text-[var(--color-accent)] glow-text uppercase tracking-wider">
              {name}
            </h2>
            <span className="text-lg font-pixel text-[var(--color-primary)] opacity-80">
              ({abbreviation})
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-2xl text-[var(--color-accent)] animate-pulse">✦</span>
            <span className="text-xl text-[var(--color-secondary)] animate-pulse delay-100">✦</span>
            <span className="text-lg text-[var(--color-purple)] animate-pulse delay-200">✦</span>
          </div>
        </div>

        {/* Description */}
        <p className="font-pixel text-sm text-gray-300 leading-relaxed border-l-4 border-[var(--color-primary)] pl-4 bg-[var(--color-bg-dark)]/50 py-2">
          {description}
        </p>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* Brightest Star */}
          {brightestStar && (
            <div className="p-3 bg-[var(--color-bg-card)] border-2 border-[var(--color-accent)]/30 rounded pixel-border">
              <div className="text-xs font-pixel text-[var(--color-accent)] uppercase tracking-wide mb-1">
                ⭐ Brightest Star
              </div>
              <div className="text-lg font-pixel text-white">
                {brightestStar}
              </div>
            </div>
          )}

          {/* Visibility */}
          <div className="p-3 bg-[var(--color-bg-card)] border-2 border-[var(--color-secondary)]/30 rounded pixel-border">
            <div className="text-xs font-pixel text-[var(--color-secondary)] uppercase tracking-wide mb-1">
              🌍 Visibility
            </div>
            <div className="text-sm font-pixel text-white">
              {visibility}
            </div>
          </div>
        </div>

        {/* Hybrid Layout: Star List + SVG Visualization */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 pt-4 border-t-2 border-[var(--color-primary)]/30">
          {/* Left Side: Star List (2 columns on large screens) */}
          <div className="lg:col-span-2">
            <h3 className="text-sm font-pixel text-[var(--color-primary)] uppercase mb-3 flex items-center gap-2">
              <span>Notable Stars</span>
              <span className="text-xs text-gray-500">({stars.length})</span>
            </h3>
            <div className="space-y-2">
              {starsWithCoords.map((star, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-[var(--color-bg-dark)]/80 border border-[var(--color-primary)]/20 rounded hover:border-[var(--color-secondary)]/50 transition-colors cursor-pointer"
                  onMouseEnter={() => setHoveredStar(index)}
                  onMouseLeave={() => setHoveredStar(null)}
                  onClick={() => handleStarClick(index)}
                  style={{
                    borderColor: clickedStar === index ? 'var(--color-accent)' : hoveredStar === index ? 'var(--color-secondary)' : undefined,
                    backgroundColor: clickedStar === index ? 'rgba(255, 215, 0, 0.1)' : undefined,
                  }}
                >
                  <div className="flex items-center gap-2">
                    {renderStarMagnitude(star)}
                    <span className="font-pixel text-xs text-white">
                      {star.name}
                    </span>
                  </div>
                  <span className="font-pixel text-xs text-[var(--color-purple)]">
                    mag {star.magnitude.toFixed(1)}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-2 text-xs font-pixel text-gray-500 italic">
              * Lower magnitude = brighter star
            </div>
          </div>

          {/* Right Side: SVG Constellation Visualization (3 columns on large screens) */}
          <div className="lg:col-span-3">
            <h3 className="text-sm font-pixel text-[var(--color-primary)] uppercase mb-3 flex items-center gap-2">
              <span>🌌 Sky View</span>
              <span className="text-xs text-gray-500">(as seen from Earth)</span>
            </h3>
            
            {hasCoordinates ? (
              <div className="relative bg-gradient-to-b from-[var(--color-bg-darker)] to-[var(--color-bg-dark)] border-2 border-[var(--color-primary)]/30 rounded-lg p-6 overflow-hidden">
                {/* Background stars - using deterministic positions */}
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                  {[...Array(50)].map((_, i) => {
                    // Use index to generate deterministic but varied positions
                    const seed = i * 137.508; // Golden angle for good distribution
                    const left = ((seed * 7) % 100);
                    const top = ((seed * 13) % 100);
                    const opacity = 0.3 + ((seed * 3) % 50) / 100;
                    
                    return (
                      <div
                        key={i}
                        className="absolute w-px h-px bg-white rounded-full"
                        style={{
                          left: `${left}%`,
                          top: `${top}%`,
                          opacity: opacity,
                        }}
                      />
                    );
                  })}
                </div>

                {/* SVG Canvas */}
                <svg
                  viewBox="0 0 400 400"
                  className="w-full h-auto max-h-[500px] relative z-10"
                  style={{ aspectRatio: '1/1' }}
                >
                  {/* Draw constellation lines */}
                  {lines.map((line, index) => {
                    const fromStar = starsWithCoords[line.from];
                    const toStar = starsWithCoords[line.to];
                    if (!fromStar?.x || !fromStar?.y || !toStar?.x || !toStar?.y) return null;
                    
                    return (
                      <line
                        key={index}
                        x1={fromStar.x}
                        y1={fromStar.y}
                        x2={toStar.x}
                        y2={toStar.y}
                        stroke="var(--color-primary)"
                        strokeWidth="1.5"
                        opacity="0.6"
                        className="transition-opacity duration-300"
                        style={{
                          opacity: hoveredStar === line.from || hoveredStar === line.to ? 1 : 0.6,
                        }}
                      />
                    );
                  })}

                  {/* Draw stars */}
                  {starsWithCoords.map((star, index) => {
                    if (!star.x || !star.y) return null;
                    
                    const radius = getStarRadius(star);
                    const color = getStarColor(star);
                    const isHovered = hoveredStar === index;
                    const isClicked = clickedStar === index;

                    return (
                      <g key={index}>
                        {/* Pulsing ring for clicked star */}
                        {isClicked && (
                          <>
                            <circle
                              cx={star.x}
                              cy={star.y}
                              r={radius * 4}
                              fill="none"
                              stroke="var(--color-accent)"
                              strokeWidth="2"
                              opacity="0.6"
                              className="animate-pulse"
                            />
                            <circle
                              cx={star.x}
                              cy={star.y}
                              r={radius * 5}
                              fill="none"
                              stroke="var(--color-accent)"
                              strokeWidth="1"
                              opacity="0.3"
                              className="animate-pulse"
                              style={{ animationDelay: '0.15s' }}
                            />
                          </>
                        )}
                        
                        {/* Glow effect for hover */}
                        {isHovered && !isClicked && (
                          <circle
                            cx={star.x}
                            cy={star.y}
                            r={radius * 3}
                            fill={color}
                            opacity="0.2"
                            className="animate-pulse"
                          />
                        )}
                        
                        {/* Star */}
                        <circle
                          cx={star.x}
                          cy={star.y}
                          r={radius}
                          fill={color}
                          className="cursor-pointer transition-all duration-200"
                          style={{
                            filter: isClicked ? 'brightness(1.8)' : isHovered ? 'brightness(1.5)' : 'brightness(1)',
                            transform: isClicked ? 'scale(1.3)' : isHovered ? 'scale(1.2)' : 'scale(1)',
                            transformOrigin: `${star.x}px ${star.y}px`,
                          }}
                          onMouseEnter={() => setHoveredStar(index)}
                          onMouseLeave={() => setHoveredStar(null)}
                          onClick={() => handleStarClick(index)}
                        />

                        {/* Star label on hover or click */}
                        {(isHovered || isClicked) && (
                          <text
                            x={star.x}
                            y={star.y - radius - 8}
                            textAnchor="middle"
                            fill="var(--color-accent)"
                            fontSize="10"
                            fontFamily="monospace"
                            className="font-pixel pointer-events-none"
                          >
                            {star.name}
                          </text>
                        )}
                      </g>
                    );
                  })}
                </svg>

                {/* Legend */}
                <div className="mt-4 flex justify-center gap-4 text-xs font-pixel text-gray-400">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[var(--color-accent)]"></div>
                    <span>Bright</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[var(--color-secondary)]"></div>
                    <span>Medium</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[var(--color-purple)]"></div>
                    <span>Dim</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="relative bg-gradient-to-b from-[var(--color-bg-darker)] to-[var(--color-bg-dark)] border-2 border-[var(--color-primary)]/30 rounded-lg p-6 overflow-hidden aspect-square flex items-center justify-center">
                <div className="text-center space-y-3">
                  <div className="text-4xl">🌟</div>
                  <p className="font-pixel text-xs text-gray-400">
                    Constellation visualization requires coordinate data
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Decorative constellation pattern */}
        <div className="flex justify-center items-center gap-3 pt-2 opacity-40">
          <span className="text-[var(--color-accent)] text-sm">★</span>
          <div className="w-8 h-px bg-gradient-to-r from-transparent via-[var(--color-primary)] to-transparent"></div>
          <span className="text-[var(--color-secondary)] text-lg">★</span>
          <div className="w-8 h-px bg-gradient-to-r from-transparent via-[var(--color-primary)] to-transparent"></div>
          <span className="text-[var(--color-purple)] text-sm">★</span>
        </div>
      </div>
    </div>
  );
}

// Made with Bob