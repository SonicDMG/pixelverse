'use client';

import { useState, useEffect, useRef } from 'react';
import { CelestialBodyCardSpec } from '@/types/ui-spec';

/**
 * Props for the CelestialBodyCard component
 * Supports planets, moons, stars, and galaxies
 */
type CelestialBodyCardProps = CelestialBodyCardSpec['props'];

/**
 * Response interface from the image generation API
 */
interface GenerateImageResponse {
  success: boolean;
  imageUrl?: string;
  error?: string;
  seed?: number;
}

/**
 * Visual theme configuration for different celestial body types
 */
const BODY_THEMES = {
  planet: {
    icon: '🪐',
    colors: {
      primary: 'var(--color-body-planet-primary)',
      secondary: 'var(--color-body-planet-secondary)',
      accent: 'var(--color-body-planet-accent)',
    },
    glow: 'shadow-[0_0_20px_rgba(147,112,219,0.5)]',
  },
  moon: {
    icon: '🌙',
    colors: {
      primary: 'var(--color-body-moon-primary)',
      secondary: 'var(--color-body-moon-secondary)',
      accent: 'var(--color-body-moon-accent)',
    },
    glow: 'shadow-[0_0_20px_rgba(192,192,192,0.5)]',
  },
  star: {
    icon: '⭐',
    colors: {
      primary: 'var(--color-body-star-primary)',
      secondary: 'var(--color-body-star-secondary)',
      accent: 'var(--color-body-star-accent)',
    },
    glow: 'shadow-[0_0_30px_rgba(255,215,0,0.7)]',
  },
  galaxy: {
    icon: '🌌',
    colors: {
      primary: 'var(--color-body-galaxy-primary)',
      secondary: 'var(--color-body-galaxy-secondary)',
      accent: 'var(--color-body-galaxy-accent)',
    },
    glow: 'shadow-[0_0_25px_rgba(139,0,255,0.6)]',
  },
  'black-hole': {
    icon: '⚫',
    colors: {
      primary: 'var(--color-body-blackhole-primary)',
      secondary: 'var(--color-body-blackhole-secondary)',
      accent: 'var(--color-body-blackhole-accent)',
    },
    glow: 'shadow-[0_0_35px_rgba(255,69,0,0.8)]',
  },
  nebula: {
    icon: '☁️',
    colors: {
      primary: 'var(--color-body-nebula-primary)',
      secondary: 'var(--color-body-nebula-secondary)',
      accent: 'var(--color-body-nebula-accent)',
    },
    glow: 'shadow-[0_0_30px_rgba(255,20,147,0.6)]',
  },
};

/**
 * Property configuration for different celestial body types
 * Determines which properties to display
 */
const PROPERTY_CONFIG = {
  planet: ['diameter', 'mass', 'distanceFrom', 'orbitalPeriod', 'satellites'],
  moon: ['diameter', 'mass', 'distanceFrom', 'orbitalPeriod', 'parentBody'],
  star: ['diameter', 'mass', 'spectralClass', 'temperature', 'luminosity', 'satellites'],
  galaxy: ['galaxyType', 'diameter', 'starCount', 'distanceFromEarth'],
  'black-hole': ['blackHoleType', 'mass', 'eventHorizonRadius', 'distanceFromEarth'],
  nebula: ['nebulaType', 'diameter', 'distanceFromEarth'],
};

export default function CelestialBodyCard(props: CelestialBodyCardProps) {
  const {
    name,
    description,
    visualDescription,
    bodyType,
    diameter,
    mass,
    distanceFrom,
    distanceFromLabel,
    orbitalPeriod,
    parentBody,
    satellites,
    satelliteLabel,
    spectralClass,
    luminosity,
    temperature,
    galaxyType,
    starCount,
    distanceFromEarth,
    blackHoleType,
    eventHorizonRadius,
    nebulaType,
    imageUrl,
    planetType,
    starType,
    enableImageGeneration = true,
    generatedImageUrl,
  } = props;

  // State management for image generation
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [localGeneratedUrl, setLocalGeneratedUrl] = useState<string | null>(
    generatedImageUrl || null
  );
  
  // Track if generation has been initiated to prevent duplicate calls
  const generationInitiatedRef = useRef(false);

  // Get theme for current body type
  const theme = BODY_THEMES[bodyType];

  // Debug logging
  console.log('[CelestialBodyCard] Component mounted/updated:', {
    name,
    bodyType,
    enableImageGeneration,
    hasGeneratedImageUrl: !!generatedImageUrl,
    hasLocalGeneratedUrl: !!localGeneratedUrl,
    generationInitiated: generationInitiatedRef.current,
  });

  /**
   * Automatically generate image on component mount if enabled
   * Uses a ref to ensure generation only happens once per component instance
   */
  useEffect(() => {
    const shouldGenerate =
      enableImageGeneration &&
      !generatedImageUrl &&
      !localGeneratedUrl &&
      !generationInitiatedRef.current;
    
    if (shouldGenerate) {
      console.log('[CelestialBodyCard] Triggering image generation for:', name);
      generationInitiatedRef.current = true;
      generateImage();
    }
  }, [enableImageGeneration, generatedImageUrl, localGeneratedUrl, name]);

  /**
   * Generate a space image using the API endpoint
   */
  const generateImage = async () => {
    console.log('[CelestialBodyCard] === Starting Image Generation ===');
    console.log('[CelestialBodyCard] Body name:', name);
    console.log('[CelestialBodyCard] Body type:', bodyType);
    
    setIsGenerating(true);
    setGenerationError(null);

    try {
      // Use visualDescription if provided, otherwise build from available data
      let visualDesc = visualDescription || name;
      
      if (!visualDescription) {
        // Fallback: Add visual characteristics based on body type
        if (bodyType === 'planet') {
          visualDesc = `${name} planet`;
          if (planetType) visualDesc += `, ${planetType}`;
        } else if (bodyType === 'moon') {
          visualDesc = `${name} moon`;
          if (parentBody) visualDesc += ` of ${parentBody}`;
        } else if (bodyType === 'star') {
          visualDesc = `${name} star`;
          if (spectralClass) visualDesc += `, ${spectralClass} class`;
        } else if (bodyType === 'galaxy') {
          visualDesc = `${name}`;
          if (galaxyType) visualDesc += `, ${galaxyType} galaxy`;
        } else if (bodyType === 'black-hole') {
          visualDesc = `${name} black hole`;
          if (blackHoleType) visualDesc += `, ${blackHoleType}`;
        } else if (bodyType === 'nebula') {
          visualDesc = `${name} nebula`;
          if (nebulaType) visualDesc += `, ${nebulaType}`;
        }
      }
      
      const requestBody = {
        objectType: bodyType === 'planet' ? 'planet' : 'celestial',
        name: name,
        description: visualDesc,
        planetType: bodyType === 'planet' ? (planetType || 'terrestrial') : undefined,
        celestialType: bodyType !== 'planet' ? bodyType : undefined,
        style: 'pixel-art',
      };
      
      console.log('[CelestialBodyCard] API Request Body:', JSON.stringify(requestBody, null, 2));
      
      const response = await fetch('/api/generate-space-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data: GenerateImageResponse = await response.json();
      console.log('[CelestialBodyCard] API Response Data:', JSON.stringify(data, null, 2));

      if (!response.ok || !data.success) {
        const errorMsg = data.error || 'Failed to generate image';
        throw new Error(errorMsg);
      }

      if (data.imageUrl) {
        console.log('[CelestialBodyCard] ✅ Image generated successfully!');
        setLocalGeneratedUrl(data.imageUrl);
      } else {
        throw new Error('No image URL returned from API');
      }
    } catch (error) {
      console.error('[CelestialBodyCard] ❌ Image generation failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate image';
      setGenerationError(errorMessage);
    } finally {
      setIsGenerating(false);
      console.log('[CelestialBodyCard] === Image Generation Complete ===');
    }
  };

  // Determine which image to display
  const displayImageUrl = localGeneratedUrl || imageUrl;
  const showImageSection = displayImageUrl || isGenerating;

  // Build properties to display based on body type
  const propertiesToShow = PROPERTY_CONFIG[bodyType];
  const properties: Array<{ label: string; value: string; highlight?: boolean }> = [];

  if (propertiesToShow.includes('diameter') && diameter) {
    properties.push({ label: 'Diameter', value: diameter });
  }
  if (propertiesToShow.includes('mass') && mass) {
    properties.push({ label: 'Mass', value: mass });
  }
  if (propertiesToShow.includes('distanceFrom') && distanceFrom) {
    properties.push({ 
      label: distanceFromLabel || 'Distance', 
      value: distanceFrom,
      highlight: true 
    });
  }
  if (propertiesToShow.includes('orbitalPeriod') && orbitalPeriod) {
    properties.push({ label: 'Orbital Period', value: orbitalPeriod, highlight: true });
  }
  if (propertiesToShow.includes('parentBody') && parentBody) {
    properties.push({ label: 'Orbits', value: parentBody, highlight: true });
  }
  if (propertiesToShow.includes('satellites') && satellites !== undefined) {
    properties.push({ 
      label: satelliteLabel || 'Satellites', 
      value: `${satellites}` 
    });
  }
  if (propertiesToShow.includes('spectralClass') && spectralClass) {
    properties.push({ label: 'Spectral Class', value: spectralClass });
  }
  if (propertiesToShow.includes('temperature') && temperature) {
    properties.push({ label: 'Temperature', value: temperature, highlight: true });
  }
  if (propertiesToShow.includes('luminosity') && luminosity) {
    properties.push({ label: 'Luminosity', value: luminosity, highlight: true });
  }
  if (propertiesToShow.includes('galaxyType') && galaxyType) {
    properties.push({ label: 'Galaxy Type', value: galaxyType });
  }
  if (propertiesToShow.includes('starCount') && starCount) {
    properties.push({ label: 'Star Count', value: starCount, highlight: true });
  }
  if (propertiesToShow.includes('distanceFromEarth') && distanceFromEarth) {
    properties.push({ label: 'Distance from Earth', value: distanceFromEarth, highlight: true });
  }
  if (propertiesToShow.includes('blackHoleType') && blackHoleType) {
    properties.push({ label: 'Black Hole Type', value: blackHoleType });
  }
  if (propertiesToShow.includes('eventHorizonRadius') && eventHorizonRadius) {
    properties.push({ label: 'Event Horizon', value: eventHorizonRadius, highlight: true });
  }
  if (propertiesToShow.includes('nebulaType') && nebulaType) {
    properties.push({ label: 'Nebula Type', value: nebulaType });
  }

  return (
    <div
      className={`w-full p-6 bg-gradient-to-br from-[var(--color-bg-dark)] to-[var(--color-bg-card)] border-4 rounded-lg pixel-border transition-all duration-300 glitch-hover scanline-container ${theme.glow}`}
      style={{ borderColor: theme.colors.primary }}
    >
      <div className="space-y-4">
        {/* Header with Name and Icon */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{theme.icon}</span>
            <h2 
              className="text-3xl font-pixel glow-text uppercase tracking-wider"
              style={{ color: theme.colors.primary }}
            >
              {name}
            </h2>
          </div>
          {satellites !== undefined && (
            <div 
              className="flex items-center gap-2 px-3 py-1 bg-opacity-20 border-2 rounded pixel-border"
              style={{ 
                backgroundColor: `${theme.colors.secondary}33`,
                borderColor: theme.colors.secondary 
              }}
            >
              <span style={{ color: theme.colors.accent }} className="text-xl">
                {bodyType === 'planet' ? '🌙' : bodyType === 'star' ? '🪐' : '⭐'}
              </span>
              <span className="font-pixel text-xs" style={{ color: theme.colors.accent }}>
                {satellites} {satelliteLabel || (satellites === 1 ? 'Satellite' : 'Satellites')}
              </span>
            </div>
          )}
        </div>

        {/* Image Section */}
        {showImageSection && (
          <div 
            className="relative w-full h-128 rounded border-2 overflow-hidden"
            style={{ borderColor: `${theme.colors.secondary}80` }}
          >
            {isGenerating ? (
              <div className="w-full h-full flex flex-col items-center justify-center bg-[var(--color-bg-dark)]/80">
                <div className="relative">
                  <div 
                    className="w-16 h-16 border-4 border-t-4 rounded-full animate-spin"
                    style={{ 
                      borderColor: `${theme.colors.secondary}4D`,
                      borderTopColor: theme.colors.accent 
                    }}
                  />
                  <div 
                    className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-4 rounded-full animate-spin" 
                    style={{ 
                      animationDirection: 'reverse', 
                      animationDuration: '1.5s',
                      borderRightColor: theme.colors.primary 
                    }} 
                  />
                </div>
                <p 
                  className="mt-4 font-pixel text-xs animate-pulse"
                  style={{ color: theme.colors.accent }}
                >
                  GENERATING IMAGE...
                </p>
                <div className="flex gap-1 mt-2">
                  <span 
                    className="w-2 h-2 rounded-full animate-bounce" 
                    style={{ backgroundColor: theme.colors.primary, animationDelay: '0ms' }} 
                  />
                  <span 
                    className="w-2 h-2 rounded-full animate-bounce" 
                    style={{ backgroundColor: theme.colors.secondary, animationDelay: '150ms' }} 
                  />
                  <span 
                    className="w-2 h-2 rounded-full animate-bounce" 
                    style={{ backgroundColor: theme.colors.accent, animationDelay: '300ms' }} 
                  />
                </div>
              </div>
            ) : displayImageUrl ? (
              <>
                <img
                  src={displayImageUrl}
                  alt={name}
                  className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg-dark)] to-transparent opacity-50" />
                {localGeneratedUrl && (
                  <div 
                    className="absolute top-2 right-2 px-2 py-1 border rounded pixel-border"
                    style={{ 
                      backgroundColor: `${theme.colors.primary}CC`,
                      borderColor: theme.colors.accent 
                    }}
                  >
                    <span className="font-pixel text-xs" style={{ color: theme.colors.accent }}>
                      AI ✨
                    </span>
                  </div>
                )}
              </>
            ) : null}
          </div>
        )}

        {/* Error message */}
        {generationError && (
          <div className="p-3 bg-red-900/20 border-2 border-red-500/50 rounded pixel-border">
            <div className="flex items-start gap-2">
              <span className="text-red-400 text-lg">⚠️</span>
              <div className="flex-1">
                <p className="font-pixel text-xs text-red-400">Image generation failed</p>
                <p className="font-pixel text-xs text-red-300/70 mt-1">{generationError}</p>
              </div>
            </div>
          </div>
        )}

        {/* Description */}
        <p 
          className="font-pixel text-sm text-gray-300 leading-relaxed border-l-4 pl-4"
          style={{ borderColor: theme.colors.primary }}
        >
          {description}
        </p>

        {/* Properties Grid */}
        {properties.length > 0 && (
          <div 
            className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t-2"
            style={{ borderColor: `${theme.colors.secondary}4D` }}
          >
            {properties.map((prop, index) => (
              <div key={index} className="space-y-1">
                <div 
                  className="text-xs font-pixel uppercase tracking-wide"
                  style={{ color: theme.colors.secondary }}
                >
                  {prop.label}
                </div>
                <div 
                  className="text-lg font-pixel"
                  style={{ color: prop.highlight ? theme.colors.accent : 'white' }}
                >
                  {prop.value}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Decorative cosmic elements */}
        <div className="flex justify-center gap-2 pt-2 opacity-50">
          <span className="animate-pulse" style={{ color: theme.colors.primary }}>✦</span>
          <span className="animate-pulse delay-100" style={{ color: theme.colors.secondary }}>✦</span>
          <span className="animate-pulse delay-200" style={{ color: theme.colors.accent }}>✦</span>
        </div>
      </div>
    </div>
  );
}

// Export as PlanetCard for backward compatibility
export { CelestialBodyCard as PlanetCard };

// Made with Bob