/**
 * RAG database — SQLite WAL + sqlite-vec
 *
 * Schema:
 *   documents   — one row per ingested corpus document
 *   sections    — DocLang sections split from each document
 *   sections_fts — FTS5 virtual table for keyword search
 *   vec_sections — sqlite-vec virtual table for ANN vector search
 *
 * This DB is built once by scripts/ingest-corpus.ts and then read-only at
 * runtime by the Next.js API routes.  It is checked in (or mounted) as a
 * static asset — no migrations run at query time.
 */

import Database from 'better-sqlite3';
import * as sqliteVec from 'sqlite-vec';
import path from 'path';
import fs from 'fs';

// Default path: data/corpus.db in the project root.
// Override with RAG_DB_PATH env var.
const DEFAULT_DB_PATH = path.join(process.cwd(), 'data', 'corpus.db');

let _db: Database.Database | null = null;

/**
 * Return a singleton SQLite connection with sqlite-vec loaded.
 * Connection is opened lazily on first call and reused across requests.
 * The DB file must already exist (built by ingest-corpus.ts).
 */
export function getDb(): Database.Database {
  if (_db) return _db;

  const dbPath = process.env.RAG_DB_PATH || DEFAULT_DB_PATH;

  if (!fs.existsSync(dbPath)) {
    throw new Error(
      `RAG corpus DB not found at ${dbPath}. ` +
      `Run: npx tsx scripts/ingest-corpus.ts`
    );
  }

  const db = new Database(dbPath, { readonly: true });
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  sqliteVec.load(db);

  _db = db;
  return _db;
}

/**
 * Open a writable connection for the ingest script.
 * Creates the DB file and parent directories if they don't exist.
 * Applies the schema and returns the connection.
 */
export function openWritable(dbPath?: string): Database.Database {
  const p = dbPath || process.env.RAG_DB_PATH || DEFAULT_DB_PATH;

  const dir = path.dirname(p);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const db = new Database(p);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  sqliteVec.load(db);

  applySchema(db);
  return db;
}

/**
 * Apply the full schema idempotently.
 * Safe to call on an existing DB — all statements use IF NOT EXISTS.
 */
export function applySchema(db: Database.Database): void {
  db.exec(`
    -- One row per source document (Wikipedia article, star catalog, etc.)
    CREATE TABLE IF NOT EXISTS documents (
      id          TEXT PRIMARY KEY,
      title       TEXT NOT NULL,
      url         TEXT,
      source      TEXT NOT NULL,   -- 'wikipedia' | 'star_catalog' | 'financial'
      theme       TEXT NOT NULL,   -- 'space' | 'ticker' | 'shared'
      created_at  TEXT NOT NULL
    );

    -- One row per logical section split from a document.
    -- doclang: raw DocLang XML passed to LLM as context
    -- plain_text: stripped text used for FTS + embedding
    CREATE TABLE IF NOT EXISTS sections (
      id          TEXT PRIMARY KEY,
      doc_id      TEXT NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
      heading     TEXT,
      doclang     TEXT NOT NULL,
      plain_text  TEXT NOT NULL,
      page_num    INTEGER,
      seq         INTEGER NOT NULL,
      theme       TEXT NOT NULL    -- denormalised for fast per-theme queries
    );

    -- FTS5 full-text search over section plain_text.
    CREATE VIRTUAL TABLE IF NOT EXISTS sections_fts USING fts5(
      plain_text,
      content=sections,
      content_rowid=rowid,
      tokenize='unicode61 remove_diacritics 1'
    );

    -- sqlite-vec ANN search over section embeddings.
    -- Dimension matches EMBED_MODEL: 768 for nomic-embed-text, 1536 for text-embedding-3-small.
    CREATE VIRTUAL TABLE IF NOT EXISTS vec_sections USING vec0(
      section_id TEXT PRIMARY KEY,
      embedding  FLOAT[768]
    );
  `);
}

// ── Types ──────────────────────────────────────────────────────────────────

export interface Document {
  id: string;
  title: string;
  url?: string;
  source: string;
  theme: 'space' | 'ticker' | 'shared';
  created_at: string;
}

export interface Section {
  id: string;
  doc_id: string;
  heading: string | null;
  doclang: string;
  plain_text: string;
  page_num: number | null;
  seq: number;
  theme: string;
}

export interface SectionResult extends Section {
  title: string;    // from joined documents.title
  url?: string;     // from joined documents.url
  rank?: number;    // FTS BM25 rank
}

// ── Write helpers (used by ingest script) ─────────────────────────────────

export function insertDocument(db: Database.Database, doc: Document): void {
  db.prepare(`
    INSERT OR REPLACE INTO documents (id, title, url, source, theme, created_at)
    VALUES (@id, @title, @url, @source, @theme, @created_at)
  `).run(doc);
}

export function insertSection(db: Database.Database, section: Section): void {
  db.prepare(`
    INSERT OR REPLACE INTO sections (id, doc_id, heading, doclang, plain_text, page_num, seq, theme)
    VALUES (@id, @doc_id, @heading, @doclang, @plain_text, @page_num, @seq, @theme)
  `).run(section);
}

export function insertEmbedding(
  db: Database.Database,
  sectionId: string,
  embedding: number[]
): void {
  const blob = Buffer.from(new Float32Array(embedding).buffer);
  db.prepare(`
    INSERT OR REPLACE INTO vec_sections (section_id, embedding)
    VALUES (?, ?)
  `).run(sectionId, blob);
}

export function rebuildFts(db: Database.Database): void {
  db.exec(`INSERT INTO sections_fts(sections_fts) VALUES('rebuild')`);
}

// Made with Bob
