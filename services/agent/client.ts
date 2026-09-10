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
import { jsonrepair } from 'jsonrepair';
import { getDb, hybridSearch, hybridSearchAll, hybridSearchByIds, buildContext, fetchDocSections } from '@/services/rag';
import { SPACE_SYSTEM_PROMPT, TICKER_SYSTEM_PROMPT, GENERALIST_SYSTEM_PROMPT } from './prompts';
import type { StockQueryResult, ReferenceSource } from '@/types';
import type { SectionResult } from '@/services/rag';

export type AgentTheme = 'space' | 'ticker' | 'generalist';

// ── Provider detection ────────────────────────────────────────────────────

const isStrata = () => process.env.LLM_PROVIDER === 'strata';
const isCacheControlEnabled = () => process.env.NEXT_PUBLIC_ENABLE_CACHE_CONTROL === 'true';

// ── Strata helpers — raw fetch to /v1/messages (Anthropic wire) ───────────

function strataHeaders() {
  return {
    'content-type': 'application/json',
    'anthropic-version': '2023-06-01',
    'Authorization': `Bearer ${process.env.LLM_API_KEY || ''}`,
  };
}

function strataBaseUrl() {
  return (process.env.LLM_BASE_URL || '').replace(/\/v1\/?$/, '').replace(/\/$/, '');
}

// ── OpenAI client (default / non-strata) ──────────────────────────────────

function getOpenAI(): OpenAI {
  return new OpenAI({
    apiKey: process.env.LLM_API_KEY || process.env.OPENAI_API_KEY || '',
    baseURL: process.env.LLM_BASE_URL || undefined,
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

interface RetrievedContextResult {
  pinnedContext: string;
  ragContext: string;
  references: ReferenceSource[];
}

async function retrieveContext(
  question: string,
  theme: AgentTheme,
  docIds?: string[],
  cachedDocIds?: string[]
): Promise<RetrievedContextResult> {
  try {
    const db = getDb();
    const embedding = await embedQuery(question);

    // ── RAG retrieval ────────────────────────────────────────────────────────
    // Generalist with explicit selection → filter by doc IDs
    // Generalist with no selection → search all themes
    // Space / ticker → filter by theme as usual
    const ragSections =
      theme === 'generalist' && docIds && docIds.length > 0
        ? hybridSearchByIds(db, question, embedding, { docIds, limit: 8 })
        : theme === 'generalist'
          ? hybridSearchAll(db, question, embedding, { limit: 8 })
          : hybridSearch(db, question, embedding, { theme, limit: 8 });

    // ── Cache: full document text ────────────────────────────────────────────
    // When the user pins specific docs, load ALL their sections into the prompt
    // ahead of RAG hits so the LLM has complete access to their content.
    const cachedSections =
      cachedDocIds && cachedDocIds.length > 0
        ? fetchDocSections(db, cachedDocIds)
        : [];

    // Deduplicate: cached sections take precedence; skip any RAG hit whose
    // section id already appears in the cached set.
    const cachedIds = new Set(cachedSections.map(s => s.id));
    const dedupedRag = ragSections.filter(s => !cachedIds.has(s.id));

    const pinnedContext = cachedSections.length > 0 ? buildContext(cachedSections) : '';
    const ragContext = dedupedRag.length > 0 ? buildContext(dedupedRag) : '';

    const allSections = [...cachedSections, ...dedupedRag];
    return {
      pinnedContext,
      ragContext,
      references: formatReferences(allSections),
    };
  } catch (err) {
    console.warn('[Agent] RAG retrieval failed, proceeding without context:', err);
    return { pinnedContext: '', ragContext: '', references: [] };
  }
}

// ── LLM call (non-streaming) ───────────────────────────────────────────────

export async function queryAgent(
  question: string,
  theme: AgentTheme = 'space',
  _sessionId?: string,   // kept for API compatibility; not needed without Langflow
  docIds?: string[],
  cachedDocIds?: string[]
): Promise<StockQueryResult> {
  const baseSystemPrompt =
    theme === 'space'       ? SPACE_SYSTEM_PROMPT :
    theme === 'ticker'      ? TICKER_SYSTEM_PROMPT :
                              GENERALIST_SYSTEM_PROMPT;

  try {
    const { pinnedContext, ragContext, references } = await retrieveContext(question, theme, docIds, cachedDocIds);

    let raw: string;

    if (isStrata()) {
      const useCache = isCacheControlEnabled();

      // System array: Base prompt first, then pinned/cached document context as a separate block.
      // This ensures the System Prompt + Pinned Context forms a stable, identical cache prefix.
      const systemBlocks: Array<{ type: 'text'; text: string; cache_control?: { type: 'ephemeral'; ttl?: number } }> = [
        {
          type: 'text',
          text: baseSystemPrompt,
          ...(useCache && !pinnedContext ? { cache_control: { type: 'ephemeral', ttl: 3600 } } : {}),
        },
      ];

      if (pinnedContext) {
        systemBlocks.push({
          type: 'text',
          text: `\n\n[PINNED DOCUMENT CONTEXT]\nThe following documents are pinned as full context:\n\n${pinnedContext}`,
          ...(useCache ? { cache_control: { type: 'ephemeral', ttl: 3600 } } : {}),
        });
      }

      // User message: Dynamic RAG sections (if any) followed by the question.
      const userBlocks: Array<{ type: 'text'; text: string; cache_control?: { type: 'ephemeral'; ttl?: number } }> = [];
      if (ragContext) {
        userBlocks.push({
          type: 'text',
          text: `[RETRIEVED SECTIONS]\n${ragContext}\n\n`,
        });
      }
      userBlocks.push({
        type: 'text',
        text: `Question: ${question}`,
      });

      const res = await fetch(`${strataBaseUrl()}/v1/messages`, {
        method: 'POST',
        headers: strataHeaders(),
        body: JSON.stringify({
          model: LLM_MODEL(),
          max_tokens: 4096,
          system: systemBlocks,
          messages: [{
            role: 'user',
            content: userBlocks,
          }],
        }),
      });
      const json = await res.json() as { content?: Array<{ type: string; text: string }> };
      raw = json.content?.[0]?.type === 'text' ? json.content[0].text : '';
    } else {
      const openai = getOpenAI();
      const combinedSystem = pinnedContext
        ? `${baseSystemPrompt}\n\n[PINNED DOCUMENT CONTEXT]\n${pinnedContext}`
        : baseSystemPrompt;

      const userContent = ragContext
        ? `[RETRIEVED SECTIONS]\n${ragContext}\n\nQuestion: ${question}`
        : `Question: ${question}`;

      const completion = await openai.chat.completions.create({
        model: LLM_MODEL(),
        messages: [
          { role: 'system', content: combinedSystem },
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
  _sessionId?: string,
  docIds?: string[],
  cachedDocIds?: string[]
): AsyncGenerator<string> {
  const baseSystemPrompt =
    theme === 'space'       ? SPACE_SYSTEM_PROMPT :
    theme === 'ticker'      ? TICKER_SYSTEM_PROMPT :
                              GENERALIST_SYSTEM_PROMPT;

  try {
    const { pinnedContext, ragContext, references } = await retrieveContext(question, theme, docIds, cachedDocIds);

    let accumulated = '';

    if (isStrata()) {
      const useCache = isCacheControlEnabled();

      // System array: Base prompt first, then pinned/cached document context as a separate block.
      // This ensures the System Prompt + Pinned Context forms a stable, identical cache prefix.
      const systemBlocks: Array<{ type: 'text'; text: string; cache_control?: { type: 'ephemeral'; ttl?: number } }> = [
        {
          type: 'text',
          text: baseSystemPrompt,
          ...(useCache && !pinnedContext ? { cache_control: { type: 'ephemeral', ttl: 3600 } } : {}),
        },
      ];

      if (pinnedContext) {
        systemBlocks.push({
          type: 'text',
          text: `\n\n[PINNED DOCUMENT CONTEXT]\nThe following documents are pinned as full context:\n\n${pinnedContext}`,
          ...(useCache ? { cache_control: { type: 'ephemeral', ttl: 3600 } } : {}),
        });
      }

      // User message: Dynamic RAG sections (if any) followed by the question.
      const userBlocks: Array<{ type: 'text'; text: string; cache_control?: { type: 'ephemeral'; ttl?: number } }> = [];
      if (ragContext) {
        userBlocks.push({
          type: 'text',
          text: `[RETRIEVED SECTIONS]\n${ragContext}\n\n`,
        });
      }
      userBlocks.push({
        type: 'text',
        text: `Question: ${question}`,
      });

      const res = await fetch(`${strataBaseUrl()}/v1/messages`, {
        method: 'POST',
        headers: strataHeaders(),
        body: JSON.stringify({
          model: LLM_MODEL(),
          max_tokens: 4096,
          stream: true,
          system: systemBlocks,
          messages: [{
            role: 'user',
            content: userBlocks,
          }],
        }),
      });

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let buf = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const lines = buf.split('\n');
        buf = lines.pop() ?? '';
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6).trim();
          if (data === '[DONE]') continue;
          try {
            const evt = JSON.parse(data) as { type: string; delta?: { type: string; text: string } };
            if (evt.type === 'content_block_delta' && evt.delta?.type === 'text_delta') {
              const token = evt.delta.text;
              accumulated += token;
              yield JSON.stringify({ event: 'token', data: { chunk: token } }) + '\n';
            }
          } catch { /* skip malformed lines */ }
        }
      }
    } else {
      const openai = getOpenAI();
      const combinedSystem = pinnedContext
        ? `${baseSystemPrompt}\n\n[PINNED DOCUMENT CONTEXT]\n${pinnedContext}`
        : baseSystemPrompt;

      const userContent = ragContext
        ? `[RETRIEVED SECTIONS]\n${ragContext}\n\nQuestion: ${question}`
        : `Question: ${question}`;

      const stream = await openai.chat.completions.create({
        model: LLM_MODEL(),
        messages: [
          { role: 'system', content: combinedSystem },
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
