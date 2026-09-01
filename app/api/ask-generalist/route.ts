import { NextRequest, NextResponse } from 'next/server';
import { queryAgent } from '@/services/agent';
import { validateAndSanitizeQuestion, validateSessionId } from '@/lib/input-validation';
import { rateLimit, getClientIp, createRateLimitHeaders, RateLimitPresets } from '@/lib/rate-limit';
import { sanitizeError, getClientIp as getErrorClientIp } from '@/lib/error-handling';

interface ApiErrorResponse {
  error: string;
  details?: string;
}

export async function POST(request: NextRequest) {
  try {
    console.log('[Generalist API] Received POST request');

    const clientIp = getClientIp(request.headers);
    const rateLimitResult = rateLimit(clientIp, RateLimitPresets.AI_QUERY);

    if (!rateLimitResult.success) {
      console.warn('[Generalist API] Rate limit exceeded:', {
        ip: clientIp,
        limit: rateLimitResult.limit,
        retryAfter: rateLimitResult.retryAfter,
      });
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429, headers: createRateLimitHeaders(rateLimitResult) }
      );
    }

    const body = await request.json();
    const { question, session_id, doc_ids } = body;
    console.log('[Generalist API] Raw question from body:', question);
    if (Array.isArray(doc_ids)) {
      console.log(`[Generalist API] doc_ids filter: ${doc_ids.length} doc(s)`);
    }

    const questionValidation = validateAndSanitizeQuestion(question);
    if (!questionValidation.valid) {
      console.warn('[Generalist API] Question validation failed:', {
        error: questionValidation.error,
        timestamp: new Date().toISOString(),
        ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      });
      return NextResponse.json<ApiErrorResponse>(
        { error: 'Invalid input. Please check your question and try again.' },
        { status: 400 }
      );
    }

    const sessionValidation = validateSessionId(session_id);
    if (!sessionValidation.valid) {
      console.warn('[Generalist API] Session ID validation failed:', sessionValidation.error);
      return NextResponse.json<ApiErrorResponse>(
        { error: 'Invalid session ID format' },
        { status: 400 }
      );
    }

    console.log('[Generalist API] Validation passed. Sanitized question:', questionValidation.sanitized);

    const docIds = Array.isArray(doc_ids) ? doc_ids as string[] : undefined;
    const result = await queryAgent(questionValidation.sanitized!, 'generalist', session_id, docIds);

    if (result.error) {
      return NextResponse.json<ApiErrorResponse>({ error: result.error }, { status: 500 });
    }

    return NextResponse.json(result, { headers: createRateLimitHeaders(rateLimitResult) });
  } catch (error) {
    const sanitized = sanitizeError(error, {
      endpoint: request.url,
      ip: getErrorClientIp(request),
    });
    return NextResponse.json(
      { error: sanitized.message, errorId: sanitized.errorId, timestamp: sanitized.timestamp },
      { status: sanitized.statusCode }
    );
  }
}

// Made with Bob
