'use client';

import React, { useState, useEffect, useMemo } from 'react';

// Planet data interface
interface PlanetData {
  name: string;
  type: 'terrestrial' | 'gas-giant' | 'ice-giant';
  radius: number;           // km
  mass: number;             // kg
  orbitalRadius: number;    // AU
  orbitalPeriod: number;    // Earth days
  color: string;
  description: string;
}

// Component props
interface SolarSystemProps {
  name?: string;
  description?: string;
  autoPlay?: boolean;
  timeScale?: number;
}

// Our Solar System data
const SOLAR_SYSTEM_DATA: PlanetData[] = [
  {
    name: 'Mercury',
    type: 'terrestrial',
    radius: 2439.7,
    mass: 3.285e23,
    orbitalRadius: 0.39,
    orbitalPeriod: 88,
    color: 'var(--color-planet-mercury)',
    description: 'Smallest planet, closest to the Sun'
  },
  {
    name: 'Venus',
    type: 'terrestrial',
    radius: 6051.8,
    mass: 4.867e24,
    orbitalRadius: 0.72,
    orbitalPeriod: 225,
    color: 'var(--color-planet-venus)',
    description: 'Hottest planet with thick atmosphere'
  },
  {
    name: 'Earth',
    type: 'terrestrial',
    radius: 6371,
    mass: 5.972e24,
    orbitalRadius: 1.0,
    orbitalPeriod: 365.25,
    color: 'var(--color-planet-earth)',
    description: 'Our home planet with liquid water'
  },
  {
    name: 'Mars',
    type: 'terrestrial',
    radius: 3389.5,
    mass: 6.39e23,
    orbitalRadius: 1.52,
    orbitalPeriod: 687,
    color: 'var(--color-planet-mars)',
    description: 'The Red Planet with polar ice caps'
  },
  {
    name: 'Jupiter',
    type: 'gas-giant',
    radius: 69911,
    mass: 1.898e27,
    orbitalRadius: 5.20,
    orbitalPeriod: 4333,
    color: 'var(--color-planet-jupiter)',
    description: 'Largest planet with Great Red Spot'
  },
  {
    name: 'Saturn',
    type: 'gas-giant',
    radius: 58232,
    mass: 5.683e26,
    orbitalRadius: 9.54,
    orbitalPeriod: 10759,
    color: 'var(--color-planet-saturn)',
    description: 'Famous for its spectacular ring system'
  },
  {
    name: 'Uranus',
    type: 'ice-giant',
    radius: 25362,
    mass: 8.681e25,
    orbitalRadius: 19.19,
    orbitalPeriod: 30687,
    color: 'var(--color-planet-uranus)',
    description: 'Ice giant tilted on its side'
  },
  {
    name: 'Neptune',
    type: 'ice-giant',
    radius: 24622,
    mass: 1.024e26,
    orbitalRadius: 30.07,
    orbitalPeriod: 60190,
    color: 'var(--color-planet-neptune)',
    description: 'Farthest planet with supersonic winds'
  }
];

export default function SolarSystem({
  name = 'Solar System',
  description = 'Our home planetary system',
  autoPlay = true,
  timeScale = 1
}: SolarSystemProps) {
  const [time, setTime] = useState(0);
  const [isPaused, setIsPaused] = useState(!autoPlay);
  const [selectedPlanet, setSelectedPlanet] = useState<string | null>(null);
  const [speed, setSpeed] = useState(timeScale);

  // Calculate logarithmic scale for better visibility
  const scale = useMemo(() => {
    const maxRadius = Math.max(...SOLAR_SYSTEM_DATA.map(p => p.orbitalRadius));
    const viewportRadius = 400; // pixels
    // Use logarithmic scale so inner planets are visible
    return viewportRadius / Math.log10(maxRadius + 1);
  }, []);

  // Calculate planet positions
  const planetPositions = useMemo(() => {
    return SOLAR_SYSTEM_DATA.map(planet => {
      // Calculate angle based on time and orbital period
      const angle = (time / planet.orbitalPeriod) * 2 * Math.PI;
      
      // Use logarithmic scale for radius
      const scaledRadius = Math.log10(planet.orbitalRadius + 1) * scale;
      
      // Calculate x, y position
      const x = Math.cos(angle) * scaledRadius;
      const y = Math.sin(angle) * scaledRadius;
      
      // Calculate planet size (logarithmic scale for visibility)
      const size = Math.max(4, Math.log10(planet.radius / 1000 + 1) * 3);
      
      return {
        ...planet,
        x,
        y,
        size,
        scaledRadius
      };
    });
  }, [time, scale]);

  // Animation loop
  useEffect(() => {
    if (isPaused) return;

    let animationId: number;
    let lastTime = Date.now();

    const animate = () => {
      const now = Date.now();
      const deltaTime = (now - lastTime) / 1000; // seconds
      lastTime = now;

      // Update time (1 second = 1 day in simulation)
      setTime(prevTime => prevTime + deltaTime * speed);

      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationId);
  }, [isPaused, speed]);

  const handlePlanetClick = (planetName: string) => {
    setSelectedPlanet(planetName === selectedPlanet ? null : planetName);
  };

  const selectedPlanetData = selectedPlanet 
    ? planetPositions.find(p => p.name === selectedPlanet)
    : null;

  return (
    <div className="w-full p-6 bg-gradient-to-br from-[var(--color-bg-dark)] via-[var(--color-bg-card)] to-[var(--color-bg-dark)] border-4 border-[var(--color-primary)] rounded-lg pixel-border relative overflow-hidden">
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-2xl font-pixel text-[var(--color-accent)] glow-text uppercase tracking-wider">
          {name}
        </h2>
        {description && (
          <p className="text-sm font-pixel text-gray-400 mt-1">{description}</p>
        )}
      </div>

      {/* Solar System Visualization */}
      <div className="relative bg-[var(--color-bg-dark)] rounded-lg border-2 border-[var(--color-primary)]/30 overflow-hidden" style={{ height: '600px' }}>
        <svg
          viewBox="-500 -500 1000 1000"
          className="w-full h-full"
          style={{ imageRendering: 'pixelated' }}
        >
          {/* Starfield background */}
          <defs>
            <radialGradient id="sunGlow">
              <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="1" />
              <stop offset="50%" stopColor="var(--color-accent)" stopOpacity="0.5" />
              <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Background stars */}
          {[...Array(50)].map((_, i) => {
            const x = (Math.random() - 0.5) * 1000;
            const y = (Math.random() - 0.5) * 1000;
            const size = Math.random() * 2 + 0.5;
            return (
              <circle
                key={`star-${i}`}
                cx={x}
                cy={y}
                r={size}
                fill="white"
                opacity={Math.random() * 0.5 + 0.3}
              />
            );
          })}

          {/* Orbit rings */}
          {planetPositions.map(planet => (
            <circle
              key={`orbit-${planet.name}`}
              cx="0"
              cy="0"
              r={planet.scaledRadius}
              fill="none"
              stroke={selectedPlanet === planet.name ? 'var(--color-secondary)' : 'var(--color-primary)'}
              strokeWidth={selectedPlanet === planet.name ? 2 : 1}
              strokeDasharray="5,5"
              opacity={selectedPlanet === planet.name ? 0.8 : 0.3}
            />
          ))}

          {/* Sun */}
          <circle
            cx="0"
            cy="0"
            r="20"
            fill="url(#sunGlow)"
          />
          <circle
            cx="0"
            cy="0"
            r="15"
            fill="var(--color-accent)"
          />

          {/* Planets */}
          {planetPositions.map(planet => (
            <g key={planet.name}>
              {/* Planet glow */}
              <circle
                cx={planet.x}
                cy={planet.y}
                r={planet.size + 3}
                fill={planet.color}
                opacity="0.3"
                className="pointer-events-none"
              />
              
              {/* Planet body */}
              <circle
                cx={planet.x}
                cy={planet.y}
                r={planet.size}
                fill={planet.color}
                stroke={selectedPlanet === planet.name ? 'var(--color-secondary)' : 'none'}
                strokeWidth="2"
                className="cursor-pointer transition-all duration-200 hover:opacity-80"
                onClick={() => handlePlanetClick(planet.name)}
                style={{
                  filter: selectedPlanet === planet.name 
                    ? `drop-shadow(0 0 10px ${planet.color})` 
                    : `drop-shadow(0 0 3px ${planet.color})`
                }}
              />

              {/* Planet label */}
              <text
                x={planet.x}
                y={planet.y - planet.size - 8}
                textAnchor="middle"
                className="font-pixel text-xs fill-white pointer-events-none"
                style={{ fontSize: '10px' }}
              >
                {planet.name}
              </text>
            </g>
          ))}
        </svg>

        {/* Info overlay for selected planet */}
        {selectedPlanetData && (
          <div className="absolute top-4 right-4 w-64 bg-[var(--color-bg-card)] border-2 border-[var(--color-secondary)] rounded-lg pixel-border p-4 space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-pixel text-[var(--color-accent)]">
                {selectedPlanetData.name}
              </h3>
              <button
                onClick={() => setSelectedPlanet(null)}
                className="text-gray-400 hover:text-white font-pixel text-sm"
              >
                ✕
              </button>
            </div>
            
            <p className="text-xs font-pixel text-gray-300">
              {selectedPlanetData.description}
            </p>

            <div className="space-y-1 text-xs font-pixel">
              <div className="flex justify-between">
                <span className="text-[var(--color-primary)]">Type:</span>
                <span className="text-white capitalize">{selectedPlanetData.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-primary)]">Radius:</span>
                <span className="text-white">{selectedPlanetData.radius.toLocaleString()} km</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-primary)]">Distance:</span>
                <span className="text-white">{selectedPlanetData.orbitalRadius} AU</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-primary)]">Orbit Period:</span>
                <span className="text-white">{selectedPlanetData.orbitalPeriod.toLocaleString()} days</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="mt-4 flex items-center justify-center gap-4 p-3 bg-[var(--color-bg-card)] border-2 border-[var(--color-primary)]/30 rounded-lg pixel-border">
        {/* Play/Pause */}
        <button
          onClick={() => setIsPaused(!isPaused)}
          className="px-4 py-2 bg-[var(--color-primary)] hover:bg-[var(--color-secondary)] text-white font-pixel text-sm rounded pixel-border transition-colors"
        >
          {isPaused ? '▶ Play' : '⏸ Pause'}
        </button>

        {/* Speed control */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-pixel text-gray-400">Speed:</span>
          <select
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            className="px-2 py-1 bg-[var(--color-bg-dark)] border border-[var(--color-primary)] text-white font-pixel text-xs rounded"
          >
            <option value="1">1x</option>
            <option value="10">10x</option>
            <option value="100">100x</option>
            <option value="1000">1000x</option>
          </select>
        </div>

        {/* Time display */}
        <div className="text-xs font-pixel text-gray-400">
          Day: {Math.floor(time)}
        </div>

        {/* Reset */}
        <button
          onClick={() => {
            setTime(0);
            setSelectedPlanet(null);
          }}
          className="px-3 py-1 bg-[var(--color-purple)] hover:bg-[var(--color-purple)]/80 text-white font-pixel text-xs rounded pixel-border transition-colors"
        >
          ↺ Reset
        </button>
      </div>

      {/* Legend */}
      <div className="mt-3 text-xs font-pixel text-gray-500 text-center">
        Click any planet to view details • Distances use logarithmic scale for visibility
      </div>
    </div>
  );
}

// Made with Bob