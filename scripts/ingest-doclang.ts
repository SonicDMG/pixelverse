/**
 * Ingest DocLang documentation into the corpus.
 * Reads pre-downloaded files from /tmp/doclang-corpus/ and POSTs them
 * directly to the RAG DB using the same pipeline as the upload API route,
 * bypassing HTTP auth.
 *
 * Usage:
 *   npx tsx scripts/ingest-doclang.ts
 */

import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';
import { randomUUID } from 'crypto';
import {
  getWritableDb,
  insertDocument,
  insertSection,
  insertEmbedding,
  rebuildFts,
} from '../services/rag/db';
import { convertToDocLang, splitDocLangSections } from '../services/rag/doclang';

const DOCS: Array<{ file: string; title: string }> = [
  { file: '/tmp/doclang-corpus/spec.md',              title: 'DocLang Specification (spec.md)' },
  { file: '/tmp/doclang-corpus/README.md',            title: 'DocLang README' },
  { file: '/tmp/doclang-corpus/CHANGELOG.md',         title: 'DocLang CHANGELOG' },
  { file: '/tmp/doclang-corpus/CONTRIBUTING.md',      title: 'DocLang CONTRIBUTING' },
  { file: '/tmp/doclang-corpus/form-examples.md',     title: 'DocLang Form Examples' },
  { file: '/tmp/doclang-corpus/blog-label-studio.txt', title: 'DocLang Blog: Label Studio Support (Aug 2026)' },
];

async function embedTexts(texts: string[]): Promise<number[][]> {
  if (!texts.length) return [];
  try {
    const client = new OpenAI({
      apiKey: process.env.EMBED_API_KEY || process.env.LLM_API_KEY || process.env.OPENAI_API_KEY || '',
      baseURL: process.env.EMBED_BASE_URL || process.env.LLM_BASE_URL || undefined,
    });
    const model = process.env.EMBED_MODEL || 'text-embedding-3-small';
    const resp = await client.embeddings.create({ model, input: texts });
    return resp.data.map(d => d.embedding);
  } catch (err) {
    console.warn('  ⚠ Embedding failed, skipping vectors:', err);
    return texts.map(() => []);
  }
}

async function main() {
  // Load .env.local
  const envPath = path.join(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
    for (const line of lines) {
      const m = line.match(/^([^#=]+)=(.*)$/);
      if (m) process.env[m[1].trim()] ??= m[2].trim().replace(/^["']|["']$/g, '');
    }
  }

  const db = getWritableDb();
  const now = new Date().toISOString();

  for (const { file, title } of DOCS) {
    if (!fs.existsSync(file)) {
      console.warn(`  ✖ Missing: ${file} — skipping`);
      continue;
    }

    const text = fs.readFileSync(file, 'utf-8');
    console.log(`\n▶ ${title}  (${(text.length / 1024).toFixed(1)} KB)`);

    const docId = `doclang-${randomUUID()}`;
    const doclang = convertToDocLang(text, title);
    const rawSections = splitDocLangSections(doclang);
    console.log(`  → ${rawSections.length} section(s)`);

    insertDocument(db, {
      id: docId,
      title,
      url: `https://github.com/doclang-project/doclang/blob/main/${path.basename(file)}`,
      source: 'doclang-project',
      theme: 'generalist',
      created_at: now,
    });

    for (const s of rawSections) {
      insertSection(db, { ...s, doc_id: docId, theme: 'generalist' });
    }

    console.log(`  → embedding ${rawSections.length} section(s)…`);
    // Embed in batches of 20 to stay within token limits
    const BATCH = 20;
    let embedded = 0;
    for (let i = 0; i < rawSections.length; i += BATCH) {
      const batch = rawSections.slice(i, i + BATCH);
      const vecs = await embedTexts(batch.map(s => s.plain_text));
      for (let j = 0; j < batch.length; j++) {
        if (vecs[j]?.length) { insertEmbedding(db, batch[j].id, vecs[j]); embedded++; }
      }
      process.stdout.write(`  → ${Math.min(i + BATCH, rawSections.length)}/${rawSections.length} embedded\r`);
    }
    console.log(`  ✔ ${embedded}/${rawSections.length} vectors inserted`);
  }

  console.log('\n→ Rebuilding FTS index…');
  rebuildFts(db);
  console.log('✔ Done.');
}

main().catch(err => { console.error(err); process.exit(1); });

// Made with Bob
