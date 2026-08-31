import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import OpenAI from 'openai';
import {
  getWritableDb,
  insertDocument,
  insertSection,
  insertEmbedding,
  rebuildFts,
} from '@/services/rag/db';
import { convertToDocLang, splitDocLangSections } from '@/services/rag/doclang';

// ── POST /api/corpus/url ──────────────────────────────────────────────────────
// Body: { url, title?, theme }
// Fetches the URL, strips HTML to plain text, converts to DocLang, embeds, inserts.

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB response cap

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url, title: titleArg, theme } = body as {
      url?: string;
      title?: string;
      theme?: string;
    };

    if (!url?.trim()) {
      return NextResponse.json({ error: 'url is required' }, { status: 400 });
    }
    if (!['space', 'ticker', 'shared'].includes(theme ?? '')) {
      return NextResponse.json({ error: 'theme must be space, ticker, or shared' }, { status: 400 });
    }

    // Validate URL
    let parsed: URL;
    try {
      parsed = new URL(url.trim());
    } catch {
      return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
    }
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return NextResponse.json({ error: 'Only http/https URLs are supported' }, { status: 400 });
    }

    // Fetch
    console.log(`[corpus/url] fetching ${parsed.href}`);
    const resp = await fetch(parsed.href, {
      headers: { 'User-Agent': 'Pixelverse-IngestBot/1.0' },
      redirect: 'follow',
    });
    if (!resp.ok) {
      return NextResponse.json(
        { error: `Fetch failed: HTTP ${resp.status}` },
        { status: 502 }
      );
    }

    const contentType = resp.headers.get('content-type') ?? '';
    const buf = await resp.arrayBuffer();
    if (buf.byteLength > MAX_BYTES) {
      return NextResponse.json({ error: 'Response exceeds 5 MB limit' }, { status: 413 });
    }

    const raw = new TextDecoder().decode(buf);

    // Extract plain text — strip HTML tags if content-type is HTML
    let plainText: string;
    if (contentType.includes('text/html')) {
      plainText = _htmlToText(raw);
    } else {
      // markdown / plain text — use as-is
      plainText = raw;
    }

    plainText = plainText.trim();
    if (!plainText) {
      return NextResponse.json({ error: 'No text content extracted from URL' }, { status: 422 });
    }

    // Derive title: arg → <title> tag → hostname+path
    const title = titleArg?.trim() ||
      _extractHtmlTitle(raw) ||
      `${parsed.hostname}${parsed.pathname}`.slice(0, 120);

    console.log(`[corpus/url] title="${title}" — ${plainText.length} chars`);

    // Convert → DocLang → split → embed → insert
    const doclang = convertToDocLang(plainText, title);
    const rawSections = splitDocLangSections(doclang);

    const db = getWritableDb();
    const docId = `user-${randomUUID()}`;
    const now = new Date().toISOString();

    insertDocument(db, {
      id: docId,
      title,
      url: parsed.href,
      source: 'user',
      theme: theme as 'space' | 'ticker' | 'shared',
      created_at: now,
    });

    for (const s of rawSections) {
      insertSection(db, { ...s, doc_id: docId, theme: theme! });
    }

    const embeddings = await _embedTexts(rawSections.map(s => s.plain_text));
    for (let i = 0; i < rawSections.length; i++) {
      if (embeddings[i]?.length) insertEmbedding(db, rawSections[i].id, embeddings[i]);
    }

    rebuildFts(db);
    console.log(`[corpus/url] ✔ inserted ${rawSections.length} sections for "${title}"`);

    return NextResponse.json({ id: docId, title, theme, section_count: rawSections.length });
  } catch (err) {
    console.error('[POST /api/corpus/url]', err);
    return NextResponse.json({ error: 'Failed to ingest URL' }, { status: 500 });
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Very lightweight HTML → plain text: strip tags, collapse whitespace. */
function _htmlToText(html: string): string {
  return html
    // Remove <script> and <style> blocks entirely
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    // Block elements → newline
    .replace(/<\/?(p|div|section|article|header|footer|h[1-6]|li|tr|br)[^>]*>/gi, '\n')
    // Strip remaining tags
    .replace(/<[^>]+>/g, ' ')
    // Decode common HTML entities
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    // Collapse runs of blank lines
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/** Pull the <title> tag value out of an HTML string. */
function _extractHtmlTitle(html: string): string | null {
  const m = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (!m) return null;
  return m[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim().slice(0, 200) || null;
}

async function _embedTexts(texts: string[]): Promise<number[][]> {
  if (!texts.length) return [];
  try {
    const client = new OpenAI({
      apiKey: process.env.EMBED_API_KEY || process.env.LLM_API_KEY || process.env.OPENAI_API_KEY || '',
      baseURL: process.env.EMBED_BASE_URL || process.env.LLM_BASE_URL || undefined,
    });
    const EMBED_MODEL = process.env.EMBED_MODEL || 'text-embedding-3-small';
    const resp = await client.embeddings.create({ model: EMBED_MODEL, input: texts });
    return resp.data.map(d => d.embedding);
  } catch (err) {
    console.warn('[corpus/url] Embedding failed, skipping vectors:', err);
    return texts.map(() => []);
  }
}

// Made with Bob
