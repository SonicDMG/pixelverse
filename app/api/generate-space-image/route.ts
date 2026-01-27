import { NextRequest, NextResponse } from 'next/server';
import { EverArtService } from '@/services/image/everart-service';
import { SpacePromptBuilder } from '@/services/space/prompt-builder';

/**
 * ============================================================================
 * SPACE IMAGE GENERATION API ROUTE
 * ============================================================================
 *
 * This API route handles requests to generate space-themed images using the
 * EverArt API. It accepts parameters for different types of celestial objects
 * and returns generated image URLs.
 *
 * SUPPORTED OBJECT TYPES:
 * - planet: Generate planet images with specific characteristics
 * - constellation: Generate star map visualizations
 * - celestial: Generate generic celestial objects (moons, stars, nebulae, galaxies)
 *
 * ============================================================================
 */

/**
 * Request body interface for image generation
 */
interface GenerateImageRequest {
  objectType: 'planet' | 'constellation' | 'celestial';
  description: string;
  planetType?: 'terrestrial' | 'gas-giant' | 'ice-giant' | 'dwarf';
  style?: 'pixel-art' | 'realistic';
  seed?: number;
}

/**
 * Response interface for successful image generation
 */
interface GenerateImageResponse {
  success: boolean;
  imageUrl?: string;
  error?: string;
  seed?: number;
}

/**
 * Validate request body structure and required fields
 * Following OWASP security standards for input validation
 */
function validateRequest(body: unknown): { valid: boolean; error?: string; data?: GenerateImageRequest } {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Request body is required and must be an object' };
  }

  const req = body as Partial<GenerateImageRequest>;

  // Validate objectType
  if (!req.objectType) {
    return { valid: false, error: 'objectType is required' };
  }

  const validObjectTypes = ['planet', 'constellation', 'celestial'];
  if (!validObjectTypes.includes(req.objectType)) {
    return { valid: false, error: `objectType must be one of: ${validObjectTypes.join(', ')}` };
  }

  // Validate description
  if (!req.description || typeof req.description !== 'string') {
    return { valid: false, error: 'description is required and must be a string' };
  }

  const trimmedDescription = req.description.trim();
  if (trimmedDescription.length === 0) {
    return { valid: false, error: 'description cannot be empty' };
  }

  if (trimmedDescription.length > 200) {
    return { valid: false, error: 'description too long (max 200 characters)' };
  }

  // Sanitize description - remove control characters
  const sanitizedDescription = trimmedDescription.replace(/[\x00-\x1F\x7F]/g, '');

  // Validate planetType if provided
  if (req.planetType) {
    const validPlanetTypes = ['terrestrial', 'gas-giant', 'ice-giant', 'dwarf'];
    if (!validPlanetTypes.includes(req.planetType)) {
      return { valid: false, error: `planetType must be one of: ${validPlanetTypes.join(', ')}` };
    }
  }

  // Validate style if provided
  if (req.style) {
    const validStyles = ['pixel-art', 'realistic'];
    if (!validStyles.includes(req.style)) {
      return { valid: false, error: `style must be one of: ${validStyles.join(', ')}` };
    }
  }

  // Validate seed if provided
  if (req.seed !== undefined) {
    if (typeof req.seed !== 'number' || !Number.isInteger(req.seed) || req.seed < 0) {
      return { valid: false, error: 'seed must be a non-negative integer' };
    }
  }

  return {
    valid: true,
    data: {
      objectType: req.objectType,
      description: sanitizedDescription,
      planetType: req.planetType,
      style: req.style || 'pixel-art',
      seed: req.seed,
    },
  };
}

/**
 * Build appropriate prompt based on object type and parameters
 */
function buildPrompt(request: GenerateImageRequest): string {
  const { objectType, description, planetType, style } = request;

  // Extract name from description (first word or phrase before comma/period)
  const name = description.split(/[,.]/).shift()?.trim() || 'Unknown';

  switch (objectType) {
    case 'planet':
      // Check if this is a known solar system planet
      const supportedPlanets = SpacePromptBuilder.getSupportedPlanets();
      const normalizedName = name.toLowerCase();
      
      if (supportedPlanets.includes(normalizedName)) {
        // Use scientifically accurate prompt for known planets
        console.log(`[Generate Space Image API] Using accurate prompt for planet: ${name}`);
        return SpacePromptBuilder.buildAccuratePlanetPrompt(name);
      }
      
      // For exoplanets or unknown planets, parse details from description
      console.log(`[Generate Space Image API] Using generic prompt for exoplanet: ${name}`);
      const characteristics: string[] = [];
      const colors: string[] = [];

      // Extract color keywords from description
      const colorKeywords = ['red', 'blue', 'green', 'yellow', 'orange', 'purple', 'white', 'brown', 'gray', 'cyan', 'tan', 'golden', 'rusty'];
      colorKeywords.forEach(color => {
        if (description.toLowerCase().includes(color)) {
          colors.push(color);
        }
      });

      // Extract characteristic keywords from description
      const charKeywords = ['rocky', 'gaseous', 'icy', 'volcanic', 'cloudy', 'ringed', 'barren', 'stormy', 'hot', 'cold', 'desert', 'ocean'];
      charKeywords.forEach(char => {
        if (description.toLowerCase().includes(char)) {
          characteristics.push(char);
        }
      });

      // Add any additional details from the description
      if (characteristics.length === 0 && colors.length === 0) {
        // Use the full description as characteristics if no keywords found
        characteristics.push(description);
      }

      return SpacePromptBuilder.buildPlanetPrompt(
        name,
        planetType || 'terrestrial',
        characteristics,
        colors
      );

    case 'constellation':
      // Extract star count from description or default to 7
      const starCountMatch = description.match(/(\d+)\s*stars?/i);
      const starCount = starCountMatch ? parseInt(starCountMatch[1], 10) : 7;

      return SpacePromptBuilder.buildConstellationPrompt(name, starCount);

    case 'celestial':
      // Determine celestial type from description
      let celestialType: 'moon' | 'star' | 'nebula' | 'galaxy' = 'star';
      
      if (description.toLowerCase().includes('moon')) {
        celestialType = 'moon';
        
        // Check if this is a known moon
        const supportedMoons = SpacePromptBuilder.getSupportedMoons();
        const normalizedMoonName = name.toLowerCase();
        
        if (supportedMoons.includes(normalizedMoonName)) {
          // Use scientifically accurate prompt for known moons
          console.log(`[Generate Space Image API] Using accurate prompt for moon: ${name}`);
          return SpacePromptBuilder.buildAccurateMoonPrompt(name);
        }
      } else if (description.toLowerCase().includes('nebula')) {
        celestialType = 'nebula';
      } else if (description.toLowerCase().includes('galaxy')) {
        celestialType = 'galaxy';
      }

      return SpacePromptBuilder.buildGenericCelestialPrompt(
        celestialType,
        name,
        description
      );

    default:
      // Fallback to generic celestial prompt
      return SpacePromptBuilder.buildGenericCelestialPrompt('star', name, description);
  }
}

/**
 * POST /api/generate-space-image
 * Generate space-themed images using EverArt API
 */
export async function POST(request: NextRequest) {
  try {
    console.log('[Generate Space Image API] Received POST request');

    // Parse request body
    const body = await request.json();
    console.log('[Generate Space Image API] Request body:', {
      objectType: body.objectType,
      descriptionLength: body.description?.length,
      planetType: body.planetType,
      style: body.style,
      hasSeed: !!body.seed,
    });

    // Validate request
    const validation = validateRequest(body);
    if (!validation.valid) {
      console.log('[Generate Space Image API] Validation failed:', validation.error);
      return NextResponse.json<GenerateImageResponse>(
        { success: false, error: validation.error! },
        { status: 400 }
      );
    }

    const validatedRequest = validation.data!;
    console.log('[Generate Space Image API] Validation passed');

    // Check for API key
    if (!process.env.EVERART_API_KEY) {
      console.error('[Generate Space Image API] EVERART_API_KEY not configured');
      return NextResponse.json<GenerateImageResponse>(
        { success: false, error: 'Image generation service not configured' },
        { status: 503 }
      );
    }

    // Build prompt
    const prompt = buildPrompt(validatedRequest);
    console.log('[Generate Space Image API] Generated prompt:', prompt);

    // Initialize EverArt service
    let everArtService: EverArtService;
    try {
      everArtService = new EverArtService();
    } catch (error) {
      console.error('[Generate Space Image API] Failed to initialize EverArt service:', error);
      return NextResponse.json<GenerateImageResponse>(
        { success: false, error: 'Image generation service initialization failed' },
        { status: 503 }
      );
    }

    // Generate image
    try {
      console.log('[Generate Space Image API] Starting image generation...');
      const result = await everArtService.generateImage({
        prompt,
        width: 1024,
        height: 576,
      });

      console.log('[Generate Space Image API] Image generated successfully');
      return NextResponse.json<GenerateImageResponse>({
        success: true,
        imageUrl: result.url,
        seed: validatedRequest.seed,
      });
    } catch (error) {
      console.error('[Generate Space Image API] Image generation failed:', error);
      
      // Sanitize error message for client
      const errorMessage = error instanceof Error
        ? 'Image generation failed. Please try again.'
        : 'Unknown error occurred during image generation';

      return NextResponse.json<GenerateImageResponse>(
        { success: false, error: errorMessage },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('[Generate Space Image API] Route error:', error);

    // Provide sanitized error response
    const response: GenerateImageResponse = {
      success: false,
      error: 'Internal server error',
    };

    return NextResponse.json(response, { status: 500 });
  }
}

// Made with Bob