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

// ── GET /api/corpus ───────────────────────────────────────────────────────────
// Returns all documents with section counts, grouped by theme.

export async function GET() {
  try {
    const db = getWritableDb();

    const rows = db.prepare(`
      SELECT d.id, d.title, d.url, d.source, d.theme, d.created_at,
             COUNT(s.id) AS section_count
      FROM documents d
      LEFT JOIN sections s ON s.doc_id = d.id
      GROUP BY d.id
      ORDER BY d.theme, d.title
    `).all() as Array<{
      id: string;
      title: string;
      url: string | null;
      source: string;
      theme: string;
      created_at: string;
      section_count: number;
    }>;

    // Group by theme
    const grouped: Record<string, typeof rows> = {};
    for (const row of rows) {
      if (!grouped[row.theme]) grouped[row.theme] = [];
      grouped[row.theme].push(row);
    }

    return NextResponse.json({ documents: rows, grouped });
  } catch (err) {
    console.error('[GET /api/corpus]', err);
    return NextResponse.json({ error: 'Failed to load corpus' }, { status: 500 });
  }
}

// ── POST /api/corpus ──────────────────────────────────────────────────────────
// Accepts { title, theme, text }, splits + embeds + inserts.

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, theme, text } = body as { title?: string; theme?: string; text?: string };

    if (!title?.trim() || !theme?.trim() || !text?.trim()) {
      return NextResponse.json({ error: 'title, theme, and text are required' }, { status: 400 });
    }
    if (!['space', 'ticker', 'shared'].includes(theme)) {
      return NextResponse.json({ error: 'theme must be space, ticker, or shared' }, { status: 400 });
    }

    const db = getWritableDb();
    const docId = `user-${randomUUID()}`;
    const now = new Date().toISOString();

    // Insert document
    insertDocument(db, {
      id: docId,
      title: title.trim(),
      url: undefined,
      source: 'user',
      theme: theme as 'space' | 'ticker' | 'shared',
      created_at: now,
    });

    // Convert plain text → pseudo-DocLang sections
    const sections = _splitTextToSections(text.trim(), docId, theme);

    for (const s of sections) {
      insertSection(db, s);
    }

    // Embed sections
    const embeddings = await _embedTexts(sections.map(s => s.plain_text));
    for (let i = 0; i < sections.length; i++) {
      if (embeddings[i]) insertEmbedding(db, sections[i].id, embeddings[i]);
    }

    // Rebuild FTS
    rebuildFts(db);

    return NextResponse.json({
      id: docId,
      title: title.trim(),
      theme,
      section_count: sections.length,
    });
  } catch (err) {
    console.error('[POST /api/corpus]', err);
    return NextResponse.json({ error: 'Failed to ingest document' }, { status: 500 });
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

interface SectionRow {
  id: string;
  doc_id: string;
  heading: string | null;
  doclang: string;
  plain_text: string;
  page_num: number | null;
  seq: number;
  theme: string;
}

/** Split plain text by double-newline paragraphs; keep chunks ≤ 800 chars. */
function _splitTextToSections(text: string, docId: string, theme: string): SectionRow[] {
  const paragraphs = text.split(/\n{2,}/).map(p => p.trim()).filter(Boolean);
  const sections: SectionRow[] = [];
  let seq = 0;
  let buf = '';

  const flush = () => {
    if (!buf.trim()) return;
    const esc = buf.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    sections.push({
      id: randomUUID(),
      doc_id: docId,
      heading: null,
      doclang: `<text>${esc}</text>`,
      plain_text: buf.trim(),
      page_num: 1,
      seq: seq++,
      theme,
    });
    buf = '';
  };

  for (const para of paragraphs) {
    if ((buf + '\n\n' + para).length > 800 && buf) flush();
    buf = buf ? buf + '\n\n' + para : para;
  }
  flush();

  return sections;
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
    console.warn('[corpus] Embedding failed, skipping vectors:', err);
    return texts.map(() => []);
  }
}

// Made with Bob
