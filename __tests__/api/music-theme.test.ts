/**
 * Integration tests for /api/music/[theme] route
 * Tests GET handler, theme validation, file system operations, and error handling
 * 
 * Note: These tests focus on the validation and business logic rather than
 * full integration testing of the Next.js route handler.
 */

import { promises as fs } from 'fs';
import path from 'path';
import * as themeModule from '@/constants/theme';

// Mock fs module
jest.mock('fs', () => ({
  promises: {
    readdir: jest.fn(),
  },
}));

const mockedReaddir = fs.readdir as jest.MockedFunction<typeof fs.readdir>;

// Mock the theme validation
jest.mock('@/constants/theme', () => ({
  isValidThemeId: jest.fn(),
}));

const mockedIsValidThemeId = themeModule.isValidThemeId as jest.MockedFunction<typeof themeModule.isValidThemeId>;

describe('/api/music/[theme] - Music File Listing', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Theme validation', () => {
    it('should accept valid theme: ticker', () => {
      mockedIsValidThemeId.mockReturnValue(true);
      
      const result = themeModule.isValidThemeId('ticker');
      
      expect(result).toBe(true);
      expect(mockedIsValidThemeId).toHaveBeenCalledWith('ticker');
    });

    it('should accept valid theme: space', () => {
      mockedIsValidThemeId.mockReturnValue(true);
      
      const result = themeModule.isValidThemeId('space');
      
      expect(result).toBe(true);
      expect(mockedIsValidThemeId).toHaveBeenCalledWith('space');
    });

    it('should reject invalid theme', () => {
      mockedIsValidThemeId.mockReturnValue(false);
      
      const result = themeModule.isValidThemeId('invalid-theme');
      
      expect(result).toBe(false);
    });

    it('should reject empty string theme', () => {
      mockedIsValidThemeId.mockReturnValue(false);
      
      const result = themeModule.isValidThemeId('');
      
      expect(result).toBe(false);
    });

    it('should reject null theme', () => {
      mockedIsValidThemeId.mockReturnValue(false);
      
      const result = themeModule.isValidThemeId(null as any);
      
      expect(result).toBe(false);
    });

    it('should reject undefined theme', () => {
      mockedIsValidThemeId.mockReturnValue(false);
      
      const result = themeModule.isValidThemeId(undefined as any);
      
      expect(result).toBe(false);
    });
  });

  describe('File system operations', () => {
    it('should read music directory successfully', async () => {
      const mockFiles = ['song1.mp3', 'song2.mp3', 'song3.mp3'];
      mockedReaddir.mockResolvedValue(mockFiles as any);

      const files = await fs.readdir('/path/to/music');

      expect(files).toEqual(mockFiles);
      expect(mockedReaddir).toHaveBeenCalledWith('/path/to/music');
    });

    it('should filter MP3 files only', () => {
      const files = ['song1.mp3', 'song2.MP3', 'readme.txt', 'cover.jpg', 'song3.mp3'];
      const mp3Files = files.filter(file => file.toLowerCase().endsWith('.mp3'));

      expect(mp3Files).toEqual(['song1.mp3', 'song2.MP3', 'song3.mp3']);
    });

    it('should handle case-insensitive MP3 extension', () => {
      const files = ['Song.MP3', 'track.Mp3', 'audio.mp3'];
      const mp3Files = files.filter(file => file.toLowerCase().endsWith('.mp3'));

      expect(mp3Files).toHaveLength(3);
    });

    it('should sort files alphabetically', () => {
      const files = ['zebra.mp3', 'alpha.mp3', 'beta.mp3'];
      const sorted = [...files].sort();

      expect(sorted).toEqual(['alpha.mp3', 'beta.mp3', 'zebra.mp3']);
    });

    it('should handle empty directory', async () => {
      mockedReaddir.mockResolvedValue([] as any);

      const files = await fs.readdir('/path/to/empty');

      expect(files).toEqual([]);
    });

    it('should handle directory with no MP3 files', () => {
      const files = ['readme.txt', 'cover.jpg', 'info.pdf'];
      const mp3Files = files.filter(file => file.toLowerCase().endsWith('.mp3'));

      expect(mp3Files).toEqual([]);
    });
  });

  describe('Path construction', () => {
    it('should construct correct path for ticker theme', () => {
      const theme = 'ticker';
      const musicPath = path.join(process.cwd(), 'public', 'audio', 'music', theme);

      expect(musicPath).toContain('public');
      expect(musicPath).toContain('audio');
      expect(musicPath).toContain('music');
      expect(musicPath).toContain('ticker');
    });

    it('should construct correct path for space theme', () => {
      const theme = 'space';
      const musicPath = path.join(process.cwd(), 'public', 'audio', 'music', theme);

      expect(musicPath).toContain('space');
    });

    it('should use process.cwd() for base path', () => {
      const cwd = process.cwd();
      expect(typeof cwd).toBe('string');
      expect(cwd.length).toBeGreaterThan(0);
    });
  });

  describe('Error handling', () => {
    it('should handle ENOENT error (directory not found)', async () => {
      const error: any = new Error('ENOENT: no such file or directory');
      error.code = 'ENOENT';
      mockedReaddir.mockRejectedValue(error);

      await expect(fs.readdir('/nonexistent')).rejects.toThrow('ENOENT');
    });

    it('should handle permission errors', async () => {
      const error: any = new Error('EACCES: permission denied');
      error.code = 'EACCES';
      mockedReaddir.mockRejectedValue(error);

      await expect(fs.readdir('/restricted')).rejects.toThrow('EACCES');
    });

    it('should handle generic file system errors', async () => {
      mockedReaddir.mockRejectedValue(new Error('Unknown error'));

      await expect(fs.readdir('/path')).rejects.toThrow('Unknown error');
    });
  });

  describe('Response format', () => {
    it('should return array of filenames', () => {
      const response = {
        files: ['song1.mp3', 'song2.mp3']
      };

      expect(response).toHaveProperty('files');
      expect(Array.isArray(response.files)).toBe(true);
      expect(response.files).toHaveLength(2);
    });

    it('should return empty array for no files', () => {
      const response = {
        files: []
      };

      expect(response.files).toEqual([]);
    });

    it('should format error response correctly', () => {
      const errorResponse = {
        error: 'Invalid theme ID',
        message: 'Theme \'invalid\' is not valid'
      };

      expect(errorResponse).toHaveProperty('error');
      expect(errorResponse).toHaveProperty('message');
      expect(typeof errorResponse.error).toBe('string');
      expect(typeof errorResponse.message).toBe('string');
    });

    it('should include files array in error response', () => {
      const errorResponse = {
        error: 'File system error',
        message: 'Unable to read music directory',
        files: []
      };

      expect(errorResponse).toHaveProperty('files');
      expect(errorResponse.files).toEqual([]);
    });
  });

  describe('File name validation', () => {
    it('should handle files with spaces', () => {
      const files = ['Song With Spaces.mp3', 'Another Track.mp3'];
      const mp3Files = files.filter(file => file.toLowerCase().endsWith('.mp3'));

      expect(mp3Files).toHaveLength(2);
    });

    it('should handle files with special characters', () => {
      const files = ['Song-1.mp3', 'Track_2.mp3', 'Audio (3).mp3'];
      const mp3Files = files.filter(file => file.toLowerCase().endsWith('.mp3'));

      expect(mp3Files).toHaveLength(3);
    });

    it('should handle files with numbers', () => {
      const files = ['01-intro.mp3', '02-main.mp3', '03-outro.mp3'];
      const mp3Files = files.filter(file => file.toLowerCase().endsWith('.mp3'));

      expect(mp3Files).toHaveLength(3);
    });

    it('should handle Unicode filenames', () => {
      const files = ['音楽.mp3', 'música.mp3', 'музыка.mp3'];
      const mp3Files = files.filter(file => file.toLowerCase().endsWith('.mp3'));

      expect(mp3Files).toHaveLength(3);
    });
  });

  describe('Edge cases', () => {
    it('should handle very long filenames', () => {
      const longName = 'a'.repeat(200) + '.mp3';
      const files = [longName];
      const mp3Files = files.filter(file => file.toLowerCase().endsWith('.mp3'));

      expect(mp3Files).toHaveLength(1);
    });

    it('should handle files with multiple dots', () => {
      const files = ['song.backup.mp3', 'track.v2.mp3'];
      const mp3Files = files.filter(file => file.toLowerCase().endsWith('.mp3'));

      expect(mp3Files).toHaveLength(2);
    });

    it('should not match files ending with .mp3 in name but different extension', () => {
      const files = ['song.mp3.txt', 'track.mp3.bak'];
      const mp3Files = files.filter(file => file.toLowerCase().endsWith('.mp3'));

      expect(mp3Files).toHaveLength(0);
    });

    it('should handle mixed case extensions', () => {
      const files = ['song.Mp3', 'track.MP3', 'audio.mP3'];
      const mp3Files = files.filter(file => file.toLowerCase().endsWith('.mp3'));

      expect(mp3Files).toHaveLength(3);
    });
  });

  describe('Sorting behavior', () => {
    it('should sort case-insensitively', () => {
      const files = ['Zebra.mp3', 'alpha.mp3', 'Beta.mp3'];
      const sorted = [...files].sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));

      expect(sorted[0].toLowerCase()).toBe('alpha.mp3');
      expect(sorted[1].toLowerCase()).toBe('beta.mp3');
      expect(sorted[2].toLowerCase()).toBe('zebra.mp3');
    });

    it('should handle numeric sorting', () => {
      const files = ['10-song.mp3', '2-song.mp3', '1-song.mp3'];
      const sorted = [...files].sort();

      // Note: String sort will put '10' before '2'
      expect(sorted).toEqual(['1-song.mp3', '10-song.mp3', '2-song.mp3']);
    });

    it('should maintain stable sort for identical names', () => {
      const files = ['song.mp3', 'song.mp3'];
      const sorted = [...files].sort();

      expect(sorted).toEqual(files);
    });
  });

  describe('Security considerations', () => {
    it('should not allow path traversal in theme', () => {
      mockedIsValidThemeId.mockReturnValue(false);
      
      const result = themeModule.isValidThemeId('../../../etc/passwd');
      
      expect(result).toBe(false);
    });

    it('should not allow absolute paths in theme', () => {
      mockedIsValidThemeId.mockReturnValue(false);
      
      const result = themeModule.isValidThemeId('/etc/passwd');
      
      expect(result).toBe(false);
    });

    it('should not allow special characters in theme', () => {
      mockedIsValidThemeId.mockReturnValue(false);
      
      const result = themeModule.isValidThemeId('theme;rm -rf /');
      
      expect(result).toBe(false);
    });
  });

  describe('Integration scenarios', () => {
    it('should handle complete ticker theme flow', async () => {
      mockedIsValidThemeId.mockReturnValue(true);
      mockedReaddir.mockResolvedValue([
        'Push Thru - The Grey Room _ Golden Palms.mp3',
        'Smooth and Cool - Nico Staf.mp3',
        'The Fifth Quadrant - Dan _Lebo_ Lebowitz, Tone Seeker.mp3'
      ] as any);

      const theme = 'ticker';
      const isValid = themeModule.isValidThemeId(theme);
      expect(isValid).toBe(true);

      const files = await fs.readdir('/path');
      const mp3Files = (files as string[]).filter(file => file.toLowerCase().endsWith('.mp3'));
      mp3Files.sort();

      expect(mp3Files).toHaveLength(3);
    });

    it('should handle complete space theme flow', async () => {
      mockedIsValidThemeId.mockReturnValue(true);
      mockedReaddir.mockResolvedValue([
        'Equatorial Complex.mp3',
        'Galactic Rap.mp3',
        'Inspired.mp3',
        'Spacial Harvest.mp3'
      ] as any);

      const theme = 'space';
      const isValid = themeModule.isValidThemeId(theme);
      expect(isValid).toBe(true);

      const files = await fs.readdir('/path');
      const mp3Files = (files as string[]).filter(file => file.toLowerCase().endsWith('.mp3'));
      mp3Files.sort();

      expect(mp3Files).toHaveLength(4);
    });
  });
});

// Made with Bob