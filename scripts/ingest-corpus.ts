#!/usr/bin/env tsx
import { config } from 'dotenv';
import { resolve } from 'path';
// Load .env / .env.local before anything else
config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });


/**
 * Corpus ingest script — Docling SaaS → DocLang → SQLite + sqlite-vec
 *
 * Usage:
 *   npx tsx scripts/ingest-corpus.ts [--theme space|ticker|all] [--limit N]
 *
 * Requires env vars:
 *   DOCLING_API_URL     Docling SaaS endpoint  (e.g. https://docling.example.com)
 *   DOCLING_API_KEY     API key for Docling SaaS (if required)
 *   EMBED_API_KEY       OpenAI-compatible embedding key
 *   EMBED_MODEL         Embedding model name (default: text-embedding-3-small)
 *   EMBED_BASE_URL      Optional override for embedding endpoint
 *   RAG_DB_PATH         Output DB path (default: data/corpus.db)
 *
 * What it does:
 *   1. Fetches Wikipedia articles for the astronomy / finance corpora
 *   2. Posts each to Docling SaaS → receives DocLang XML
 *   3. Splits DocLang into sections (by <heading> and <page_break/>)
 *   4. Embeds each section's plain text
 *   5. Writes documents + sections + embeddings to SQLite
 *   6. Rebuilds the FTS5 index
 */

import OpenAI from 'openai';
import { openWritable, insertDocument, insertSection, insertEmbedding, rebuildFts } from '../services/rag/db';
import { convertToDocLang, splitDocLangSections } from '../services/rag/doclang';
import path from 'path';

// ── Config ────────────────────────────────────────────────────────────────

const DOCLING_API_URL = process.env.DOCLING_API_URL && process.env.DOCLING_API_URL.trim() !== '' ? process.env.DOCLING_API_URL : undefined;
const DOCLING_API_KEY = process.env.DOCLING_API_KEY || '';
const EMBED_MODEL = process.env.EMBED_MODEL || 'text-embedding-3-small';
const RAG_DB_PATH = process.env.RAG_DB_PATH || path.join(process.cwd(), 'data', 'corpus.db');

const args = process.argv.slice(2);
const themeArg = args.find(a => a.startsWith('--theme='))?.split('=')[1] ?? 'all';
const limitArg = parseInt(args.find(a => a.startsWith('--limit='))?.split('=')[1] ?? '0', 10);

// ── Corpus definitions ────────────────────────────────────────────────────

interface CorpusEntry {
  id: string;
  title: string;
  url: string;
  wikipediaTitle: string;
  theme: 'space' | 'ticker' | 'shared';
}

const SPACE_CORPUS: CorpusEntry[] = [
  // Planets
  { id: 'wp-mercury', title: 'Mercury (planet)', url: 'https://en.wikipedia.org/wiki/Mercury_(planet)', wikipediaTitle: 'Mercury_(planet)', theme: 'space' },
  { id: 'wp-venus', title: 'Venus', url: 'https://en.wikipedia.org/wiki/Venus', wikipediaTitle: 'Venus', theme: 'space' },
  { id: 'wp-earth', title: 'Earth', url: 'https://en.wikipedia.org/wiki/Earth', wikipediaTitle: 'Earth', theme: 'space' },
  { id: 'wp-mars', title: 'Mars', url: 'https://en.wikipedia.org/wiki/Mars', wikipediaTitle: 'Mars', theme: 'space' },
  { id: 'wp-jupiter', title: 'Jupiter', url: 'https://en.wikipedia.org/wiki/Jupiter', wikipediaTitle: 'Jupiter', theme: 'space' },
  { id: 'wp-saturn', title: 'Saturn', url: 'https://en.wikipedia.org/wiki/Saturn', wikipediaTitle: 'Saturn', theme: 'space' },
  { id: 'wp-uranus', title: 'Uranus', url: 'https://en.wikipedia.org/wiki/Uranus', wikipediaTitle: 'Uranus', theme: 'space' },
  { id: 'wp-neptune', title: 'Neptune', url: 'https://en.wikipedia.org/wiki/Neptune', wikipediaTitle: 'Neptune', theme: 'space' },
  // Moons
  { id: 'wp-moon', title: 'Moon', url: 'https://en.wikipedia.org/wiki/Moon', wikipediaTitle: 'Moon', theme: 'space' },
  { id: 'wp-io', title: 'Io (moon)', url: 'https://en.wikipedia.org/wiki/Io_(moon)', wikipediaTitle: 'Io_(moon)', theme: 'space' },
  { id: 'wp-europa', title: 'Europa (moon)', url: 'https://en.wikipedia.org/wiki/Europa_(moon)', wikipediaTitle: 'Europa_(moon)', theme: 'space' },
  { id: 'wp-ganymede', title: 'Ganymede (moon)', url: 'https://en.wikipedia.org/wiki/Ganymede_(moon)', wikipediaTitle: 'Ganymede_(moon)', theme: 'space' },
  { id: 'wp-titan', title: 'Titan (moon)', url: 'https://en.wikipedia.org/wiki/Titan_(moon)', wikipediaTitle: 'Titan_(moon)', theme: 'space' },
  { id: 'wp-enceladus', title: 'Enceladus', url: 'https://en.wikipedia.org/wiki/Enceladus', wikipediaTitle: 'Enceladus', theme: 'space' },
  // Stars
  { id: 'wp-sun', title: 'Sun', url: 'https://en.wikipedia.org/wiki/Sun', wikipediaTitle: 'Sun', theme: 'space' },
  { id: 'wp-betelgeuse', title: 'Betelgeuse', url: 'https://en.wikipedia.org/wiki/Betelgeuse', wikipediaTitle: 'Betelgeuse', theme: 'space' },
  { id: 'wp-sirius', title: 'Sirius', url: 'https://en.wikipedia.org/wiki/Sirius', wikipediaTitle: 'Sirius', theme: 'space' },
  { id: 'wp-proxima', title: 'Proxima Centauri', url: 'https://en.wikipedia.org/wiki/Proxima_Centauri', wikipediaTitle: 'Proxima_Centauri', theme: 'space' },
  // Galaxies & nebulae
  { id: 'wp-milky-way', title: 'Milky Way', url: 'https://en.wikipedia.org/wiki/Milky_Way', wikipediaTitle: 'Milky_Way', theme: 'space' },
  { id: 'wp-andromeda', title: 'Andromeda Galaxy', url: 'https://en.wikipedia.org/wiki/Andromeda_Galaxy', wikipediaTitle: 'Andromeda_Galaxy', theme: 'space' },
  { id: 'wp-orion-nebula', title: 'Orion Nebula', url: 'https://en.wikipedia.org/wiki/Orion_Nebula', wikipediaTitle: 'Orion_Nebula', theme: 'space' },
  { id: 'wp-black-hole', title: 'Black hole', url: 'https://en.wikipedia.org/wiki/Black_hole', wikipediaTitle: 'Black_hole', theme: 'space' },
  { id: 'wp-sag-a', title: 'Sagittarius A*', url: 'https://en.wikipedia.org/wiki/Sagittarius_A*', wikipediaTitle: 'Sagittarius_A*', theme: 'space' },
  // Constellations
  { id: 'wp-orion', title: 'Orion (constellation)', url: 'https://en.wikipedia.org/wiki/Orion_(constellation)', wikipediaTitle: 'Orion_(constellation)', theme: 'space' },
  { id: 'wp-ursa-major', title: 'Ursa Major', url: 'https://en.wikipedia.org/wiki/Ursa_Major', wikipediaTitle: 'Ursa_Major', theme: 'space' },
  { id: 'wp-cassiopeia', title: 'Cassiopeia (constellation)', url: 'https://en.wikipedia.org/wiki/Cassiopeia_(constellation)', wikipediaTitle: 'Cassiopeia_(constellation)', theme: 'space' },
  { id: 'wp-scorpius', title: 'Scorpius', url: 'https://en.wikipedia.org/wiki/Scorpius', wikipediaTitle: 'Scorpius', theme: 'space' },
  { id: 'wp-leo', title: 'Leo (constellation)', url: 'https://en.wikipedia.org/wiki/Leo_(constellation)', wikipediaTitle: 'Leo_(constellation)', theme: 'space' },
  // Missions & history
  { id: 'wp-apollo', title: 'Apollo program', url: 'https://en.wikipedia.org/wiki/Apollo_program', wikipediaTitle: 'Apollo_program', theme: 'space' },
  { id: 'wp-hubble', title: 'Hubble Space Telescope', url: 'https://en.wikipedia.org/wiki/Hubble_Space_Telescope', wikipediaTitle: 'Hubble_Space_Telescope', theme: 'space' },
  { id: 'wp-james-webb', title: 'James Webb Space Telescope', url: 'https://en.wikipedia.org/wiki/James_Webb_Space_Telescope', wikipediaTitle: 'James_Webb_Space_Telescope', theme: 'space' },
  { id: 'wp-voyager', title: 'Voyager program', url: 'https://en.wikipedia.org/wiki/Voyager_program', wikipediaTitle: 'Voyager_program', theme: 'space' },
  { id: 'wp-iss', title: 'International Space Station', url: 'https://en.wikipedia.org/wiki/International_Space_Station', wikipediaTitle: 'International_Space_Station', theme: 'space' },
  // Concepts
  { id: 'wp-big-bang', title: 'Big Bang', url: 'https://en.wikipedia.org/wiki/Big_Bang', wikipediaTitle: 'Big_Bang', theme: 'space' },
  { id: 'wp-dark-matter', title: 'Dark matter', url: 'https://en.wikipedia.org/wiki/Dark_matter', wikipediaTitle: 'Dark_matter', theme: 'space' },
  { id: 'wp-exoplanet', title: 'Exoplanet', url: 'https://en.wikipedia.org/wiki/Exoplanet', wikipediaTitle: 'Exoplanet', theme: 'space' },
  { id: 'wp-solar-system', title: 'Solar System', url: 'https://en.wikipedia.org/wiki/Solar_System', wikipediaTitle: 'Solar_System', theme: 'space' },
];

// Ticker corpus: add financial articles here as needed
const TICKER_CORPUS: CorpusEntry[] = [
  { id: 'wp-stock-market', title: 'Stock market', url: 'https://en.wikipedia.org/wiki/Stock_market', wikipediaTitle: 'Stock_market', theme: 'ticker' },
  { id: 'wp-pe-ratio', title: 'Price–earnings ratio', url: 'https://en.wikipedia.org/wiki/Price%E2%80%93earnings_ratio', wikipediaTitle: 'Price%E2%80%93earnings_ratio', theme: 'ticker' },
  { id: 'wp-market-cap', title: 'Market capitalization', url: 'https://en.wikipedia.org/wiki/Market_capitalization', wikipediaTitle: 'Market_capitalization', theme: 'ticker' },
  { id: 'wp-earnings', title: 'Earnings per share', url: 'https://en.wikipedia.org/wiki/Earnings_per_share', wikipediaTitle: 'Earnings_per_share', theme: 'ticker' },
  { id: 'wp-index-fund', title: 'Index fund', url: 'https://en.wikipedia.org/wiki/Index_fund', wikipediaTitle: 'Index_fund', theme: 'ticker' },
];

// ── Wikipedia fetch ───────────────────────────────────────────────────────

async function fetchWikipediaText(title: string): Promise<string> {
  const url = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=extracts&explaintext=true&format=json&origin=*`;
  for (let attempt = 0; attempt < 3; attempt++) {
    if (attempt > 0) await new Promise(r => setTimeout(r, 5000 * attempt));
    const resp = await fetch(url, { headers: { 'User-Agent': 'Pixelverse-IngestScript/1.0 (pixelverse app)' } });
    const text = await resp.text();
    let json: any;
    try { json = JSON.parse(text); } catch {
      console.log(`  [wiki] non-JSON response, retrying (attempt ${attempt + 1})…`);
      continue;
    }
    const pages = json.query?.pages ?? {};
    const page = Object.values(pages)[0] as any;
    return page?.extract ?? '';
  }
  throw new Error(`Wikipedia fetch failed after 3 attempts for "${title}"`);
}

// ── Embedding ─────────────────────────────────────────────────────────────

async function embedBatch(texts: string[]): Promise<number[][]> {
  const client = new OpenAI({
    apiKey: process.env.EMBED_API_KEY || process.env.LLM_API_KEY || process.env.OPENAI_API_KEY || '',
    baseURL: process.env.EMBED_BASE_URL || process.env.LLM_BASE_URL || undefined,
  });

  const resp = await client.embeddings.create({ model: EMBED_MODEL, input: texts });
  return resp.data.map(d => d.embedding);
}

// ── Main ingest loop ──────────────────────────────────────────────────────

async function ingest(entries: CorpusEntry[], db: ReturnType<typeof openWritable>): Promise<void> {
  const limited = limitArg > 0 ? entries.slice(0, limitArg) : entries;

  for (const entry of limited) {
    console.log(`\n📄 ${entry.title} [${entry.theme}]`);

    // Polite delay between articles to avoid Wikipedia rate limiting
    if (limited.indexOf(entry) > 0) await new Promise(r => setTimeout(r, 2000));

    try {
      // 1. Fetch Wikipedia text
      process.stdout.write('  fetching Wikipedia… ');
      const wikiText = await fetchWikipediaText(entry.wikipediaTitle);
      console.log(`${wikiText.length} chars`);

      // 2. Convert to pseudo-DocLang (markdown wrapped with heading tags)
      process.stdout.write('  converting to DocLang… ');
      const doclang = convertToDocLang(wikiText, entry.title);
      console.log(`${doclang.length} chars`);

      // 3. Insert document
      insertDocument(db, {
        id: entry.id,
        title: entry.title,
        url: entry.url,
        source: 'wikipedia',
        theme: entry.theme,
        created_at: new Date().toISOString(),
      });

      // 4. Split into sections
      const rawSections = splitDocLangSections(doclang);
      console.log(`  ${rawSections.length} sections`);

      for (const s of rawSections) {
        insertSection(db, { ...s, doc_id: entry.id, theme: entry.theme });
      }

      // 5. Embed in batches of 20
      const BATCH = 20;
      let embedded = 0;
      for (let i = 0; i < rawSections.length; i += BATCH) {
        const batch = rawSections.slice(i, i + BATCH);
        const vectors = await embedBatch(batch.map(s => s.plain_text));
        for (let j = 0; j < batch.length; j++) {
          insertEmbedding(db, batch[j].id, vectors[j]);
          embedded++;
        }
        process.stdout.write(`\r  embedded ${embedded}/${rawSections.length} sections`);
      }
      console.log('');

    } catch (err) {
      console.error(`  ❌ Failed: ${err}`);
    }
  }
}

// ── Entry point ───────────────────────────────────────────────────────────

async function main() {
  console.log(`\n🚀 Pixelverse corpus ingest`);
  console.log(`   DB:    ${RAG_DB_PATH}`);
  console.log(`   Theme: ${themeArg}`);
  console.log(`   Limit: ${limitArg || 'all'}\n`);

  const db = openWritable(RAG_DB_PATH);

  const corpus: CorpusEntry[] = [];
  if (themeArg === 'space' || themeArg === 'all') corpus.push(...SPACE_CORPUS);
  if (themeArg === 'ticker' || themeArg === 'all') corpus.push(...TICKER_CORPUS);

  await ingest(corpus, db);

  console.log('\n🔄 Rebuilding FTS5 index…');
  rebuildFts(db);

  db.close();
  console.log('\n✅ Ingest complete.');
}

main().catch(err => { console.error(err); process.exit(1); });
