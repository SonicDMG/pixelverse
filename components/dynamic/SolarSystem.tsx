'use client';

import React, { useState, useEffect, useMemo } from 'react';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface CelestialBody {
  name: string;
  type: 'planet' | 'moon' | 'star' | 'dwarf-planet' | 'asteroid' | 'comet';
  radius: number;
  mass: number;
  orbitalRadius: number;
  orbitalPeriod: number;
  color: string;
  description: string;
  satellites?: CelestialBody[];
}

interface CentralBody {
  name: string;
  type: 'star' | 'planet' | 'black-hole' | 'galaxy-core';
  radius: number;
  color: string;
  glowColor?: string;
  description?: string;
}

interface UnitSystem {
  distance: { unit: string; label: string; };
  time: { unit: string; label: string; };
  mass: { unit: string; label: string; };
  radius: { unit: string; label: string; };
}

interface ScalingConfig {
  type: 'linear' | 'logarithmic';
  distanceScale?: number;
  sizeScale?: number;
}

interface OrbitalSystemProps {
  // Custom configuration
  bodies?: CelestialBody[];
  centralBody?: CentralBody;
  units?: Partial<UnitSystem>;
  scaling?: Partial<ScalingConfig>;
  preset?: 'solar-system' | 'moon-system' | 'galaxy' | 'custom';
  
  // Display options
  name?: string;
  description?: string;
  autoPlay?: boolean;
  timeScale?: number;
  
  // Interaction callbacks
  onBodyClick?: (body: CelestialBody) => void;
}

// ============================================================================
// PRESET CONFIGURATIONS
// ============================================================================

const DEFAULT_UNITS: UnitSystem = {
  distance: { unit: 'AU', label: 'Astronomical Units' },
  time: { unit: 'days', label: 'Earth Days' },
  mass: { unit: 'kg', label: 'Kilograms' },
  radius: { unit: 'km', label: 'Kilometers' }
};

const PRESETS = {
  'solar-system': {
    name: 'Solar System',
    description: 'Our home planetary system',
    centralBody: {
      name: 'Sun',
      type: 'star' as const,
      radius: 696000,
      color: 'var(--color-accent)',
      glowColor: 'var(--color-accent)',
      description: 'Our star, the center of the Solar System'
    },
    bodies: [
      {
        name: 'Mercury',
        type: 'planet' as const,
        radius: 2439.7,
        mass: 3.285e23,
        orbitalRadius: 0.39,
        orbitalPeriod: 88,
        color: 'var(--color-planet-mercury)',
        description: 'Smallest planet, closest to the Sun'
      },
      {
        name: 'Venus',
        type: 'planet' as const,
        radius: 6051.8,
        mass: 4.867e24,
        orbitalRadius: 0.72,
        orbitalPeriod: 225,
        color: 'var(--color-planet-venus)',
        description: 'Hottest planet with thick atmosphere'
      },
      {
        name: 'Earth',
        type: 'planet' as const,
        radius: 6371,
        mass: 5.972e24,
        orbitalRadius: 1.0,
        orbitalPeriod: 365.25,
        color: 'var(--color-planet-earth)',
        description: 'Our home planet with liquid water'
      },
      {
        name: 'Mars',
        type: 'planet' as const,
        radius: 3389.5,
        mass: 6.39e23,
        orbitalRadius: 1.52,
        orbitalPeriod: 687,
        color: 'var(--color-planet-mars)',
        description: 'The Red Planet with polar ice caps'
      },
      {
        name: 'Jupiter',
        type: 'planet' as const,
        radius: 69911,
        mass: 1.898e27,
        orbitalRadius: 5.20,
        orbitalPeriod: 4333,
        color: 'var(--color-planet-jupiter)',
        description: 'Largest planet with Great Red Spot'
      },
      {
        name: 'Saturn',
        type: 'planet' as const,
        radius: 58232,
        mass: 5.683e26,
        orbitalRadius: 9.54,
        orbitalPeriod: 10759,
        color: 'var(--color-planet-saturn)',
        description: 'Famous for its spectacular ring system'
      },
      {
        name: 'Uranus',
        type: 'planet' as const,
        radius: 25362,
        mass: 8.681e25,
        orbitalRadius: 19.19,
        orbitalPeriod: 30687,
        color: 'var(--color-planet-uranus)',
        description: 'Ice giant tilted on its side'
      },
      {
        name: 'Neptune',
        type: 'planet' as const,
        radius: 24622,
        mass: 1.024e26,
        orbitalRadius: 30.07,
        orbitalPeriod: 60190,
        color: 'var(--color-planet-neptune)',
        description: 'Farthest planet with supersonic winds'
      }
    ],
    units: DEFAULT_UNITS,
    scaling: {
      type: 'logarithmic' as const,
      distanceScale: 1,
      sizeScale: 1
    }
  },
  
  'moon-system': {
    name: 'Galilean Moons',
    description: "Jupiter's four largest moons",
    centralBody: {
      name: 'Jupiter',
      type: 'planet' as const,
      radius: 69911,
      color: 'var(--color-planet-jupiter)',
      glowColor: '#FFA500',
      description: 'Largest planet in our Solar System'
    },
    bodies: [
      {
        name: 'Io',
        type: 'moon' as const,
        radius: 1821.6,
        mass: 8.93e22,
        orbitalRadius: 421700,
        orbitalPeriod: 1.77,
        color: '#FFD700',
        description: 'Most volcanically active body in the Solar System'
      },
      {
        name: 'Europa',
        type: 'moon' as const,
        radius: 1560.8,
        mass: 4.80e22,
        orbitalRadius: 671034,
        orbitalPeriod: 3.55,
        color: '#E8E8E8',
        description: 'Icy moon with subsurface ocean'
      },
      {
        name: 'Ganymede',
        type: 'moon' as const,
        radius: 2634.1,
        mass: 1.48e23,
        orbitalRadius: 1070412,
        orbitalPeriod: 7.15,
        color: '#A0A0A0',
        description: 'Largest moon in the Solar System'
      },
      {
        name: 'Callisto',
        type: 'moon' as const,
        radius: 2410.3,
        mass: 1.08e23,
        orbitalRadius: 1882709,
        orbitalPeriod: 16.69,
        color: '#8B7355',
        description: 'Ancient, heavily cratered surface'
      }
    ],
    units: {
      distance: { unit: 'km', label: 'Kilometers' },
      time: { unit: 'days', label: 'Earth Days' },
      mass: { unit: 'kg', label: 'Kilograms' },
      radius: { unit: 'km', label: 'Kilometers' }
    },
    scaling: {
      type: 'logarithmic' as const,
      distanceScale: 1,
      sizeScale: 1
    }
  },
  
  'galaxy': {
    name: 'Milky Way Structure',
    description: 'Simplified galactic structure',
    centralBody: {
      name: 'Sagittarius A*',
      type: 'black-hole' as const,
      radius: 12000000,
      color: '#000000',
      glowColor: '#FF00FF',
      description: 'Supermassive black hole at galactic center'
    },
    bodies: [
      {
        name: 'Nuclear Bulge',
        type: 'star' as const,
        radius: 1000,
        mass: 2e41,
        orbitalRadius: 3000,
        orbitalPeriod: 225,
        color: '#FFD700',
        description: 'Dense stellar region around galactic center'
      },
      {
        name: 'Inner Disk',
        type: 'star' as const,
        radius: 800,
        mass: 1.5e41,
        orbitalRadius: 10000,
        orbitalPeriod: 450,
        color: '#FFA500',
        description: 'Inner spiral arm region'
      },
      {
        name: 'Solar Neighborhood',
        type: 'star' as const,
        radius: 600,
        mass: 1e41,
        orbitalRadius: 26000,
        orbitalPeriod: 225000000,
        color: '#FFFF00',
        description: 'Our location in the galaxy'
      },
      {
        name: 'Outer Disk',
        type: 'star' as const,
        radius: 500,
        mass: 8e40,
        orbitalRadius: 50000,
        orbitalPeriod: 450000000,
        color: '#FF6347',
        description: 'Outer spiral arm region'
      }
    ],
    units: {
      distance: { unit: 'ly', label: 'Light Years' },
      time: { unit: 'million years', label: 'Million Years' },
      mass: { unit: 'kg', label: 'Kilograms' },
      radius: { unit: 'ly', label: 'Light Years' }
    },
    scaling: {
      type: 'logarithmic' as const,
      distanceScale: 1,
      sizeScale: 1
    }
  }
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function SolarSystem({
  bodies: customBodies,
  centralBody: customCentralBody,
  units: customUnits,
  scaling: customScaling,
  preset = 'solar-system',
  name: customName,
  description: customDescription,
  autoPlay = true,
  timeScale = 1,
  onBodyClick
}: OrbitalSystemProps) {
  // Resolve configuration from preset or custom
  const config = useMemo(() => {
    const presetConfig = preset !== 'custom' ? PRESETS[preset] : null;
    
    // Validate custom configuration when using custom preset
    if (preset === 'custom') {
      // Log validation info for debugging
      console.log('[SolarSystem] Custom preset detected', {
        hasBodies: !!customBodies,
        bodiesLength: customBodies?.length,
        bodiesData: customBodies,
        hasCentralBody: !!customCentralBody,
        centralBodyData: customCentralBody,
        customName,
        customUnits,
        customScaling
      });
      
      // Validate required fields for custom preset
      if (!customBodies || customBodies.length === 0) {
        console.error('[SolarSystem] Custom preset requires bodies array with at least one body. Component will render with empty system.');
      } else {
        // Validate each body has required fields
        customBodies.forEach((body, index) => {
          const requiredFields = ['name', 'type', 'radius', 'mass', 'orbitalRadius', 'orbitalPeriod', 'color', 'description'];
          const missingFields = requiredFields.filter(field => !(field in body));
          if (missingFields.length > 0) {
            console.warn(`[SolarSystem] Body at index ${index} (${body.name || 'unnamed'}) is missing fields:`, missingFields);
          }
        });
      }
      
      if (!customCentralBody) {
        console.warn('[SolarSystem] Custom preset missing centralBody, using default Sun');
      } else {
        // Validate central body has required fields
        const requiredFields = ['name', 'type', 'radius', 'color'];
        const missingFields = requiredFields.filter(field => !(field in customCentralBody));
        if (missingFields.length > 0) {
          console.warn('[SolarSystem] Central body is missing fields:', missingFields);
        }
      }
    }
    
    return {
      name: customName || presetConfig?.name || 'Orbital System',
      description: customDescription || presetConfig?.description || '',
      bodies: customBodies || presetConfig?.bodies || [],
      centralBody: customCentralBody || presetConfig?.centralBody || {
        name: 'Center',
        type: 'star' as const,
        radius: 696000,
        color: 'var(--color-accent)',
        glowColor: 'var(--color-accent)'
      },
      units: { ...DEFAULT_UNITS, ...presetConfig?.units, ...customUnits },
      scaling: {
        type: 'logarithmic' as const,
        distanceScale: 1,
        sizeScale: 1,
        ...presetConfig?.scaling,
        ...customScaling
      }
    };
  }, [preset, customBodies, customCentralBody, customUnits, customScaling, customName, customDescription]);

  const [time, setTime] = useState(0);
  const [isPaused, setIsPaused] = useState(!autoPlay);
  const [selectedBody, setSelectedBody] = useState<string | null>(null);
  const [speed, setSpeed] = useState(timeScale);
  const [zoom, setZoom] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [isZoomLocked, setIsZoomLocked] = useState(true); // Default to LOCKED for safety

  // Calculate scale based on scaling type
  const scale = useMemo(() => {
    const maxRadius = Math.max(...config.bodies.map(b => b.orbitalRadius));
    const viewportRadius = 400; // pixels
    const baseScale = config.scaling.distanceScale || 1;
    
    if (config.scaling.type === 'logarithmic') {
      return (viewportRadius / Math.log10(maxRadius + 1)) * baseScale;
    } else {
      return (viewportRadius / maxRadius) * baseScale;
    }
  }, [config.bodies, config.scaling]);

  // Calculate body positions
  const bodyPositions = useMemo(() => {
    return config.bodies.map(body => {
      // Calculate angle based on time and orbital period
      const angle = (time / body.orbitalPeriod) * 2 * Math.PI;
      
      // Apply scaling based on type
      let scaledRadius: number;
      if (config.scaling.type === 'logarithmic') {
        scaledRadius = Math.log10(body.orbitalRadius + 1) * scale;
      } else {
        scaledRadius = body.orbitalRadius * scale;
      }
      
      // Calculate x, y position
      const x = Math.cos(angle) * scaledRadius;
      const y = Math.sin(angle) * scaledRadius;
      
      // Calculate body size with scaling
      const sizeScale = config.scaling.sizeScale || 1;
      let size: number;
      if (config.scaling.type === 'logarithmic') {
        size = Math.max(4, Math.log10(body.radius / 1000 + 1) * 3 * sizeScale);
      } else {
        size = Math.max(4, (body.radius / 10000) * sizeScale);
      }
      
      return {
        ...body,
        x,
        y,
        size,
        scaledRadius
      };
    });
  }, [time, scale, config.bodies, config.scaling]);

  // Animation loop
  useEffect(() => {
    if (isPaused) return;

    let animationId: number;
    let lastTime = Date.now();

    const animate = () => {
      const now = Date.now();
      const deltaTime = (now - lastTime) / 1000; // seconds
      lastTime = now;

      // Update time
      setTime(prevTime => prevTime + deltaTime * speed);

      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationId);
  }, [isPaused, speed]);

  // Zoom constants
  const MIN_ZOOM = 0.5;
  const MAX_ZOOM = 10;
  const ZOOM_STEP = 0.5;

  // Zoom handlers
  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + ZOOM_STEP, MAX_ZOOM));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - ZOOM_STEP, MIN_ZOOM));
  };

  const handleZoomReset = () => {
    setZoom(1);
    setPanOffset({ x: 0, y: 0 });
  };

  // Mouse wheel zoom handler - only when hovering over SVG AND zoom is unlocked
  const handleWheel = (e: React.WheelEvent<SVGSVGElement>) => {
    if (isHovering && !isZoomLocked) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
      setZoom(prev => Math.max(MIN_ZOOM, Math.min(prev + delta, MAX_ZOOM)));
    }
  };

  // Toggle zoom lock
  const handleToggleZoomLock = () => {
    setIsZoomLocked(prev => !prev);
  };

  // Pan handlers
  const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    if (e.button === 0) { // Left mouse button
      setIsPanning(true);
      setPanStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (isPanning) {
      const newX = e.clientX - panStart.x;
      const newY = e.clientY - panStart.y;
      setPanOffset({ x: newX, y: newY });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  const handleMouseEnter = () => {
    setIsHovering(true);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    setIsPanning(false);
  };

  const handleBodyClick = (bodyName: string) => {
    setSelectedBody(bodyName === selectedBody ? null : bodyName);
    
    // Trigger callback if provided
    if (onBodyClick) {
      const clickedBody = config.bodies.find(b => b.name === bodyName);
      if (clickedBody) {
        onBodyClick(clickedBody);
      }
    }
  };

  const selectedBodyData = selectedBody 
    ? bodyPositions.find(b => b.name === selectedBody)
    : null;

  // Calculate central body size
  const centralBodySize = useMemo(() => {
    const sizeScale = config.scaling.sizeScale || 1;
    if (config.scaling.type === 'logarithmic') {
      return Math.max(15, Math.log10(config.centralBody.radius / 1000 + 1) * 5 * sizeScale);
    } else {
      return Math.max(15, (config.centralBody.radius / 50000) * sizeScale);
    }
  }, [config.centralBody.radius, config.scaling]);

  // Calculate viewBox based on zoom
  const viewBox = useMemo(() => {
    const baseSize = 1000;
    const size = baseSize / zoom;
    const halfSize = size / 2;
    return `${-halfSize + panOffset.x} ${-halfSize + panOffset.y} ${size} ${size}`;
  }, [zoom, panOffset]);

  return (
    <div className="w-full p-6 bg-gradient-to-br from-[var(--color-bg-dark)] via-[var(--color-bg-card)] to-[var(--color-bg-dark)] border-4 border-[var(--color-primary)] rounded-lg pixel-border relative overflow-hidden">
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-pixel text-[var(--color-accent)] glow-text uppercase tracking-wider">
            {config.name}
          </h2>
          {preset === 'custom' && (
            <span className="px-2 py-1 text-xs font-pixel bg-[var(--color-purple)]/30 border border-[var(--color-purple)] rounded text-[var(--color-purple)]">
              CUSTOM
            </span>
          )}
        </div>
        {config.description && (
          <p className="text-sm font-pixel text-gray-400 mt-1">{config.description}</p>
        )}
        {preset === 'custom' && config.bodies.length === 0 && (
          <div className="mt-2 p-2 bg-[var(--color-error)]/20 border border-[var(--color-error)] rounded">
            <p className="text-xs font-pixel text-[var(--color-error)]">
              ⚠️ No bodies configured. Check console for validation errors.
            </p>
          </div>
        )}
      </div>

      {/* Orbital System Visualization */}
      <div className="relative bg-[var(--color-bg-dark)] rounded-lg border-2 border-[var(--color-primary)]/30 overflow-hidden" style={{ height: '600px' }}>
        {/* Zoom Controls */}
        <div className="absolute top-4 left-4 z-10 flex flex-col gap-2 bg-[var(--color-bg-card)]/90 border-2 border-[var(--color-primary)] rounded-lg pixel-border p-2">
          <button
            onClick={handleToggleZoomLock}
            className={`w-10 h-10 ${isZoomLocked ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'} text-white font-pixel text-lg rounded pixel-border transition-colors flex items-center justify-center`}
            title={isZoomLocked ? "Unlock Zoom (Mouse Wheel Disabled)" : "Lock Zoom (Mouse Wheel Enabled)"}
          >
            {isZoomLocked ? '🔒' : '🔓'}
          </button>
          <button
            onClick={handleZoomIn}
            disabled={zoom >= MAX_ZOOM}
            className="w-10 h-10 bg-[var(--color-primary)] hover:bg-[var(--color-secondary)] disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-pixel text-lg rounded pixel-border transition-colors flex items-center justify-center"
            title="Zoom In"
          >
            +
          </button>
          <div className="text-center text-xs font-pixel text-[var(--color-accent)] py-1">
            {zoom.toFixed(1)}x
          </div>
          <button
            onClick={handleZoomOut}
            disabled={zoom <= MIN_ZOOM}
            className="w-10 h-10 bg-[var(--color-primary)] hover:bg-[var(--color-secondary)] disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-pixel text-lg rounded pixel-border transition-colors flex items-center justify-center"
            title="Zoom Out"
          >
            −
          </button>
          <button
            onClick={handleZoomReset}
            className="w-10 h-10 bg-[var(--color-purple)] hover:bg-[var(--color-purple)]/80 text-white font-pixel text-xs rounded pixel-border transition-colors flex items-center justify-center"
            title="Reset Zoom"
          >
            ↺
          </button>
        </div>

        <svg
          viewBox={viewBox}
          className="w-full h-full"
          style={{
            imageRendering: 'pixelated',
            cursor: isPanning ? 'grabbing' : (isHovering ? 'grab' : 'default')
          }}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {/* Starfield background */}
          <defs>
            <radialGradient id="centralGlow">
              <stop offset="0%" stopColor={config.centralBody.glowColor || config.centralBody.color} stopOpacity="1" />
              <stop offset="50%" stopColor={config.centralBody.glowColor || config.centralBody.color} stopOpacity="0.5" />
              <stop offset="100%" stopColor={config.centralBody.glowColor || config.centralBody.color} stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Background stars - using deterministic positions to avoid hydration mismatch */}
          {[...Array(50)].map((_, i) => {
            // Use index-based seed for deterministic "random" values
            const seed = i * 2654435761; // Large prime for better distribution
            const x = ((seed % 1000) - 500);
            const y = (((seed * 7) % 1000) - 500);
            const size = ((seed % 15) / 10) + 0.5;
            const opacity = ((seed % 5) / 10) + 0.3;
            return (
              <circle
                key={`star-${i}`}
                cx={x}
                cy={y}
                r={size}
                fill="white"
                opacity={opacity}
              />
            );
          })}

          {/* Orbit rings */}
          {bodyPositions.map(body => (
            <circle
              key={`orbit-${body.name}`}
              cx="0"
              cy="0"
              r={body.scaledRadius}
              fill="none"
              stroke={selectedBody === body.name ? 'var(--color-secondary)' : 'var(--color-primary)'}
              strokeWidth={selectedBody === body.name ? 2 : 1}
              strokeDasharray="5,5"
              opacity={selectedBody === body.name ? 0.8 : 0.3}
            />
          ))}

          {/* Central Body */}
          {config.centralBody.glowColor && (
            <circle
              cx="0"
              cy="0"
              r={centralBodySize + 5}
              fill="url(#centralGlow)"
            />
          )}
          <circle
            cx="0"
            cy="0"
            r={centralBodySize}
            fill={config.centralBody.color}
            stroke={config.centralBody.type === 'black-hole' ? config.centralBody.glowColor : 'none'}
            strokeWidth="2"
          />

          {/* Orbiting Bodies */}
          {bodyPositions.map(body => (
            <g key={body.name}>
              {/* Body glow */}
              <circle
                cx={body.x}
                cy={body.y}
                r={body.size + 3}
                fill={body.color}
                opacity="0.3"
                className="pointer-events-none"
              />
              
              {/* Body */}
              <circle
                cx={body.x}
                cy={body.y}
                r={body.size}
                fill={body.color}
                stroke={selectedBody === body.name ? 'var(--color-secondary)' : 'none'}
                strokeWidth="2"
                className="cursor-pointer transition-all duration-200 hover:opacity-80"
                onClick={() => handleBodyClick(body.name)}
                style={{
                  filter: selectedBody === body.name 
                    ? `drop-shadow(0 0 10px ${body.color})` 
                    : `drop-shadow(0 0 3px ${body.color})`
                }}
              />

              {/* Body label */}
              <text
                x={body.x}
                y={body.y - body.size - 8}
                textAnchor="middle"
                className="font-pixel text-xs fill-white pointer-events-none"
                style={{ fontSize: '10px' }}
              >
                {body.name}
              </text>
            </g>
          ))}
        </svg>

        {/* Info overlay for selected body */}
        {selectedBodyData && (
          <div className="absolute top-4 right-4 w-64 bg-[var(--color-bg-card)] border-2 border-[var(--color-secondary)] rounded-lg pixel-border p-4 space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-pixel text-[var(--color-accent)]">
                {selectedBodyData.name}
              </h3>
              <button
                onClick={() => setSelectedBody(null)}
                className="text-gray-400 hover:text-white font-pixel text-sm"
              >
                ✕
              </button>
            </div>
            
            <p className="text-xs font-pixel text-gray-300">
              {selectedBodyData.description}
            </p>

            <div className="space-y-1 text-xs font-pixel">
              <div className="flex justify-between">
                <span className="text-[var(--color-primary)]">Type:</span>
                <span className="text-white capitalize">{selectedBodyData.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-primary)]">Radius:</span>
                <span className="text-white">{selectedBodyData.radius.toLocaleString()} {config.units.radius.unit}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-primary)]">Distance:</span>
                <span className="text-white">{selectedBodyData.orbitalRadius.toLocaleString()} {config.units.distance.unit}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-primary)]">Orbit Period:</span>
                <span className="text-white">{selectedBodyData.orbitalPeriod.toLocaleString()} {config.units.time.unit}</span>
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
          {config.units.time.unit === 'days' ? `Day: ${Math.floor(time)}` : `Time: ${Math.floor(time)}`}
        </div>

        {/* Reset */}
        <button
          onClick={() => {
            setTime(0);
            setSelectedBody(null);
          }}
          className="px-3 py-1 bg-[var(--color-purple)] hover:bg-[var(--color-purple)]/80 text-white font-pixel text-xs rounded pixel-border transition-colors"
        >
          ↺ Reset
        </button>
      </div>

      {/* Legend */}
      <div className="mt-3 text-xs font-pixel text-gray-500 text-center">
        Click any body to view details • Click 🔒 to unlock mouse wheel zoom • Drag to pan • Use +/− buttons to zoom • Distances use {config.scaling.type} scale for visibility
      </div>
    </div>
  );
}

// Made with Bob