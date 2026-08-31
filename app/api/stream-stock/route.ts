import { NextRequest } from 'next/server';
import { validateAndSanitizeQuestion, validateSessionId } from '@/lib/input-validation';
import { trackConnection, releaseConnection, getClientIp, createRateLimitHeaders } from '@/lib/rate-limit';
import { sanitizeError, getClientIp as getErrorClientIp } from '@/lib/error-handling';
import { streamAgent } from '@/services/agent';

/**
 * POST /api/stream-stock
 * Stream stock/ticker responses from the built-in agent.
 * Returns Server-Sent Events (SSE) — same format as the prior Langflow proxy.
 */
export async function POST(request: NextRequest) {
  const clientIp = getClientIp(request.headers);
  const connectionId = `stream-stock-${Date.now()}-${Math.random()}`;

  try {
    console.log('[Stream Stock API] 🚀 Starting streaming request');

    const rateLimitResult = trackConnection(clientIp, connectionId, 5);

    if (!rateLimitResult.success) {
      console.warn('[Stream Stock API] Connection limit exceeded');
      return new Response(
        JSON.stringify({ error: 'Too many concurrent connections. Please try again later.' }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            ...createRateLimitHeaders(rateLimitResult),
          },
        }
      );
    }

    const body = await request.json();
    const { question, session_id } = body;

    const questionValidation = validateAndSanitizeQuestion(question);
    if (!questionValidation.valid) {
      releaseConnection(clientIp, connectionId);
      return new Response(
        JSON.stringify({ error: 'Invalid input. Please check your question and try again.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const sessionValidation = validateSessionId(session_id);
    if (!sessionValidation.valid) {
      releaseConnection(clientIp, connectionId);
      return new Response(
        JSON.stringify({ error: 'Invalid session ID format' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log('[Stream Stock API] Streaming from agent, question:', questionValidation.sanitized);

    const agentStream = streamAgent(questionValidation.sanitized!, 'ticker', session_id);

    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of agentStream) {
            controller.enqueue(new TextEncoder().encode(chunk));
          }
        } finally {
          releaseConnection(clientIp, connectionId);
          controller.close();
        }
      },
      cancel() {
        releaseConnection(clientIp, connectionId);
      },
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        ...createRateLimitHeaders(rateLimitResult),
      },
    });
  } catch (error) {
    releaseConnection(clientIp, connectionId);
    const sanitized = sanitizeError(error, {
      endpoint: request.url,
      ip: getErrorClientIp(request),
    });
    return new Response(
      JSON.stringify({
        error: sanitized.message,
        errorId: sanitized.errorId,
        timestamp: sanitized.timestamp,
      }),
      { status: sanitized.statusCode, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// Made with Bob
