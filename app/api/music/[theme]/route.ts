import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { isValidThemeId } from '@/constants/theme';
import { rateLimit, getClientIp, createRateLimitHeaders, RateLimitPresets } from '@/lib/rate-limit';
import { sanitizeError, getClientIp as getErrorClientIp } from '@/lib/error-handling';

/**
 * GET /api/music/[theme]
 * 
 * Dynamically discovers and returns the list of MP3 music files for a given theme.
 * 
 * @param theme - The theme ID (e.g., 'ticker', 'space')
 * @returns JSON response with array of MP3 filenames
 * 
 * Response format:
 * {
 *   "files": ["song1.mp3", "song2.mp3"]
 * }
 * 
 * Error responses:
 * - 400: Invalid theme ID
 * - 500: File system error (returns empty files array)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ theme: string }> }
) {
  try {
    // Apply rate limiting (20 requests per minute for media endpoints)
    const clientIp = getClientIp(request.headers);
    const rateLimitResult = rateLimit(clientIp, RateLimitPresets.MEDIA);
    
    if (!rateLimitResult.success) {
      console.warn('[Music API] Rate limit exceeded:', {
        ip: clientIp,
        limit: rateLimitResult.limit,
        retryAfter: rateLimitResult.retryAfter,
      });
      
      return NextResponse.json(
        {
          error: 'Too many requests',
          message: 'Rate limit exceeded. Please try again later.',
          files: []
        },
        {
          status: 429,
          headers: createRateLimitHeaders(rateLimitResult),
        }
      );
    }
    
    // Await the params object (Next.js 15+ requirement)
    const { theme } = await params;

    // Validate theme ID
    if (!isValidThemeId(theme)) {
      return NextResponse.json(
        { 
          error: 'Invalid theme ID',
          message: `Theme '${theme}' is not valid. Please use a valid theme identifier.`
        },
        { status: 400 }
      );
    }

    // Construct the path to the music directory for this theme
    // Path is relative to the project root
    const musicDir = path.join(process.cwd(), 'public', 'audio', 'music', theme);

    try {
      // Read the directory contents
      const files = await fs.readdir(musicDir);

      // Filter for MP3 files only (case-insensitive)
      const mp3Files = files.filter(file => 
        file.toLowerCase().endsWith('.mp3')
      );

      // Sort alphabetically for consistent ordering
      mp3Files.sort();

      return NextResponse.json(
        {
          files: mp3Files
        },
        {
          headers: createRateLimitHeaders(rateLimitResult),
        }
      );

    } catch (fsError) {
      // Handle case where directory doesn't exist or can't be read
      const error = fsError as NodeJS.ErrnoException;
      
      if (error.code === 'ENOENT') {
        // Directory doesn't exist - return empty array
        console.warn(`Music directory not found for theme '${theme}': ${musicDir}`);
        return NextResponse.json({
          files: []
        });
      }

      // Other file system errors - sanitize to avoid exposing paths
      const sanitized = sanitizeError(error, {
        endpoint: request.url,
        ip: clientIp,
        additionalInfo: { theme },
      });
      
      return NextResponse.json(
        {
          error: sanitized.message,
          errorId: sanitized.errorId,
          files: []
        },
        { status: sanitized.statusCode }
      );
    }

  } catch (error) {
    // Catch-all for unexpected errors - sanitize to prevent information leakage
    const sanitized = sanitizeError(error, {
      endpoint: request.url,
      ip: getErrorClientIp(request),
    });
    
    return NextResponse.json(
      {
        error: sanitized.message,
        errorId: sanitized.errorId,
        files: []
      },
      { status: sanitized.statusCode }
    );
  }
}

// Made with Bob
