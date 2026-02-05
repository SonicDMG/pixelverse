import { NextRequest } from 'next/server';
import { validateAndSanitizeQuestion, validateSessionId } from '@/lib/input-validation';
import { trackConnection, releaseConnection, getClientIp, createRateLimitHeaders } from '@/lib/rate-limit';
import { sanitizeError, getClientIp as getErrorClientIp } from '@/lib/error-handling';

// Server-side only - no NEXT_PUBLIC_ prefix for security
const LANGFLOW_URL = process.env.LANGFLOW_URL || 'http://localhost:7861';
const LANGFLOW_API_KEY = process.env.LANGFLOW_API_KEY || '';
const FLOW_ID_SPACE = process.env.LANGFLOW_FLOW_ID_SPACE || process.env.LANGFLOW_FLOW_ID || '97cc8b65-0fb1-4f87-8d2b-a2359082f322';

/**
 * POST /api/stream-space
 * Stream space/astronomy responses using Langflow's OpenAI-compatible API
 *
 * Uses the /api/v1/chat/completions endpoint with flow_id parameter
 * Returns Server-Sent Events (SSE) in OpenAI format
 */
export async function POST(request: NextRequest) {
  const clientIp = getClientIp(request.headers);
  const connectionId = `stream-space-${Date.now()}-${Math.random()}`;
  
  try {
    console.log('[Stream Space API] 🚀 Starting streaming request');
    
    // Apply concurrent connection limiting (5 concurrent connections)
    const rateLimitResult = trackConnection(clientIp, connectionId, 5);
    
    if (!rateLimitResult.success) {
      console.warn('[Stream Space API] Connection limit exceeded:', {
        ip: clientIp,
        limit: rateLimitResult.limit,
        retryAfter: rateLimitResult.retryAfter,
      });
      
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

    // Validate and sanitize question input
    const questionValidation = validateAndSanitizeQuestion(question);
    if (!questionValidation.valid) {
      console.warn('[Stream Space API] Question validation failed:', {
        error: questionValidation.error,
        timestamp: new Date().toISOString(),
        ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
      });
      return new Response(
        JSON.stringify({ error: 'Invalid input. Please check your question and try again.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate session_id if provided
    const sessionValidation = validateSessionId(session_id);
    if (!sessionValidation.valid) {
      console.warn('[Stream Space API] Session ID validation failed:', sessionValidation.error);
      return new Response(
        JSON.stringify({ error: 'Invalid session ID format' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log('[Stream Space API] Validation passed');
    console.log('[Stream Space API] Sanitized question:', questionValidation.sanitized);
    console.log('[Stream Space API] Session ID:', session_id);
    console.log('[Stream Space API] Flow ID:', FLOW_ID_SPACE);

    // Use Langflow's standard run endpoint with stream parameter
    const langflowUrl = `${LANGFLOW_URL}/api/v1/run/${FLOW_ID_SPACE}?stream=true`;
    console.log('[Stream Space API] 📡 Langflow URL:', langflowUrl);

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (LANGFLOW_API_KEY) {
      headers['x-api-key'] = LANGFLOW_API_KEY;
    }

    // Make request to Langflow with streaming enabled using sanitized input
    const response = await fetch(langflowUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        input_value: questionValidation.sanitized,
        output_type: 'chat',
        input_type: 'chat',
        session_id: session_id,
      }),
    });

    if (!response.ok) {
      console.error('[Stream Space API] ❌ Langflow error:', response.status);
      const errorText = await response.text();
      console.error('[Stream Space API] Error details:', errorText);
      
      // Sanitize service error
      const error = new Error(`Langflow returned status ${response.status}`);
      const sanitized = sanitizeError(error, {
        endpoint: request.url,
        ip: clientIp,
        additionalInfo: { service: 'Langflow', statusCode: response.status },
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

    console.log('[Stream Space API] ✅ Langflow connection established, streaming...');

    // Create a TransformStream to intercept the stream and release connection on close
    const { readable, writable } = new TransformStream();
    
    // Pipe the response through and handle cleanup
    if (response.body) {
      const reader = response.body.getReader();
      const writer = writable.getWriter();
      
      const pump = async () => {
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) {
              console.log('[Stream Space API] Stream completed, releasing connection');
              releaseConnection(clientIp, connectionId);
              await writer.close();
              break;
            }
            await writer.write(value);
          }
        } catch (error) {
          console.error('[Stream Space API] Stream error, releasing connection:', error);
          releaseConnection(clientIp, connectionId);
          await writer.abort(error);
        }
      };
      
      pump();
    }

    // Pass through the streaming response from Langflow
    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        ...createRateLimitHeaders(rateLimitResult),
      },
    });
  } catch (error) {
    // Release connection on error
    releaseConnection(clientIp, connectionId);
    
    // Sanitize error for client response
    const sanitized = sanitizeError(error, {
      endpoint: request.url,
      ip: clientIp,
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