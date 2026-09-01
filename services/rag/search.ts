/**
 * Hybrid search — FTS5 keyword + sqlite-vec ANN over RAG corpus.
 *
 * hybridSearch() runs both in sequence and deduplicates, giving keyword
 * recall for exact terms (star names, planet names, ticker symbols) plus
 * semantic recall for paraphrased or conceptual queries.
 *
 * Returns the top-N sections with their raw DocLang XML — ready to be
 * passed directly as LLM context.
 */

import type Database from 'better-sqlite3';
import type { SectionResult } from './db';

export interface SearchOptions {
  theme: 'space' | 'ticker' | 'shared' | 'generalist';
  limit?: number;
}

export interface SearchAllOptions {
  limit?: number;
}

/**
 * Hybrid FTS5 + vector search.
 *
 * @param db       Open DB connection (from getDb())
 * @param query    User's natural-language question
 * @param embedding Query embedding vector (same dim as stored vectors)
 * @param opts     theme filter + result limit
 */
export function hybridSearch(
  db: Database.Database,
  query: string,
  embedding: number[],
  opts: SearchOptions
): SectionResult[] {
  const { theme, limit = 8 } = opts;
  const themeFilter = theme === 'shared' ? '' : `AND s.theme IN ('${theme}', 'shared')`;

  // ── FTS5 keyword search ──────────────────────────────────────────────────
  // Try phrase match first, fall back to OR-of-terms so natural-language
  // questions still hit relevant sections.
  const escaped = query.replace(/"/g, '""');
  const termQuery = query
    .split(/\s+/)
    .filter(w => w.length > 2)
    .map(w => `"${w.replace(/"/g, '')}"`)
    .join(' OR ') || `"${escaped}"`;

  const ftsRows = _runFts(db, `"${escaped}"`, themeFilter, limit * 3) ||
                  _runFts(db, termQuery, themeFilter, limit * 3);

  // ── Vector ANN search ────────────────────────────────────────────────────
  const blob = Buffer.from(new Float32Array(embedding).buffer);
  const vecRows: any[] = db.prepare(`
    SELECT
      s.id, s.doc_id, s.heading, s.doclang, s.plain_text,
      s.page_num, s.seq, s.theme,
      d.title, d.url,
      v.distance AS rank
    FROM vec_sections v
    JOIN sections s ON s.id = v.section_id
    JOIN documents d ON d.id = s.doc_id
    WHERE v.embedding MATCH ?
      AND k = ?
      ${themeFilter}
    ORDER BY v.distance
  `).all(blob, limit * 2) as any[];

  // ── Merge + deduplicate ───────────────────────────────────────────────────
  const seen = new Set<string>();
  const results: SectionResult[] = [];

  // Interleave: FTS first (exact match wins), then vector
  for (const row of [...(ftsRows ?? []), ...vecRows]) {
    if (seen.has(row.id)) continue;
    seen.add(row.id);
    results.push({
      id: row.id,
      doc_id: row.doc_id,
      heading: row.heading ?? null,
      doclang: row.doclang,
      plain_text: row.plain_text,
      page_num: row.page_num ?? null,
      seq: row.seq,
      theme: row.theme,
      title: row.title,
      url: row.url ?? undefined,
      rank: row.rank ?? undefined,
    });
    if (results.length >= limit) break;
  }

  return results;
}

/**
 * Hybrid FTS5 + vector search with NO theme filter.
 * Used by the generalist agent to search across all uploaded corpora.
 */
export function hybridSearchAll(
  db: Database.Database,
  query: string,
  embedding: number[],
  opts: SearchAllOptions = {}
): SectionResult[] {
  const { limit = 8 } = opts;

  // ── FTS5 keyword search (no theme filter) ───────────────────────────────
  const escaped = query.replace(/"/g, '""');
  const termQuery = query
    .split(/\s+/)
    .filter(w => w.length > 2)
    .map(w => `"${w.replace(/"/g, '')}"`)
    .join(' OR ') || `"${escaped}"`;

  const ftsRows = _runFts(db, `"${escaped}"`, '', limit * 3) ||
                  _runFts(db, termQuery, '', limit * 3);

  // ── Vector ANN search (no theme filter) ─────────────────────────────────
  const blob = Buffer.from(new Float32Array(embedding).buffer);
  const vecRows: any[] = db.prepare(`
    SELECT
      s.id, s.doc_id, s.heading, s.doclang, s.plain_text,
      s.page_num, s.seq, s.theme,
      d.title, d.url,
      v.distance AS rank
    FROM vec_sections v
    JOIN sections s ON s.id = v.section_id
    JOIN documents d ON d.id = s.doc_id
    WHERE v.embedding MATCH ?
      AND k = ?
    ORDER BY v.distance
  `).all(blob, limit * 2) as any[];

  // ── Merge + deduplicate ──────────────────────────────────────────────────
  const seen = new Set<string>();
  const results: SectionResult[] = [];

  for (const row of [...(ftsRows ?? []), ...vecRows]) {
    if (seen.has(row.id)) continue;
    seen.add(row.id);
    results.push({
      id: row.id,
      doc_id: row.doc_id,
      heading: row.heading ?? null,
      doclang: row.doclang,
      plain_text: row.plain_text,
      page_num: row.page_num ?? null,
      seq: row.seq,
      theme: row.theme,
      title: row.title,
      url: row.url ?? undefined,
      rank: row.rank ?? undefined,
    });
    if (results.length >= limit) break;
  }

  return results;
}

export interface SearchByIdsOptions {
  docIds: string[];
  limit?: number;
}

/**
 * Hybrid FTS5 + vector search restricted to a specific set of document IDs.
 * Used by the generalist agent when the user has made an explicit doc selection.
 */
export function hybridSearchByIds(
  db: Database.Database,
  query: string,
  embedding: number[],
  opts: SearchByIdsOptions
): SectionResult[] {
  const { docIds, limit = 8 } = opts;
  if (docIds.length === 0) return [];

  // Build an IN clause placeholder — sqlite3 doesn't support array binding
  const placeholders = docIds.map(() => '?').join(', ');
  const idFilter = `AND s.doc_id IN (${placeholders})`;

  // ── FTS5 keyword search filtered to selected doc IDs ────────────────────
  const escaped = query.replace(/"/g, '""');
  const termQuery = query
    .split(/\s+/)
    .filter(w => w.length > 2)
    .map(w => `"${w.replace(/"/g, '')}"`)
    .join(' OR ') || `"${escaped}"`;

  const ftsRows = _runFtsById(db, `"${escaped}"`, idFilter, docIds, limit * 3) ||
                  _runFtsById(db, termQuery,      idFilter, docIds, limit * 3);

  // ── Vector ANN search filtered to selected doc IDs ──────────────────────
  const blob = Buffer.from(new Float32Array(embedding).buffer);
  const vecRows: any[] = db.prepare(`
    SELECT
      s.id, s.doc_id, s.heading, s.doclang, s.plain_text,
      s.page_num, s.seq, s.theme,
      d.title, d.url,
      v.distance AS rank
    FROM vec_sections v
    JOIN sections s ON s.id = v.section_id
    JOIN documents d ON d.id = s.doc_id
    WHERE v.embedding MATCH ?
      AND k = ?
      ${idFilter}
    ORDER BY v.distance
  `).all(blob, limit * 2, ...docIds) as any[];

  // ── Merge + deduplicate ──────────────────────────────────────────────────
  const seen = new Set<string>();
  const results: SectionResult[] = [];

  for (const row of [...(ftsRows ?? []), ...vecRows]) {
    if (seen.has(row.id)) continue;
    seen.add(row.id);
    results.push({
      id: row.id,
      doc_id: row.doc_id,
      heading: row.heading ?? null,
      doclang: row.doclang,
      plain_text: row.plain_text,
      page_num: row.page_num ?? null,
      seq: row.seq,
      theme: row.theme,
      title: row.title,
      url: row.url ?? undefined,
      rank: row.rank ?? undefined,
    });
    if (results.length >= limit) break;
  }

  return results;
}

/**
 * Build the context string passed to the LLM.
 * Each section is labeled with its source document and heading,
 * then followed by its raw DocLang XML for maximum fidelity.
 */
export function buildContext(sections: SectionResult[]): string {
  return sections
    .map((s, i) => {
      let label = `[${i + 1}] ${s.title}`;
      if (s.heading) label += ` — ${s.heading}`;
      if (s.page_num) label += ` (p.${s.page_num})`;
      return `--- ${label} ---\n${s.doclang}`;
    })
    .join('\n\n');
}

// ── Internal helpers ──────────────────────────────────────────────────────

function _runFts(
  db: Database.Database,
  ftsQuery: string,
  themeFilter: string,
  limit: number
): any[] | null {
  try {
    const rows = db.prepare(`
      SELECT
        s.id, s.doc_id, s.heading, s.doclang, s.plain_text,
        s.page_num, s.seq, s.theme,
        d.title, d.url,
        bm25(sections_fts) AS rank
      FROM sections_fts
      JOIN sections s ON sections_fts.rowid = s.rowid
      JOIN documents d ON s.doc_id = d.id
      WHERE sections_fts MATCH ?
        ${themeFilter}
      ORDER BY rank
      LIMIT ?
    `).all(ftsQuery, limit) as any[];
    return rows.length > 0 ? rows : null;
  } catch {
    return null;
  }
}

function _runFtsById(
  db: Database.Database,
  ftsQuery: string,
  idFilter: string,
  docIds: string[],
  limit: number
): any[] | null {
  try {
    const rows = db.prepare(`
      SELECT
        s.id, s.doc_id, s.heading, s.doclang, s.plain_text,
        s.page_num, s.seq, s.theme,
        d.title, d.url,
        bm25(sections_fts) AS rank
      FROM sections_fts
      JOIN sections s ON sections_fts.rowid = s.rowid
      JOIN documents d ON s.doc_id = d.id
      WHERE sections_fts MATCH ?
        ${idFilter}
      ORDER BY rank
      LIMIT ?
    `).all(ftsQuery, ...docIds, limit) as any[];
    return rows.length > 0 ? rows : null;
  } catch {
    return null;
  }
}

// Made with Bob
