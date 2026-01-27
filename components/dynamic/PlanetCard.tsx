'use client';

import { useState, useEffect } from 'react';

/**
 * Props for the PlanetCard component
 */
interface PlanetCardProps {
  name: string;
  description: string;
  diameter: string;
  mass: string;
  distanceFromSun: string;
  orbitalPeriod: string;
  moons?: number;
  imageUrl?: string;
  
  // New props for dynamic image generation
  planetType?: 'terrestrial' | 'gas-giant' | 'ice-giant' | 'dwarf';
  enableImageGeneration?: boolean;  // Auto-generate image if no generatedImageUrl
  generatedImageUrl?: string;       // Pre-generated image URL
}

/**
 * Response interface from the image generation API
 */
interface GenerateImageResponse {
  success: boolean;
  imageUrl?: string;
  error?: string;
  seed?: number;
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
  planetType,
  enableImageGeneration = true,  // Default to true for auto-generation
  generatedImageUrl,
}: PlanetCardProps) {
  // State management for image generation
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [localGeneratedUrl, setLocalGeneratedUrl] = useState<string | null>(
    generatedImageUrl || null
  );

  // Debug: Log component mount and props
  console.log('[PlanetCard] Component mounted/updated:', {
    name,
    enableImageGeneration,
    planetType,
    hasGeneratedImageUrl: !!generatedImageUrl,
    hasLocalGeneratedUrl: !!localGeneratedUrl,
    hasImageUrl: !!imageUrl,
    isGenerating,
    generationError,
  });

  /**
   * Automatically generate image on component mount if enabled
   * and no generated image is already available
   */
  useEffect(() => {
    // Debug: Log useEffect trigger
    console.log('[PlanetCard] useEffect triggered:', {
      enableImageGeneration,
      hasGeneratedImageUrl: !!generatedImageUrl,
      hasLocalGeneratedUrl: !!localGeneratedUrl,
      isGenerating,
      hasGenerationError: !!generationError,
    });

    // Only generate if:
    // 1. Image generation is enabled
    // 2. No generated image URL is provided
    // 3. Not currently generating
    // 4. No previous generation error
    const shouldGenerate = enableImageGeneration && !generatedImageUrl && !localGeneratedUrl && !isGenerating && !generationError;
    
    console.log('[PlanetCard] Should generate image:', shouldGenerate);
    
    if (shouldGenerate) {
      console.log('[PlanetCard] Triggering image generation...');
      generateImage();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enableImageGeneration, generatedImageUrl, localGeneratedUrl]);

  /**
   * Generate a space image using the API endpoint
   * Automatically called on mount when conditions are met
   */
  const generateImage = async () => {
    console.log('[PlanetCard] === Starting Image Generation ===');
    console.log('[PlanetCard] Planet name:', name);
    console.log('[PlanetCard] Planet type:', planetType || 'terrestrial');
    
    setIsGenerating(true);
    setGenerationError(null);

    try {
      const requestBody = {
        objectType: 'planet',
        description: `${name}, ${description}`,
        planetType: planetType || 'terrestrial',
        style: 'pixel-art',
      };
      
      console.log('[PlanetCard] API Request URL:', '/api/generate-space-image');
      console.log('[PlanetCard] API Request Method:', 'POST');
      console.log('[PlanetCard] API Request Body:', JSON.stringify(requestBody, null, 2));
      
      const response = await fetch('/api/generate-space-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('[PlanetCard] API Response Status:', response.status);
      console.log('[PlanetCard] API Response OK:', response.ok);
      console.log('[PlanetCard] API Response Headers:', Object.fromEntries(response.headers.entries()));

      const data: GenerateImageResponse = await response.json();
      console.log('[PlanetCard] API Response Data:', JSON.stringify(data, null, 2));

      if (!response.ok || !data.success) {
        const errorMsg = data.error || 'Failed to generate image';
        console.error('[PlanetCard] API returned error:', errorMsg);
        throw new Error(errorMsg);
      }

      if (data.imageUrl) {
        console.log('[PlanetCard] ✅ Image generated successfully!');
        console.log('[PlanetCard] Image URL:', data.imageUrl);
        console.log('[PlanetCard] Image seed:', data.seed);
        setLocalGeneratedUrl(data.imageUrl);
      } else {
        console.error('[PlanetCard] ❌ No image URL in response');
        throw new Error('No image URL returned from API');
      }
    } catch (error) {
      console.error('[PlanetCard] ❌ Image generation failed with error:', error);
      console.error('[PlanetCard] Error type:', error?.constructor?.name);
      console.error('[PlanetCard] Error message:', error instanceof Error ? error.message : String(error));
      console.error('[PlanetCard] Error stack:', error instanceof Error ? error.stack : 'N/A');
      
      const errorMessage = error instanceof Error
        ? error.message
        : 'Failed to generate image';
      setGenerationError(errorMessage);
    } finally {
      setIsGenerating(false);
      console.log('[PlanetCard] === Image Generation Complete ===');
    }
  };

  // Determine which image to display (priority: generated > provided > none)
  const displayImageUrl = localGeneratedUrl || imageUrl;
  const showImageSection = displayImageUrl || isGenerating;
  
  // Debug: Log final display state
  console.log('[PlanetCard] Display state:', {
    displayImageUrl,
    showImageSection,
    usingLocalGenerated: !!localGeneratedUrl,
    usingProvidedImage: !localGeneratedUrl && !!imageUrl,
  });

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

        {/* Image Section - Shows generated, provided, loading, or error state */}
        {showImageSection && (
          <div className="relative w-full h-128 rounded border-2 border-[#4169E1]/50 overflow-hidden">
            {isGenerating ? (
              // Loading state during image generation
              <div className="w-full h-full flex flex-col items-center justify-center bg-[#0a0e27]/80">
                <div className="relative">
                  {/* Animated loading spinner */}
                  <div className="w-16 h-16 border-4 border-[#4169E1]/30 border-t-[#00CED1] rounded-full animate-spin" />
                  <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-[#9370DB] rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
                </div>
                <p className="mt-4 font-pixel text-xs text-[#00CED1] animate-pulse">
                  GENERATING IMAGE...
                </p>
                <div className="flex gap-1 mt-2">
                  <span className="w-2 h-2 bg-[#9370DB] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-[#4169E1] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-[#00CED1] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            ) : displayImageUrl ? (
              // Display generated or provided image
              <>
                <img
                  src={displayImageUrl}
                  alt={name}
                  className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0e27] to-transparent opacity-50" />
                {localGeneratedUrl && (
                  // Badge to indicate AI-generated image
                  <div className="absolute top-2 right-2 px-2 py-1 bg-[#9370DB]/80 border border-[#00CED1] rounded pixel-border">
                    <span className="font-pixel text-xs text-[#00CED1]">AI ✨</span>
                  </div>
                )}
              </>
            ) : null}
          </div>
        )}

        {/* Error message if image generation failed */}
        {generationError && (
          <div className="p-3 bg-red-900/20 border-2 border-red-500/50 rounded pixel-border">
            <div className="flex items-start gap-2">
              <span className="text-red-400 text-lg">⚠️</span>
              <div className="flex-1">
                <p className="font-pixel text-xs text-red-400">
                  Image generation failed
                </p>
                <p className="font-pixel text-xs text-red-300/70 mt-1">
                  {generationError}
                </p>
              </div>
            </div>
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
            <div className="text-lg font-pixel text-white">
              {diameter}
            </div>
          </div>

          {/* Mass */}
          <div className="space-y-1">
            <div className="text-xs font-pixel text-[#4169E1] uppercase tracking-wide">
              Mass
            </div>
            <div className="text-lg font-pixel text-white">
              {mass}
            </div>
          </div>

          {/* Distance from Sun */}
          <div className="space-y-1">
            <div className="text-xs font-pixel text-[#4169E1] uppercase tracking-wide">
              Distance from Sun
            </div>
            <div className="text-lg font-pixel text-[#00CED1]">
              {distanceFromSun}
            </div>
          </div>

          {/* Orbital Period */}
          <div className="space-y-1">
            <div className="text-xs font-pixel text-[#4169E1] uppercase tracking-wide">
              Orbital Period
            </div>
            <div className="text-lg font-pixel text-[#00CED1]">
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