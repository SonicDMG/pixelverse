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
import { isDoclingConfigured, convertWithDocling } from '@/services/rag/docling';

// Accepted MIME types — Docling handles PDF/DOCX/PPTX/images; plain text
// uses our own converter. Anything else is rejected.
const ACCEPTED_MIME: Record<string, 'docling' | 'text'> = {
  'application/pdf': 'docling',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docling',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'docling',
  'application/msword': 'docling',
  'text/plain': 'text',
  'text/markdown': 'text',
  'text/csv': 'text',
};

const MAX_BYTES = 20 * 1024 * 1024; // 20 MB

// ── POST /api/corpus/upload ───────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: 'Expected multipart/form-data' }, { status: 400 });
  }

  const file = formData.get('file') as File | null;
  const title = (formData.get('title') as string | null)?.trim() || '';
  const theme = (formData.get('theme') as string | null)?.trim() || '';

  if (!file) return NextResponse.json({ error: 'file is required' }, { status: 400 });
  if (!title)  return NextResponse.json({ error: 'title is required' }, { status: 400 });
  if (!['space', 'ticker', 'shared'].includes(theme)) {
    return NextResponse.json({ error: 'theme must be space, ticker, or shared' }, { status: 400 });
  }

  const mimeType = file.type || 'application/octet-stream';
  const handler = ACCEPTED_MIME[mimeType];
  if (!handler) {
    return NextResponse.json(
      { error: `Unsupported file type: ${mimeType}. Accepted: PDF, DOCX, PPTX, TXT, MD` },
      { status: 415 }
    );
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: 'File exceeds 20 MB limit' }, { status: 413 });
  }

  // ── Convert to DocLang ────────────────────────────────────────────────────

  let doclang: string;

  if (handler === 'docling') {
    if (!isDoclingConfigured()) {
      return NextResponse.json(
        {
          error: 'Docling is not configured. Set DOCLING_API_URL in .env.local, or upload a plain .txt or .md file instead.',
          docling_required: true,
        },
        { status: 422 }
      );
    }
    try {
      const buffer = Buffer.from(await file.arrayBuffer());
      doclang = await convertWithDocling(buffer, file.name, mimeType);
    } catch (err) {
      console.error('[upload] Docling conversion failed:', err);
      return NextResponse.json(
        { error: `Docling conversion failed: ${err instanceof Error ? err.message : err}` },
        { status: 502 }
      );
    }
  } else {
    // Plain text — wrap in pseudo-DocLang
    const text = await file.text();
    doclang = convertToDocLang(text, title);
  }

  // ── Split + embed + insert ────────────────────────────────────────────────

  const db = getWritableDb();
  const docId = `user-${randomUUID()}`;
  const now = new Date().toISOString();

  insertDocument(db, {
    id: docId,
    title,
    url: undefined,
    source: 'user',
    theme: theme as 'space' | 'ticker' | 'shared',
    created_at: now,
  });

  const rawSections = splitDocLangSections(doclang);
  for (const s of rawSections) {
    insertSection(db, { ...s, doc_id: docId, theme });
  }

  const embeddings = await _embedTexts(rawSections.map(s => s.plain_text));
  for (let i = 0; i < rawSections.length; i++) {
    if (embeddings[i]?.length) insertEmbedding(db, rawSections[i].id, embeddings[i]);
  }

  rebuildFts(db);

  return NextResponse.json({
    id: docId,
    title,
    theme,
    section_count: rawSections.length,
    via_docling: handler === 'docling',
  });
}

// ── Helpers ───────────────────────────────────────────────────────────────────

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
    console.warn('[upload] Embedding failed, skipping vectors:', err);
    return texts.map(() => []);
  }
}

// Made with Bob
