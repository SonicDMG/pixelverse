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
import {
  getDoclingMode,
  isSidecarConfigured, convertWithSidecar,
} from '@/services/rag/docling';

// Accepted MIME types — Docling handles PDF/DOCX/PPTX/images; plain text
// uses our own converter. Anything else is rejected.
const ACCEPTED_MIME: Record<string, 'docling' | 'text'> = {
  'application/pdf': 'docling',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docling',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'docling',
  'application/msword': 'docling',
  'text/markdown': 'docling',
  'text/plain': 'text',
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
  if (!['space', 'ticker', 'shared', 'generalist'].includes(theme)) {
    return NextResponse.json({ error: 'theme must be space, ticker, shared, or generalist' }, { status: 400 });
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

  const kb = (file.size / 1024).toFixed(1);
  console.log(`[upload] ▶ received "${file.name}" (${kb} KB, ${mimeType}) title="${title}" theme=${theme} handler=${handler}`);

  // ── Convert to DocLang ────────────────────────────────────────────────────
  // DOCLING_MODE is the authority:
  //   local — sidecar /convert  (DocumentConverter on-device + export_to_doclang)
  //   saas  — SaaS OCR/layout, sidecar /convert-json (export_to_doclang on DoclingDocument JSON)

  let doclang: string;
  const t0 = Date.now();

  if (handler === 'docling') {
    const buffer = Buffer.from(await file.arrayBuffer());
    const doclingMode = getDoclingMode();

    if (doclingMode === 'local') {
      if (!isSidecarConfigured()) {
        return NextResponse.json(
          { error: 'DOCLING_MODE=local requires DOCLING_SIDECAR_URL to be set in .env.local.' },
          { status: 422 }
        );
      }
      console.log(`[upload] → mode local (sidecar /convert) via ${process.env.DOCLING_SIDECAR_URL}`);
      try {
        doclang = await convertWithSidecar(buffer, file.name, mimeType);
        console.log(`[upload] ✔ sidecar done in ${Date.now() - t0}ms — doclang ${doclang.length} chars`);
      } catch (err) {
        console.error('[upload] ✖ sidecar conversion failed:', err);
        return NextResponse.json(
          { error: `Sidecar conversion failed: ${err instanceof Error ? err.message : err}` },
          { status: 502 }
        );
      }
    } else {
      // saas mode — sidecar calls DoclingServiceClient → export_to_doclang() locally
      if (!isSidecarConfigured()) {
        return NextResponse.json(
          { error: 'DOCLING_MODE=saas requires DOCLING_SIDECAR_URL — the sidecar calls DoclingServiceClient and export_to_doclang().' },
          { status: 422 }
        );
      }
      console.log(`[upload] → mode saas (sidecar /convert-saas) via ${process.env.DOCLING_SIDECAR_URL}`);
      try {
        doclang = await convertWithSidecar(buffer, file.name, mimeType);
        console.log(`[upload] ✔ saas done in ${Date.now() - t0}ms — doclang ${doclang.length} chars`);
      } catch (err) {
        console.error('[upload] ✖ saas conversion failed:', err);
        return NextResponse.json(
          { error: `Docling conversion failed: ${err instanceof Error ? err.message : err}` },
          { status: 502 }
        );
      }
    }
  } else {
    // Plain text — wrap in pseudo-DocLang
    console.log(`[upload] → plain text path (no docling needed)`);
    const text = await file.text();
    doclang = convertToDocLang(text, title);
    console.log(`[upload] ✔ convertToDocLang done in ${Date.now() - t0}ms — doclang ${doclang.length} chars`);
  }

  // ── Split + embed + insert ────────────────────────────────────────────────

  const db = getWritableDb();
  const docId = `user-${randomUUID()}`;
  const now = new Date().toISOString();

  console.log(`[upload] splitting doclang into sections (docId=${docId})`);
  const rawSections = splitDocLangSections(doclang);
  console.log(`[upload] → ${rawSections.length} section(s)`);

  insertDocument(db, {
    id: docId,
    title,
    url: undefined,
    source: 'user',
    theme: theme as 'space' | 'ticker' | 'shared' | 'generalist',
    created_at: now,
  });

  for (const s of rawSections) {
    insertSection(db, { ...s, doc_id: docId, theme });
  }
  console.log(`[upload] sections inserted`);

  console.log(`[upload] embedding ${rawSections.length} section(s)…`);
  const tEmbed = Date.now();
  const embeddings = await _embedTexts(rawSections.map(s => s.plain_text));
  let embeddedCount = 0;
  for (let i = 0; i < rawSections.length; i++) {
    if (embeddings[i]?.length) { insertEmbedding(db, rawSections[i].id, embeddings[i]); embeddedCount++; }
  }
  console.log(`[upload] ✔ ${embeddedCount}/${rawSections.length} embeddings inserted in ${Date.now() - tEmbed}ms`);

  rebuildFts(db);
  console.log(`[upload] ✔ FTS index rebuilt — total ${Date.now() - t0}ms`);

  return NextResponse.json({
    id: docId,
    title,
    theme,
    section_count: rawSections.length,
    via_saas: handler === 'docling' && getDoclingMode() === 'saas',
    via_sidecar: handler === 'docling' && isSidecarConfigured(),
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
