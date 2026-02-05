import EverArt from 'everart';
import { getValidatedEnvVar } from '@/lib/env-validation';

export interface GenerateImageOptions {
  prompt: string;
  width?: number;
  height?: number;
}

export interface GeneratedImage {
  url: string;
  generatedAt: Date;
}

/**
 * Service for generating images using the EverArt API.
 * Handles image generation with polling and error handling.
 */
export class EverArtService {
  private client: EverArt;

  constructor() {
    // Validate API key at runtime as a fallback
    let apiKey: string;
    try {
      apiKey = getValidatedEnvVar('EVERART_API_KEY');
    } catch (error) {
      console.error('Failed to validate EVERART_API_KEY:', error);
      // Fallback to process.env for backward compatibility
      apiKey = process.env.EVERART_API_KEY || '';
      if (!apiKey) {
        throw new Error('EVERART_API_KEY not configured');
      }
      console.warn('Using unvalidated EVERART_API_KEY - this is a security risk');
    }
    this.client = new EverArt(apiKey);
  }

  /**
   * Generate an image using EverArt's text-to-image API.
   * 
   * @param options - Image generation options including prompt and dimensions
   * @returns Promise resolving to the generated image URL and timestamp
   * @throws Error if generation fails or times out
   */
  async generateImage(options: GenerateImageOptions): Promise<GeneratedImage> {
    const { prompt, width = 1024, height = 576 } = options;

    try {
      // Create generation request
      const generations = await this.client.v1.generations.create(
        '5000',
        prompt,
        'txt2img',
        { imageCount: 1, width, height }
      );

      if (!generations || generations.length === 0) {
        throw new Error('No generations returned');
      }

      // Poll for completion
      const result = await this.client.v1.generations.fetchWithPolling(
        generations[0].id
      );

      if (!result.image_url) {
        throw new Error('No image URL returned');
      }

      return {
        url: result.image_url,
        generatedAt: new Date(),
      };
    } catch (error) {
      console.error('EverArt generation error:', error);
      // Throw sanitized error message - don't expose API details
      throw new Error('Image generation service temporarily unavailable');
    }
  }
}

// Made with Bob
