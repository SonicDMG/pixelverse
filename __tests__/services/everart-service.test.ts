/**
 * Unit tests for EverArtService
 * Tests image generation with EverArt API including polling and error handling
 */

// Mock the EverArt module BEFORE importing the service
jest.mock('everart', () => {
  return jest.fn().mockImplementation(() => ({
    v1: {
      generations: {
        create: jest.fn(),
        fetchWithPolling: jest.fn(),
      },
    },
  }));
});

import { EverArtService } from '@/services/image/everart-service';
import type { GenerateImageOptions } from '@/services/image/everart-service';
import EverArt from 'everart';

describe('EverArtService', () => {
  let originalEnv: NodeJS.ProcessEnv;
  const MockedEverArt = EverArt as jest.MockedClass<typeof EverArt>;

  // Helper to get the mocked client instance
  const getMockClient = () => {
    const mockInstance = (MockedEverArt as any).mock.results[MockedEverArt.mock.results.length - 1]?.value;
    return mockInstance;
  };

  beforeEach(() => {
    // Save original environment
    originalEnv = process.env;

    // Set API key in environment
    process.env.EVERART_API_KEY = 'test-api-key-123';

    // Clear all mocks
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Restore environment
    process.env = originalEnv;
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with API key from environment', () => {
      const service = new EverArtService();
      expect(service).toBeInstanceOf(EverArtService);

      const EverArt = require('everart');
      expect(EverArt).toHaveBeenCalledWith('test-api-key-123');
    });

    it('should throw error if API key not configured', () => {
      delete process.env.EVERART_API_KEY;

      expect(() => new EverArtService()).toThrow('EVERART_API_KEY not configured');
    });

    it('should throw error if API key is empty string', () => {
      process.env.EVERART_API_KEY = '';

      expect(() => new EverArtService()).toThrow('EVERART_API_KEY not configured');
    });
  });

  describe('generateImage()', () => {
    let service: EverArtService;

    beforeEach(() => {
      service = new EverArtService();
    });

    it('should generate image with default dimensions', async () => {
      const mockGeneration = { id: 'gen-123' };
      const mockResult = {
        image_url: 'https://example.com/image.png',
      };

      getMockClient().v1.generations.create.mockResolvedValue([mockGeneration]);
      getMockClient().v1.generations.fetchWithPolling.mockResolvedValue(mockResult);

      const options: GenerateImageOptions = {
        prompt: 'A beautiful sunset',
      };

      const result = await service.generateImage(options);

      expect(getMockClient().v1.generations.create).toHaveBeenCalledWith(
        '5000',
        'A beautiful sunset',
        'txt2img',
        { imageCount: 1, width: 1024, height: 576 }
      );

      expect(getMockClient().v1.generations.fetchWithPolling).toHaveBeenCalledWith('gen-123');

      expect(result).toEqual({
        url: 'https://example.com/image.png',
        generatedAt: expect.any(Date),
      });
    });

    it('should generate image with custom dimensions', async () => {
      const mockGeneration = { id: 'gen-456' };
      const mockResult = {
        image_url: 'https://example.com/custom.png',
      };

      getMockClient().v1.generations.create.mockResolvedValue([mockGeneration]);
      getMockClient().v1.generations.fetchWithPolling.mockResolvedValue(mockResult);

      const options: GenerateImageOptions = {
        prompt: 'Custom size image',
        width: 512,
        height: 512,
      };

      const result = await service.generateImage(options);

      expect(getMockClient().v1.generations.create).toHaveBeenCalledWith(
        '5000',
        'Custom size image',
        'txt2img',
        { imageCount: 1, width: 512, height: 512 }
      );

      expect(result.url).toBe('https://example.com/custom.png');
    });

    it('should handle complex prompts', async () => {
      const mockGeneration = { id: 'gen-789' };
      const mockResult = {
        image_url: 'https://example.com/complex.png',
      };

      getMockClient().v1.generations.create.mockResolvedValue([mockGeneration]);
      getMockClient().v1.generations.fetchWithPolling.mockResolvedValue(mockResult);

      const complexPrompt = '32-bit pixel art, planet Mars, rusty red-orange surface, white polar ice caps, retro space game aesthetic';

      const options: GenerateImageOptions = {
        prompt: complexPrompt,
        width: 1920,
        height: 1080,
      };

      await service.generateImage(options);

      expect(getMockClient().v1.generations.create).toHaveBeenCalledWith(
        '5000',
        complexPrompt,
        'txt2img',
        { imageCount: 1, width: 1920, height: 1080 }
      );
    });

    it('should throw error if no generations returned', async () => {
      getMockClient().v1.generations.create.mockResolvedValue([]);

      const options: GenerateImageOptions = {
        prompt: 'Test prompt',
      };

      await expect(service.generateImage(options)).rejects.toThrow(
        'Image generation failed: No generations returned'
      );
    });

    it('should throw error if generations is null', async () => {
      getMockClient().v1.generations.create.mockResolvedValue(null);

      const options: GenerateImageOptions = {
        prompt: 'Test prompt',
      };

      await expect(service.generateImage(options)).rejects.toThrow(
        'Image generation failed: No generations returned'
      );
    });

    it('should throw error if no image URL returned', async () => {
      const mockGeneration = { id: 'gen-no-url' };
      const mockResult = {
        // No image_url field
      };

      getMockClient().v1.generations.create.mockResolvedValue([mockGeneration]);
      getMockClient().v1.generations.fetchWithPolling.mockResolvedValue(mockResult);

      const options: GenerateImageOptions = {
        prompt: 'Test prompt',
      };

      await expect(service.generateImage(options)).rejects.toThrow(
        'Image generation failed: No image URL returned'
      );
    });

    it('should handle creation errors', async () => {
      getMockClient().v1.generations.create.mockRejectedValue(
        new Error('API rate limit exceeded')
      );

      const options: GenerateImageOptions = {
        prompt: 'Test prompt',
      };

      await expect(service.generateImage(options)).rejects.toThrow(
        'Image generation failed: API rate limit exceeded'
      );
    });

    it('should handle polling errors', async () => {
      const mockGeneration = { id: 'gen-poll-error' };
      getMockClient().v1.generations.create.mockResolvedValue([mockGeneration]);
      getMockClient().v1.generations.fetchWithPolling.mockRejectedValue(
        new Error('Polling timeout')
      );

      const options: GenerateImageOptions = {
        prompt: 'Test prompt',
      };

      await expect(service.generateImage(options)).rejects.toThrow(
        'Image generation failed: Polling timeout'
      );
    });

    it('should handle network errors', async () => {
      getMockClient().v1.generations.create.mockRejectedValue(
        new Error('Network connection failed')
      );

      const options: GenerateImageOptions = {
        prompt: 'Test prompt',
      };

      await expect(service.generateImage(options)).rejects.toThrow(
        'Image generation failed: Network connection failed'
      );
    });

    it('should handle non-Error exceptions', async () => {
      getMockClient().v1.generations.create.mockRejectedValue('String error');

      const options: GenerateImageOptions = {
        prompt: 'Test prompt',
      };

      await expect(service.generateImage(options)).rejects.toThrow(
        'Image generation failed: Unknown error'
      );
    });

    it('should log errors to console', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const testError = new Error('Test error');

      getMockClient().v1.generations.create.mockRejectedValue(testError);

      const options: GenerateImageOptions = {
        prompt: 'Test prompt',
      };

      await expect(service.generateImage(options)).rejects.toThrow();

      expect(consoleSpy).toHaveBeenCalledWith('EverArt generation error:', testError);

      consoleSpy.mockRestore();
    });

    it('should return timestamp close to current time', async () => {
      const mockGeneration = { id: 'gen-time' };
      const mockResult = {
        image_url: 'https://example.com/image.png',
      };

      getMockClient().v1.generations.create.mockResolvedValue([mockGeneration]);
      getMockClient().v1.generations.fetchWithPolling.mockResolvedValue(mockResult);

      const beforeTime = new Date();
      const result = await service.generateImage({ prompt: 'Test' });
      const afterTime = new Date();

      expect(result.generatedAt.getTime()).toBeGreaterThanOrEqual(beforeTime.getTime());
      expect(result.generatedAt.getTime()).toBeLessThanOrEqual(afterTime.getTime());
    });

    it('should handle empty prompt', async () => {
      const mockGeneration = { id: 'gen-empty' };
      const mockResult = {
        image_url: 'https://example.com/empty.png',
      };

      getMockClient().v1.generations.create.mockResolvedValue([mockGeneration]);
      getMockClient().v1.generations.fetchWithPolling.mockResolvedValue(mockResult);

      const result = await service.generateImage({ prompt: '' });

      expect(getMockClient().v1.generations.create).toHaveBeenCalledWith(
        '5000',
        '',
        'txt2img',
        expect.any(Object)
      );
      expect(result.url).toBe('https://example.com/empty.png');
    });

    it('should handle very long prompts', async () => {
      const mockGeneration = { id: 'gen-long' };
      const mockResult = {
        image_url: 'https://example.com/long.png',
      };

      getMockClient().v1.generations.create.mockResolvedValue([mockGeneration]);
      getMockClient().v1.generations.fetchWithPolling.mockResolvedValue(mockResult);

      const longPrompt = 'word '.repeat(500);

      const result = await service.generateImage({ prompt: longPrompt });

      expect(getMockClient().v1.generations.create).toHaveBeenCalledWith(
        '5000',
        longPrompt,
        'txt2img',
        expect.any(Object)
      );
      expect(result.url).toBe('https://example.com/long.png');
    });

    it('should handle special characters in prompt', async () => {
      const mockGeneration = { id: 'gen-special' };
      const mockResult = {
        image_url: 'https://example.com/special.png',
      };

      getMockClient().v1.generations.create.mockResolvedValue([mockGeneration]);
      getMockClient().v1.generations.fetchWithPolling.mockResolvedValue(mockResult);

      const specialPrompt = 'Test with "quotes", <tags>, & symbols!';

      const result = await service.generateImage({ prompt: specialPrompt });

      expect(getMockClient().v1.generations.create).toHaveBeenCalledWith(
        '5000',
        specialPrompt,
        'txt2img',
        expect.any(Object)
      );
      expect(result.url).toBe('https://example.com/special.png');
    });

    it('should use model ID 5000', async () => {
      const mockGeneration = { id: 'gen-model' };
      const mockResult = {
        image_url: 'https://example.com/model.png',
      };

      getMockClient().v1.generations.create.mockResolvedValue([mockGeneration]);
      getMockClient().v1.generations.fetchWithPolling.mockResolvedValue(mockResult);

      await service.generateImage({ prompt: 'Test' });

      expect(getMockClient().v1.generations.create).toHaveBeenCalledWith(
        '5000',
        expect.any(String),
        expect.any(String),
        expect.any(Object)
      );
    });

    it('should use txt2img generation type', async () => {
      const mockGeneration = { id: 'gen-type' };
      const mockResult = {
        image_url: 'https://example.com/type.png',
      };

      getMockClient().v1.generations.create.mockResolvedValue([mockGeneration]);
      getMockClient().v1.generations.fetchWithPolling.mockResolvedValue(mockResult);

      await service.generateImage({ prompt: 'Test' });

      expect(getMockClient().v1.generations.create).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        'txt2img',
        expect.any(Object)
      );
    });

    it('should always request single image', async () => {
      const mockGeneration = { id: 'gen-count' };
      const mockResult = {
        image_url: 'https://example.com/count.png',
      };

      getMockClient().v1.generations.create.mockResolvedValue([mockGeneration]);
      getMockClient().v1.generations.fetchWithPolling.mockResolvedValue(mockResult);

      await service.generateImage({ prompt: 'Test' });

      expect(getMockClient().v1.generations.create).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        expect.any(String),
        expect.objectContaining({ imageCount: 1 })
      );
    });
  });

  describe('integration scenarios', () => {
    it('should handle multiple sequential generations', async () => {
      const service = new EverArtService();

      const mockGen1 = { id: 'gen-1' };
      const mockGen2 = { id: 'gen-2' };
      const mockResult1 = { image_url: 'https://example.com/1.png' };
      const mockResult2 = { image_url: 'https://example.com/2.png' };

      getMockClient().v1.generations.create
        .mockResolvedValueOnce([mockGen1])
        .mockResolvedValueOnce([mockGen2]);

      getMockClient().v1.generations.fetchWithPolling
        .mockResolvedValueOnce(mockResult1)
        .mockResolvedValueOnce(mockResult2);

      const result1 = await service.generateImage({ prompt: 'First image' });
      const result2 = await service.generateImage({ prompt: 'Second image' });

      expect(result1.url).toBe('https://example.com/1.png');
      expect(result2.url).toBe('https://example.com/2.png');
      expect(getMockClient().v1.generations.create).toHaveBeenCalledTimes(2);
    });

    it('should handle generation with various dimension combinations', async () => {
      const service = new EverArtService();

      const dimensions = [
        { width: 512, height: 512 },
        { width: 1024, height: 576 },
        { width: 1920, height: 1080 },
        { width: 768, height: 768 },
      ];

      for (const dim of dimensions) {
        const mockGen = { id: `gen-${dim.width}x${dim.height}` };
        const mockResult = { image_url: `https://example.com/${dim.width}x${dim.height}.png` };

        getMockClient().v1.generations.create.mockResolvedValue([mockGen]);
        getMockClient().v1.generations.fetchWithPolling.mockResolvedValue(mockResult);

        const result = await service.generateImage({
          prompt: 'Test',
          width: dim.width,
          height: dim.height,
        });

        expect(result.url).toContain(`${dim.width}x${dim.height}`);
      }
    });

    it('should maintain separate state for multiple service instances', async () => {
      const service1 = new EverArtService();
      const service2 = new EverArtService();

      expect(service1).not.toBe(service2);

      const EverArt = require('everart');
      expect(EverArt).toHaveBeenCalledTimes(2);
    });
  });

  describe('error message formatting', () => {
    it('should format Error objects correctly', async () => {
      const service = new EverArtService();
      const testError = new Error('Specific error message');

      getMockClient().v1.generations.create.mockRejectedValue(testError);

      await expect(service.generateImage({ prompt: 'Test' })).rejects.toThrow(
        'Image generation failed: Specific error message'
      );
    });

    it('should handle errors without message', async () => {
      const service = new EverArtService();
      const testError = new Error();

      getMockClient().v1.generations.create.mockRejectedValue(testError);

      await expect(service.generateImage({ prompt: 'Test' })).rejects.toThrow(
        'Image generation failed:'
      );
    });

    it('should handle non-Error thrown values', async () => {
      const service = new EverArtService();

      getMockClient().v1.generations.create.mockRejectedValue({ custom: 'error' });

      await expect(service.generateImage({ prompt: 'Test' })).rejects.toThrow(
        'Image generation failed:'
      );
    });
  });
});

// Made with Bob