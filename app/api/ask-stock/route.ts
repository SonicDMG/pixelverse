import { NextRequest, NextResponse } from 'next/server';
import { queryLangflow } from '@/services/langflow';
import { validateAndSanitizeQuestion, validateSessionId } from '@/lib/input-validation';

/**
 * API Error response interface
 */
interface ApiErrorResponse {
  error: string;
  details?: string;
}

export async function POST(request: NextRequest) {
  try {
    console.log('[Stock API] Received POST request');
    const body = await request.json();
    const { question, session_id } = body;
    console.log('[Stock API] Raw question from body:', question);

    // Validate and sanitize question input using comprehensive validation
    const questionValidation = validateAndSanitizeQuestion(question);
    if (!questionValidation.valid) {
      console.warn('[Stock API] Question validation failed:', {
        error: questionValidation.error,
        timestamp: new Date().toISOString(),
        ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
      });
      return NextResponse.json<ApiErrorResponse>(
        { error: 'Invalid input. Please check your question and try again.' },
        { status: 400 }
      );
    }

    // Validate session_id if provided
    const sessionValidation = validateSessionId(session_id);
    if (!sessionValidation.valid) {
      console.warn('[Stock API] Session ID validation failed:', sessionValidation.error);
      return NextResponse.json<ApiErrorResponse>(
        { error: 'Invalid session ID format' },
        { status: 400 }
      );
    }

    console.log('[Stock API] Validation passed. Sanitized question:', questionValidation.sanitized);
    console.log('[Stock API] Session ID provided:', !!session_id);

    // Query Langflow with sanitized input using the 'ticker' theme
    // Pass session_id for conversation tracking (backward compatible - optional parameter)
    const result = await queryLangflow(questionValidation.sanitized!, 'ticker', session_id);

    if (result.error) {
      return NextResponse.json<ApiErrorResponse>(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('API route error:', error);
    
    // Provide more context in development
    const errorMessage = process.env.NODE_ENV === 'development' && error instanceof Error
      ? error.message
      : 'Internal server error';
    
    const response: ApiErrorResponse = {
      error: 'Internal server error',
    };

    if (process.env.NODE_ENV === 'development') {
      response.details = errorMessage;
    }

    return NextResponse.json(response, { status: 500 });
  }
}

// Made with Bob
