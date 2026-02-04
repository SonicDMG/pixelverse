import { NextRequest } from 'next/server';
import { validateAndSanitizeQuestion, validateSessionId } from '@/lib/input-validation';

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
  try {
    const body = await request.json();
    const { question, session_id } = body;

    console.log('[Stream Space API] 🚀 Starting streaming request');

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
      return new Response(
        JSON.stringify({ error: `Langflow error: ${response.status}`, details: errorText }),
        { status: response.status, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log('[Stream Space API] ✅ Langflow connection established, streaming...');

    // Pass through the streaming response from Langflow
    // Langflow already sends SSE format, so we just need to set the right headers
    return new Response(response.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('[Stream Space API] ❌ Error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500 }
    );
  }
}

// Made with Bob