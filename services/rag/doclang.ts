/**
 * DocLang helpers — shared between the ingest script and API routes.
 *
 * convertToDocLang  : wraps plain/markdown text in DocLang XML
 * splitDocLangSections : splits DocLang XML into discrete sections
 * stripDocLangTags  : strips all XML tags → plain text for FTS / embedding
 */

import { randomUUID } from 'crypto';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface RawSection {
  id: string;
  heading: string | null;
  doclang: string;
  plain_text: string;
  page_num: number | null;
  seq: number;
}

// ── convertToDocLang ──────────────────────────────────────────────────────────

/**
 * Wrap plain/markdown text as pseudo-DocLang XML.
 * Recognises markdown headings (## Foo) and MediaWiki headings (== Foo ==).
 * Everything else is wrapped in <text> blocks.
 */
export function convertToDocLang(text: string, title: string): string {
  const lines = text.split('\n');
  const parts: string[] = [];
  let buf: string[] = [];

  const flushBuf = () => {
    const chunk = buf.join('\n').trim();
    if (chunk) {
      parts.push(`<text>${chunk}</text>`);
    }
    buf = [];
  };

  for (const line of lines) {
    const mdH = line.match(/^(#{1,6})\s+(.+)/);
    const wikiH = !mdH && line.match(/^(={1,6})\s*(.+?)\s*={1,6}\s*$/);
    const h = mdH ?? wikiH;
    if (h) {
      flushBuf();
      const level = h[1].length;
      parts.push(`<heading level="${level}">${h[2].trim()}</heading>`);
    } else {
      buf.push(line);
    }
  }
  flushBuf();

  return `<document>\n<heading level="1">${title}</heading>\n${parts.join('\n')}\n</document>`;
}

// ── splitDocLangSections ──────────────────────────────────────────────────────

/**
 * Split a DocLang XML string into sections, one per heading block.
 * Falls back to treating the whole string as a single section when no
 * headings are found (e.g. raw user text).
 */
export function splitDocLangSections(doclang: string): RawSection[] {
  // Note: /gs flag requires ES2018+; use [\s\S] instead of . with s-flag for compat
  const headingRe = /<heading(?:\s[^>]*)?>[\s\S]*?<\/heading>|<page_break\s*\/>/g;
  const sections: RawSection[] = [];
  let currentHeading: string | null = null;
  let currentStart = 0;
  let pageNum = 1;
  let seq = 0;

  const flush = (end: number, nextPage = false) => {
    const chunk = doclang.slice(currentStart, end).trim();
    if (!chunk) return;
    const plain = stripDocLangTags(chunk);
    if (plain.trim()) {
      sections.push({
        id: randomUUID(),
        heading: currentHeading,
        doclang: chunk,
        plain_text: plain,
        page_num: pageNum,
        seq: seq++,
      });
    }
    if (nextPage) pageNum++;
    currentHeading = null;
    currentStart = end;
  };

  for (const m of doclang.matchAll(headingRe)) {
    const tag = m[0];
    if (tag.includes('<page_break')) {
      flush(m.index!);
      currentStart = m.index! + tag.length;
    } else {
      flush(m.index!);
      currentHeading = stripDocLangTags(tag).trim();
      currentStart = m.index!;
    }
  }
  flush(doclang.length);

  // No structure found — treat whole document as one section
  if (!sections.length && doclang.trim()) {
    const plain = stripDocLangTags(doclang);
    if (plain.trim()) {
      sections.push({ id: randomUUID(), heading: null, doclang, plain_text: plain, page_num: 1, seq: 0 });
    }
  }

  return sections;
}

// ── stripDocLangTags ──────────────────────────────────────────────────────────

export function stripDocLangTags(text: string): string {
  return text
    .replace(/<!\[CDATA\[([\s\S]*?)]]>/g, '$1')
    .replace(/<[^>]+\/>/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Made with Bob
