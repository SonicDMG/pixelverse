/**
 * Agent client — LLM call with RAG context → structured JSON component output.
 *
 * Replaces services/langflow/client.ts.
 * The returned shape matches StockQueryResult so DynamicUIRenderer is unchanged.
 *
 * Flow:
 *   1. Embed the question (text-embedding-3-small or compatible)
 *   2. Hybrid search against the RAG corpus DB
 *   3. Build DocLang context string from top-N sections
 *   4. Call LLM with system prompt + context + question
 *   5. Parse the JSON response → StockQueryResult
 */

import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { jsonrepair } from 'jsonrepair';
import { getDb, hybridSearch, buildContext } from '@/services/rag';
import { SPACE_SYSTEM_PROMPT, TICKER_SYSTEM_PROMPT } from './prompts';
import type { StockQueryResult, ReferenceSource } from '@/types';
import type { SectionResult } from '@/services/rag';

export type AgentTheme = 'space' | 'ticker';

// ── Provider detection ────────────────────────────────────────────────────

const isStrata = () => process.env.LLM_PROVIDER === 'strata';

// ── OpenAI client (default / non-strata) ──────────────────────────────────

function getOpenAI(): OpenAI {
  return new OpenAI({
    apiKey: process.env.LLM_API_KEY || process.env.OPENAI_API_KEY || '',
    baseURL: process.env.LLM_BASE_URL || undefined,
  });
}

// ── Anthropic client (strata provider — uses /v1/messages wire) ───────────

function getAnthropic(): Anthropic {
  return new Anthropic({
    apiKey: process.env.LLM_API_KEY || process.env.STRATA_API_KEY || 'sk-local',
    baseURL: process.env.LLM_BASE_URL || process.env.STRATA_BASE_URL || undefined,
  });
}

function getEmbedClient(): OpenAI {
  return new OpenAI({
    apiKey: process.env.EMBED_API_KEY || process.env.LLM_API_KEY || process.env.OPENAI_API_KEY || '',
    baseURL: process.env.EMBED_BASE_URL || process.env.LLM_BASE_URL || undefined,
  });
}

const LLM_MODEL = () => process.env.LLM_MODEL || 'gpt-4o-mini';
const EMBED_MODEL = () => process.env.EMBED_MODEL || 'text-embedding-3-small';

// ── Embedding ──────────────────────────────────────────────────────────────

async function embedQuery(text: string): Promise<number[]> {
  try {
    const client = getEmbedClient();
    const resp = await client.embeddings.create({
      model: EMBED_MODEL(),
      input: text,
    });
    return resp.data[0].embedding;
  } catch (err) {
    console.warn('[Agent] Embedding failed, falling back to FTS-only search:', err);
    return [];
  }
}

// ── RAG context retrieval ──────────────────────────────────────────────────

function formatReferences(sections: SectionResult[]): ReferenceSource[] {
  return sections.map((s) => ({
    title: s.title,
    heading: s.heading ?? null,
    pageNum: s.page_num ?? null,
    url: s.url ?? undefined,
    excerpt: (s.plain_text || '')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 220),
    doclang: s.doclang,
  }));
}

async function retrieveContext(
  question: string,
  theme: AgentTheme
): Promise<{ context: string; references: ReferenceSource[] }> {
  try {
    const db = getDb();
    const embedding = await embedQuery(question);
    const sections = hybridSearch(db, question, embedding, { theme, limit: 8 });
    return {
      context: buildContext(sections),
      references: formatReferences(sections),
    };
  } catch (err) {
    console.warn('[Agent] RAG retrieval failed, proceeding without context:', err);
    return { context: '', references: [] };
  }
}

// ── LLM call (non-streaming) ───────────────────────────────────────────────

export async function queryAgent(
  question: string,
  theme: AgentTheme = 'space',
  _sessionId?: string   // kept for API compatibility; not needed without Langflow
): Promise<StockQueryResult> {
  const systemPrompt = theme === 'space' ? SPACE_SYSTEM_PROMPT : TICKER_SYSTEM_PROMPT;

  try {
    const { context, references } = await retrieveContext(question, theme);
    const userContent = context
      ? `Context:\n${context}\n\nQuestion: ${question}`
      : `Question: ${question}`;

    let raw: string;

    if (isStrata()) {
      const anthropic = getAnthropic();
      const msg = await anthropic.messages.create({
        model: LLM_MODEL(),
        max_tokens: 4096,
        system: systemPrompt,
        messages: [{ role: 'user', content: userContent }],
      });
      raw = msg.content[0]?.type === 'text' ? msg.content[0].text : '';
    } else {
      const openai = getOpenAI();
      const completion = await openai.chat.completions.create({
        model: LLM_MODEL(),
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userContent },
        ],
        temperature: 0.2,
        response_format: { type: 'json_object' },
      });
      raw = completion.choices[0]?.message?.content ?? '';
    }

    return _parseResponse(raw, question, references);
  } catch (err) {
    console.error('[Agent] queryAgent error:', err);
    return {
      answer: '',
      error: 'Service temporarily unavailable. Please try again later.',
    };
  }
}

// ── LLM call (streaming) — yields SSE lines ────────────────────────────────

export async function* streamAgent(
  question: string,
  theme: AgentTheme = 'space',
  _sessionId?: string
): AsyncGenerator<string> {
  const systemPrompt = theme === 'space' ? SPACE_SYSTEM_PROMPT : TICKER_SYSTEM_PROMPT;

  try {
    const { context, references } = await retrieveContext(question, theme);
    const userContent = context
      ? `Context:\n${context}\n\nQuestion: ${question}`
      : `Question: ${question}`;

    let accumulated = '';

    if (isStrata()) {
      const anthropic = getAnthropic();
      const stream = anthropic.messages.stream({
        model: LLM_MODEL(),
        max_tokens: 4096,
        system: systemPrompt,
        messages: [{ role: 'user', content: userContent }],
      });

      for await (const event of stream) {
        if (
          event.type === 'content_block_delta' &&
          event.delta.type === 'text_delta'
        ) {
          const token = event.delta.text;
          accumulated += token;
          yield JSON.stringify({ event: 'token', data: { chunk: token } }) + '\n';
        }
      }
    } else {
      const openai = getOpenAI();
      const stream = await openai.chat.completions.create({
        model: LLM_MODEL(),
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userContent },
        ],
        temperature: 0.2,
        stream: true,
        stream_options: { include_usage: true },
      });

      for await (const chunk of stream) {
        const token = chunk.choices[0]?.delta?.content ?? '';
        if (token) {
          accumulated += token;
          yield JSON.stringify({ event: 'token', data: { chunk: token } }) + '\n';
        }
      }
    }

    // Emit final parsed result as the end event
    const result = _parseResponse(accumulated, question, references);
    yield JSON.stringify({ event: 'end', data: { result } }) + '\n';

  } catch (err) {
    console.error('[Agent] streamAgent error:', err);
    yield JSON.stringify({ event: 'error', data: { error: 'Service temporarily unavailable.' } }) + '\n';
  }
}

// ── Response parsing ───────────────────────────────────────────────────────

function _parseResponse(
  raw: string,
  question: string,
  references?: ReferenceSource[]
): StockQueryResult {
  const refs = references && references.length > 0 ? references : undefined;

  try {
    const repaired = jsonrepair(raw.trim());
    const parsed = JSON.parse(repaired);

    if (parsed && Array.isArray(parsed.components)) {
      return {
        answer: parsed.answer || parsed.text || raw,
        components: parsed.components,
        symbol: _extractSymbol(question),
        references: refs,
      };
    }

    // Response was valid JSON but no components — plain text answer
    return {
      answer: parsed.answer || parsed.text || raw,
      symbol: _extractSymbol(question),
      references: refs,
    };
  } catch {
    // Not JSON — return as plain text
    return {
      answer: raw,
      symbol: _extractSymbol(question),
      references: refs,
    };
  }
}

function _extractSymbol(question: string): string | undefined {
  const m = question.match(/\b([A-Z]{1,5})\b/);
  return m ? m[1] : undefined;
}

// Made with Bob
