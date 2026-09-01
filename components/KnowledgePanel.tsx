'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { DocSelectionState } from '@/hooks/useDocSelection';

// ── Types ─────────────────────────────────────────────────────────────────────

interface CorpusDocument {
  id: string;
  title: string;
  url: string | null;
  source: string;
  theme: string;
  created_at: string;
  section_count: number;
}

// ── Main Panel ────────────────────────────────────────────────────────────────

interface KnowledgePanelProps {
  open: boolean;
  onClose: () => void;
  appMode: string;
  docSelection: DocSelectionState;
  onCorpusChange: () => void;
}

const MIN_WIDTH = 280;
const MAX_WIDTH = 860;
const DEFAULT_WIDTH = 512;

export function KnowledgePanel({ open, onClose, appMode, docSelection, onCorpusChange }: KnowledgePanelProps) {
  const [tab, setTab] = useState<'corpus' | 'my-sources'>('corpus');
  const [docs, setDocs] = useState<CorpusDocument[]>([]);
  const [grouped, setGrouped] = useState<Record<string, CorpusDocument[]>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(DEFAULT_WIDTH);
  const dragging = useRef(false);
  const startX = useRef(0);
  const startWidth = useRef(DEFAULT_WIDTH);

  const onResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    dragging.current = true;
    startX.current = e.clientX;
    startWidth.current = width;
    document.body.style.cursor = 'ew-resize';
    document.body.style.userSelect = 'none';

    const onMove = (ev: MouseEvent) => {
      if (!dragging.current) return;
      const delta = startX.current - ev.clientX;
      setWidth(Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, startWidth.current + delta)));
    };
    const onUp = () => {
      dragging.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, [width]);

  const fetchCorpus = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/corpus');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setDocs(data.documents ?? []);
      setGrouped(data.grouped ?? {});
      onCorpusChange(); // keep page-level doc list in sync
    } catch {
      setError('FAILED TO LOAD CORPUS');
    } finally {
      setLoading(false);
    }
  }, [onCorpusChange]);

  useEffect(() => {
    if (open) fetchCorpus();
  }, [open, fetchCorpus]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  // Close on backdrop click
  const handleBackdrop = (e: React.MouseEvent) => {
    if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) onClose();
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/corpus/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      await fetchCorpus();
    } catch {
      setError('DELETE FAILED');
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end"
      style={{ background: 'rgba(5, 8, 20, 0.85)' }}
      onClick={handleBackdrop}
    >
      {/* Drawer */}
      <div
        ref={drawerRef}
        className="relative flex flex-col h-full"
        style={{
          width,
          minWidth: MIN_WIDTH,
          maxWidth: MAX_WIDTH,
          background: 'var(--color-bg-darker)',
          borderLeft: '2px solid var(--color-neon-cyan)',
          boxShadow: '-4px 0 24px rgba(0,255,159,0.18)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Resize handle */}
        <div
          onMouseDown={onResizeStart}
          className="absolute top-0 left-0 h-full w-2 z-10"
          style={{
            cursor: 'ew-resize',
            background: 'transparent',
          }}
          title="Drag to resize"
        >
          {/* Visual grip */}
          <div
            className="absolute top-1/2 left-0 -translate-y-1/2 flex flex-col gap-[3px] pl-[1px]"
            style={{ pointerEvents: 'none' }}
          >
            {[0,1,2,3,4].map(i => (
              <div key={i} style={{ width: 2, height: 2, background: 'rgba(0,255,159,0.35)' }} />
            ))}
          </div>
        </div>
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-3 shrink-0"
          style={{ borderBottom: '2px solid var(--color-neon-cyan)' }}
        >
          <div className="flex items-center gap-3">
            <span
              className="text-xs font-pixel tracking-widest"
              style={{ color: 'var(--color-neon-cyan)' }}
            >
              ◈ KNOWLEDGE BASE
            </span>
            <span
              className="text-xs font-pixel"
              style={{ color: 'rgba(0,255,159,0.4)' }}
            >
              {docs.length} DOCS
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-xs font-pixel px-2 py-1 transition-colors"
            style={{ color: 'var(--color-neon-cyan)' }}
            aria-label="Close knowledge panel"
          >
            [X]
          </button>
        </div>

        {/* Tabs */}
        <div
          className="flex shrink-0"
          style={{ borderBottom: '2px solid var(--color-neon-cyan)' }}
        >
          {(['corpus', 'my-sources'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="flex-1 py-2 text-xs font-pixel tracking-wider transition-colors"
              style={{
                color: tab === t ? 'var(--color-bg-darker)' : 'var(--color-neon-cyan)',
                background: tab === t ? 'var(--color-neon-cyan)' : 'transparent',
                borderRight: t === 'corpus' ? '1px solid var(--color-neon-cyan)' : undefined,
              }}
            >
              {t === 'corpus' ? '[ CORPUS ]' : '[ MY SOURCES ]'}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading && (
            <p className="text-xs font-pixel text-center mt-8" style={{ color: 'var(--color-neon-cyan)' }}>
              LOADING...
            </p>
          )}
          {error && !loading && (
            <p className="text-xs font-pixel text-center mt-8" style={{ color: 'var(--color-error)' }}>
              ⚠ {error}
            </p>
          )}

          {!loading && !error && tab === 'corpus' && (
            <CorpusTab
              grouped={grouped}
              appMode={appMode}
              docSelection={docSelection}
            />
          )}

          {!loading && !error && tab === 'my-sources' && (
            <MySourcesTab
              docs={docs.filter(d => d.source === 'user')}
              onDelete={handleDelete}
              onAdded={fetchCorpus}
              appMode={appMode}
              docSelection={docSelection}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// ── Corpus Tab ────────────────────────────────────────────────────────────────

interface CorpusTabProps {
  grouped: Record<string, CorpusDocument[]>;
  appMode: string;
  docSelection: DocSelectionState;
}

function CorpusTab({ grouped, appMode, docSelection }: CorpusTabProps) {
  const themes = Object.keys(grouped).sort();
  const isGeneralist = appMode === 'generalist';

  if (!themes.length) {
    return (
      <p className="text-xs font-pixel text-center mt-8" style={{ color: 'rgba(0,255,159,0.5)' }}>
        NO DOCUMENTS IN CORPUS
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Bulk selection bar — generalist only */}
      {isGeneralist && (
        <div
          className="flex items-center justify-between gap-2 px-3 py-2 text-[10px] font-pixel"
          style={{
            background: 'var(--color-bg-card)',
            border: '1px solid var(--color-neon-cyan)',
          }}
        >
          <span style={{ color: 'var(--color-neon-cyan)' }}>
            {docSelection.isAllSelected
              ? 'ALL DOCS SELECTED'
              : docSelection.activeDocIds
                ? `${docSelection.activeDocIds.length} DOC${docSelection.activeDocIds.length !== 1 ? 'S' : ''} SELECTED`
                : 'ALL DOCS SELECTED'}
          </span>
          <div className="flex gap-2">
            <button
              onClick={docSelection.selectAll}
              className="px-2 py-1 transition-colors"
              style={{ color: 'var(--color-neon-cyan)', border: '1px solid var(--color-neon-cyan)' }}
              title="Select all documents"
            >
              ALL
            </button>
            <button
              onClick={docSelection.deselectAll}
              className="px-2 py-1 transition-colors"
              style={{ color: 'var(--color-error)', border: '1px solid var(--color-error)' }}
              title="Deselect all documents"
            >
              NONE
            </button>
          </div>
        </div>
      )}

      {themes.map(theme => (
        <ThemeGroup
          key={theme}
          theme={theme}
          docs={grouped[theme]}
          isGeneralist={isGeneralist}
          docSelection={docSelection}
        />
      ))}
    </div>
  );
}

interface ThemeGroupProps {
  theme: string;
  docs: CorpusDocument[];
  isGeneralist: boolean;
  docSelection: DocSelectionState;
}

function ThemeGroup({ theme, docs, isGeneralist, docSelection }: ThemeGroupProps) {
  const themeColor = theme === 'ticker' ? 'var(--color-ticker-primary)' : 'var(--color-neon-cyan)';
  const allSel = docSelection.isThemeAllSelected(theme);
  const partial = docSelection.isThemePartiallySelected(theme);

  return (
    <div>
      <div
        className="flex items-center justify-between text-xs font-pixel tracking-widest mb-2 pb-1"
        style={{ color: themeColor, borderBottom: `1px solid ${themeColor}` }}
      >
        <span>▸ {theme.toUpperCase()} ({docs.length})</span>
        {isGeneralist && (
          <button
            onClick={() => docSelection.toggleTheme(theme)}
            className="text-[9px] px-2 py-0.5 transition-colors"
            style={{
              color: themeColor,
              border: `1px solid ${themeColor}`,
              opacity: 0.85,
            }}
            title={allSel ? `Deselect all ${theme} docs` : `Select all ${theme} docs`}
          >
            {allSel ? '☑ ALL' : partial ? '◐ SOME' : '☐ NONE'}
          </button>
        )}
      </div>
      <div className="flex flex-col gap-1">
        {docs.map(doc => (
          <DocRow
            key={doc.id}
            doc={doc}
            isGeneralist={isGeneralist}
            docSelection={docSelection}
          />
        ))}
      </div>
    </div>
  );
}

interface DocRowProps {
  doc: CorpusDocument;
  isGeneralist: boolean;
  docSelection: DocSelectionState;
}

function DocRow({ doc, isGeneralist, docSelection }: DocRowProps) {
  const selected = docSelection.isSelected(doc.id);
  const sourceColor =
    doc.source === 'wikipedia'
      ? 'rgba(0,255,159,0.5)'
      : doc.source === 'user'
      ? 'var(--color-neon-magenta)'
      : 'var(--color-accent)';

  return (
    <div
      className="flex items-center justify-between gap-2 px-2 py-1 text-xs font-pixel"
      style={{
        background: isGeneralist && !selected ? 'rgba(10,14,39,0.6)' : 'var(--color-bg-card)',
        border: `1px solid ${isGeneralist && !selected ? 'rgba(0,255,159,0.06)' : 'rgba(0,255,159,0.15)'}`,
        opacity: isGeneralist && !selected ? 0.5 : 1,
        transition: 'opacity 0.15s, background 0.15s',
      }}
    >
      {/* Checkbox — generalist only */}
      {isGeneralist && (
        <button
          onClick={() => docSelection.toggle(doc.id)}
          className="shrink-0 w-4 h-4 flex items-center justify-center text-[10px]"
          style={{
            border: `1px solid ${selected ? 'var(--color-neon-cyan)' : 'rgba(0,255,159,0.3)'}`,
            background: selected ? 'var(--color-neon-cyan)' : 'transparent',
            color: selected ? 'var(--color-bg-darker)' : 'transparent',
          }}
          aria-label={selected ? `Deselect ${doc.title}` : `Select ${doc.title}`}
          title={selected ? 'Deselect' : 'Select'}
        >
          ✓
        </button>
      )}

      <div className="flex items-center gap-2 min-w-0 flex-1">
        <span
          className="shrink-0 px-1 text-[9px]"
          style={{ color: sourceColor, border: `1px solid ${sourceColor}` }}
        >
          {doc.source.toUpperCase()}
        </span>
        {doc.url ? (
          <a
            href={doc.url}
            target="_blank"
            rel="noopener noreferrer"
            className="truncate hover:underline"
            style={{
              color: selected || !isGeneralist ? 'rgba(0,255,159,0.85)' : 'rgba(0,255,159,0.45)',
              textDecoration: 'none',
              WebkitTapHighlightColor: 'transparent',
            }}
            title={doc.title}
          >
            {doc.title}
          </a>
        ) : (
          <span
            className="truncate"
            style={{ color: selected || !isGeneralist ? 'rgba(0,255,159,0.85)' : 'rgba(0,255,159,0.45)' }}
            title={doc.title}
          >
            {doc.title}
          </span>
        )}
      </div>
      <span className="shrink-0 text-[9px]" style={{ color: 'rgba(0,255,159,0.4)' }} title={`${doc.section_count} sections`}>
        {doc.section_count} SEC
      </span>
    </div>
  );
}

// ── My Sources Tab ────────────────────────────────────────────────────────────

interface MySourcesTabProps {
  docs: CorpusDocument[];
  onDelete: (id: string) => void;
  onAdded: () => void;
  appMode: string;
  docSelection: DocSelectionState;
}

function MySourcesTab({ docs, onDelete, onAdded, appMode, docSelection }: MySourcesTabProps) {
  const isGeneralist = appMode === 'generalist';
  const [inputMode, setInputMode] = useState<'text' | 'url' | 'file'>('text');

  const MODES: { id: 'text' | 'url' | 'file'; label: string }[] = [
    { id: 'text', label: 'PASTE TEXT' },
    { id: 'url',  label: 'FROM URL' },
    { id: 'file', label: 'UPLOAD FILE' },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Input mode toggle */}
      <div className="flex" style={{ border: '1px solid var(--color-neon-cyan)' }}>
        {MODES.map((mode, i) => (
          <button
            key={mode.id}
            onClick={() => setInputMode(mode.id)}
            className="flex-1 py-1 text-[10px] font-pixel tracking-wider transition-colors"
            style={{
              color: inputMode === mode.id ? 'var(--color-bg-darker)' : 'var(--color-neon-cyan)',
              background: inputMode === mode.id ? 'var(--color-neon-cyan)' : 'transparent',
              borderRight: i < MODES.length - 1 ? '1px solid var(--color-neon-cyan)' : undefined,
            }}
          >
            {mode.label}
          </button>
        ))}
      </div>

      {inputMode === 'text' && <AddDocForm onAdded={onAdded} />}
      {inputMode === 'url'  && <UrlIngestForm onAdded={onAdded} />}
      {inputMode === 'file' && <UploadDocForm onAdded={onAdded} />}

      <div>
        <div
          className="text-xs font-pixel tracking-widest mb-2 pb-1"
          style={{ color: 'var(--color-neon-magenta)', borderBottom: '1px solid var(--color-neon-magenta)' }}
        >
          ▸ MY DOCUMENTS ({docs.length})
        </div>

        {docs.length === 0 ? (
          <p className="text-xs font-pixel mt-4" style={{ color: 'rgba(0,255,159,0.4)' }}>
            NO USER DOCUMENTS YET
          </p>
        ) : (
          <div className="flex flex-col gap-1">
            {docs.map(doc => (
              <UserDocRow
                key={doc.id}
                doc={doc}
                onDelete={onDelete}
                isGeneralist={isGeneralist}
                docSelection={docSelection}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Pixel Markdown Renderer ───────────────────────────────────────────────────

/** Strip DocLang XML wrapper tags to get back the original markdown text. */
function docLangToMarkdown(doclang: string): string {
  return doclang
    .replace(/<heading(?:\s[^>]*)?>([\s\S]*?)<\/heading>/g, (_, t) => {
      const text = t.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
      return `## ${text}`;
    })
    .replace(/<text>([\s\S]*?)<\/text>/g, (_, t) =>
      t.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    )
    .replace(/<[^>]+>/g, '')
    .trim();
}

/** Render inline markdown: **bold**, *italic*, `code` */
function renderInline(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  // Split on bold (**), italic (*), inline code (`)
  const re = /(\*\*[\s\S]*?\*\*|\*[\s\S]*?\*|`[^`]+`)/g;
  let last = 0, i = 0, m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push(<span key={i++}>{text.slice(last, m.index)}</span>);
    const token = m[0];
    if (token.startsWith('**')) {
      parts.push(<span key={i++} style={{ color: 'var(--color-neon-cyan)', fontWeight: 'bold' }}>{token.slice(2, -2)}</span>);
    } else if (token.startsWith('*')) {
      parts.push(<span key={i++} style={{ color: 'rgba(0,255,159,0.9)', fontStyle: 'italic' }}>{token.slice(1, -1)}</span>);
    } else if (token.startsWith('`')) {
      parts.push(
        <span key={i++} style={{ color: 'var(--color-accent)', background: 'rgba(255,215,0,0.1)', padding: '0 2px' }}>
          {token.slice(1, -1)}
        </span>
      );
    }
    last = m.index + token.length;
  }
  if (last < text.length) parts.push(<span key={i++}>{text.slice(last)}</span>);
  return parts;
}

function PixelMarkdown({ text }: { text: string }) {
  const lines = text.split('\n');
  const nodes: React.ReactNode[] = [];
  let key = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Blank line
    if (!line.trim()) {
      nodes.push(<div key={key++} className="h-2" />);
      continue;
    }

    // Headings: ###### → #
    const hMatch = line.match(/^(#{1,6})\s+(.*)/);
    if (hMatch) {
      const level = hMatch[1].length;
      const hColors = ['var(--color-neon-cyan)', 'var(--color-neon-magenta)', 'var(--color-accent)', 'rgba(0,255,159,0.8)', 'rgba(0,255,159,0.6)', 'rgba(0,255,159,0.5)'];
      const prefix = ['▊▊ ', '▊ ', '▸ ', '› ', '· ', '· '];
      nodes.push(
        <div key={key++} className="font-pixel mt-2 mb-1" style={{ color: hColors[level - 1], fontSize: level <= 2 ? '10px' : '9px', borderBottom: level <= 2 ? `1px solid ${hColors[level - 1]}` : undefined, paddingBottom: level <= 2 ? '2px' : undefined }}>
          {prefix[level - 1]}{renderInline(hMatch[2])}
        </div>
      );
      continue;
    }

    // Horizontal rule
    if (/^[-*_]{3,}\s*$/.test(line)) {
      nodes.push(<div key={key++} className="my-2" style={{ borderBottom: '1px solid rgba(0,255,159,0.2)' }} />);
      continue;
    }

    // Unordered list
    const ulMatch = line.match(/^[\s]*[-*+]\s+(.*)/);
    if (ulMatch) {
      nodes.push(
        <div key={key++} className="font-pixel flex gap-1" style={{ fontSize: '9px', color: 'rgba(0,255,159,0.75)' }}>
          <span style={{ color: 'var(--color-neon-cyan)', flexShrink: 0 }}>▸</span>
          <span>{renderInline(ulMatch[1])}</span>
        </div>
      );
      continue;
    }

    // Ordered list
    const olMatch = line.match(/^[\s]*\d+[.)]\s+(.*)/);
    if (olMatch) {
      const num = line.match(/^[\s]*(\d+)/)?.[1] ?? '1';
      nodes.push(
        <div key={key++} className="font-pixel flex gap-1" style={{ fontSize: '9px', color: 'rgba(0,255,159,0.75)' }}>
          <span style={{ color: 'var(--color-neon-cyan)', flexShrink: 0 }}>{num}.</span>
          <span>{renderInline(olMatch[1])}</span>
        </div>
      );
      continue;
    }

    // Blockquote
    const bqMatch = line.match(/^>\s*(.*)/);
    if (bqMatch) {
      nodes.push(
        <div key={key++} className="font-pixel pl-2 my-1" style={{ fontSize: '9px', color: 'rgba(0,255,159,0.55)', borderLeft: '2px solid rgba(0,255,159,0.3)' }}>
          {renderInline(bqMatch[1])}
        </div>
      );
      continue;
    }

    // Plain paragraph
    nodes.push(
      <div key={key++} className="font-pixel" style={{ fontSize: '9px', color: 'rgba(0,255,159,0.75)', lineHeight: '1.8', wordBreak: 'break-word' }}>
        {renderInline(line)}
      </div>
    );
  }

  return <>{nodes}</>;
}

// ── Document Viewer ───────────────────────────────────────────────────────────

interface DocSection {
  id: string;
  heading: string | null;
  plain_text: string;
  doclang: string;
  seq: number;
  page_num: number | null;
}

function DocViewer({ docId, title, onClose }: { docId: string; title: string; onClose: () => void }) {
  const [sections, setSections] = useState<DocSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rawMode, setRawMode] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/corpus/${docId}`)
      .then(r => r.json())
      .then(data => { setSections(data.sections ?? []); setLoading(false); })
      .catch(() => { setError('FAILED TO LOAD'); setLoading(false); });
  }, [docId]);

  // Concatenate all section doclang into one markdown string
  const markdown = sections.map(s => docLangToMarkdown(s.doclang)).join('\n\n');
  const raw = sections.map(s => s.doclang).join('\n\n---\n\n');

  return (
    <div
      className="mt-1 mb-2 flex flex-col"
      style={{ border: '1px solid rgba(255,0,255,0.4)', background: 'var(--color-bg-darker)' }}
    >
      {/* Viewer header */}
      <div
        className="flex items-center justify-between px-2 py-1"
        style={{ borderBottom: '1px solid rgba(255,0,255,0.3)' }}
      >
        <span className="text-[9px] font-pixel tracking-widest truncate" style={{ color: 'var(--color-neon-magenta)' }}>
          ◈ {title}
        </span>
        <div className="flex items-center gap-2 shrink-0 ml-2">
          <button
            onClick={() => setRawMode(v => !v)}
            className="text-[9px] font-pixel"
            style={{ color: rawMode ? 'var(--color-accent)' : 'rgba(255,0,255,0.5)' }}
          >
            [{rawMode ? 'RENDERED' : 'RAW'}]
          </button>
          <button
            onClick={onClose}
            className="text-[9px] font-pixel"
            style={{ color: 'rgba(255,0,255,0.6)' }}
          >
            [×]
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="overflow-y-auto max-h-72 p-3">
        {loading && (
          <p className="text-[9px] font-pixel animated-ellipsis" style={{ color: 'var(--color-neon-cyan)' }}>
            LOADING
          </p>
        )}
        {error && (
          <p className="text-[9px] font-pixel" style={{ color: 'var(--color-error)' }}>⚠ {error}</p>
        )}
        {!loading && !error && sections.length === 0 && (
          <p className="text-[9px] font-pixel" style={{ color: 'rgba(0,255,159,0.4)' }}>NO CONTENT</p>
        )}
        {!loading && !error && sections.length > 0 && (
          rawMode
            ? <pre className="text-[9px] font-pixel whitespace-pre-wrap break-all" style={{ color: 'rgba(0,255,159,0.7)', lineHeight: '1.6' }}>{raw}</pre>
            : <PixelMarkdown text={markdown} />
        )}
      </div>
    </div>
  );
}

function UserDocRow({
  doc,
  onDelete,
  isGeneralist,
  docSelection,
}: {
  doc: CorpusDocument;
  onDelete: (id: string) => void;
  isGeneralist: boolean;
  docSelection: DocSelectionState;
}) {
  const [confirming, setConfirming] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const selected = docSelection.isSelected(doc.id);

  return (
    <div>
    <div
      className="flex items-center justify-between gap-2 px-2 py-1 text-xs font-pixel"
      style={{
        background: isGeneralist && !selected ? 'rgba(10,14,39,0.6)' : 'var(--color-bg-card)',
        border: `1px solid ${isGeneralist && !selected ? 'rgba(255,0,255,0.06)' : 'rgba(255,0,255,0.2)'}`,
        opacity: isGeneralist && !selected ? 0.5 : 1,
        cursor: 'pointer',
        transition: 'opacity 0.15s, background 0.15s',
      }}
      onClick={() => !confirming && setViewOpen(v => !v)}
    >
      <div className="flex items-center gap-2 min-w-0">
        {/* Checkbox — generalist only */}
        {isGeneralist && (
          <button
            onClick={e => { e.stopPropagation(); docSelection.toggle(doc.id); }}
            className="shrink-0 w-4 h-4 flex items-center justify-center text-[10px]"
            style={{
              border: `1px solid ${selected ? 'var(--color-neon-cyan)' : 'rgba(0,255,159,0.3)'}`,
              background: selected ? 'var(--color-neon-cyan)' : 'transparent',
              color: selected ? 'var(--color-bg-darker)' : 'transparent',
            }}
            aria-label={selected ? `Deselect ${doc.title}` : `Select ${doc.title}`}
          >
            ✓
          </button>
        )}
        <span
          className="shrink-0 px-1 text-[9px]"
          style={{ color: 'var(--color-neon-magenta)', border: '1px solid var(--color-neon-magenta)' }}
        >
          USER
        </span>
        <span className="truncate" style={{ color: 'rgba(0,255,159,0.85)' }} title={doc.title}>
          {doc.title}
        </span>
      </div>

      <div className="flex items-center gap-2 shrink-0" onClick={e => e.stopPropagation()}>
        <span style={{ color: 'rgba(0,255,159,0.4)' }} title={`${doc.section_count} sections`}>{doc.section_count} SEC</span>
        <span style={{ color: 'rgba(0,255,159,0.3)' }}>{viewOpen ? '▲' : '▼'}</span>
        {confirming ? (
          <>
            <button
              onClick={() => onDelete(doc.id)}
              className="text-[9px] px-1 py-0.5"
              style={{ color: 'var(--color-error)', border: '1px solid var(--color-error)' }}
            >
              YES
            </button>
            <button
              onClick={() => setConfirming(false)}
              className="text-[9px] px-1 py-0.5"
              style={{ color: 'rgba(0,255,159,0.6)', border: '1px solid rgba(0,255,159,0.3)' }}
            >
              NO
            </button>
          </>
        ) : (
          <button
            onClick={e => { e.stopPropagation(); setConfirming(true); }}
            className="text-[9px] px-1 py-0.5 transition-colors"
            style={{ color: 'var(--color-error)', border: '1px solid var(--color-error)' }}
            aria-label={`Delete ${doc.title}`}
          >
            DEL
          </button>
        )}
      </div>
    </div>
    {viewOpen && (
      <DocViewer docId={doc.id} title={doc.title} onClose={() => setViewOpen(false)} />
    )}
    </div>
  );
}

// ── Add Document Form ─────────────────────────────────────────────────────────

type AddState = 'idle' | 'loading' | 'done' | 'error';

function AddDocForm({ onAdded }: { onAdded: () => void }) {
  const [title, setTitle] = useState('');
  const [theme, setTheme] = useState<'space' | 'ticker' | 'shared'>('space');
  const [text, setText] = useState('');
  const [state, setState] = useState<AddState>('idle');
  const [progress, setProgress] = useState('');
  const [err, setErr] = useState('');

  const canSubmit = title.trim() && text.trim() && state !== 'loading';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setState('loading');
    setProgress('EMBEDDING...');
    setErr('');

    try {
      const res = await fetch('/api/corpus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim(), theme, text: text.trim() }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `HTTP ${res.status}`);
      }

      const data = await res.json();
      setProgress(`✓ INDEXED ${data.section_count} SECTIONS`);
      setState('done');
      setTitle('');
      setText('');
      onAdded();

      setTimeout(() => {
        setState('idle');
        setProgress('');
      }, 3000);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'UNKNOWN ERROR';
      setErr(msg.toUpperCase());
      setState('error');
    }
  };

  const inputStyle: React.CSSProperties = {
    background: 'var(--color-bg-card)',
    border: '1px solid var(--color-neon-cyan)',
    color: 'var(--color-neon-cyan)',
    fontFamily: 'var(--font-family-pixel)',
    fontSize: '10px',
    outline: 'none',
    width: '100%',
    padding: '6px 8px',
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div
        className="text-xs font-pixel tracking-widest pb-1"
        style={{ color: 'var(--color-neon-cyan)', borderBottom: '1px solid var(--color-neon-cyan)' }}
      >
        ▸ ADD DOCUMENT
      </div>

      {/* Title */}
      <div className="flex flex-col gap-1">
        <label className="text-[9px] font-pixel tracking-widest" style={{ color: 'rgba(0,255,159,0.6)' }}>
          TITLE
        </label>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="DOCUMENT TITLE..."
          maxLength={200}
          style={inputStyle}
          disabled={state === 'loading'}
        />
      </div>

      {/* Theme */}
      <div className="flex flex-col gap-1">
        <label className="text-[9px] font-pixel tracking-widest" style={{ color: 'rgba(0,255,159,0.6)' }}>
          THEME
        </label>
        <select
          value={theme}
          onChange={e => setTheme(e.target.value as 'space' | 'ticker' | 'shared')}
          style={inputStyle}
          disabled={state === 'loading'}
        >
          <option value="space">SPACE</option>
          <option value="ticker">TICKER</option>
          <option value="shared">SHARED</option>
        </select>
      </div>

      {/* Text */}
      <div className="flex flex-col gap-1">
        <label className="text-[9px] font-pixel tracking-widest" style={{ color: 'rgba(0,255,159,0.6)' }}>
          TEXT
        </label>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="PASTE YOUR TEXT HERE..."
          rows={6}
          style={{ ...inputStyle, resize: 'vertical', lineHeight: '1.6' }}
          disabled={state === 'loading'}
        />
      </div>

      {/* Status */}
      {state === 'loading' && (
        <div className="text-[9px] font-pixel animated-ellipsis" style={{ color: 'var(--color-neon-cyan)' }}>
          ⟳ {progress}
        </div>
      )}
      {state === 'done' && (
        <div className="text-[9px] font-pixel" style={{ color: 'var(--color-success)' }}>
          {progress}
        </div>
      )}
      {state === 'error' && (
        <div className="text-[9px] font-pixel" style={{ color: 'var(--color-error)' }}>
          ⚠ {err}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={!canSubmit}
        className="px-4 py-2 text-xs font-pixel tracking-widest transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        style={{
          background: canSubmit ? 'var(--color-neon-cyan)' : 'transparent',
          color: canSubmit ? 'var(--color-bg-darker)' : 'var(--color-neon-cyan)',
          border: '1px solid var(--color-neon-cyan)',
        }}
      >
        {state === 'loading' ? 'PROCESSING...' : 'EMBED + ADD →'}
      </button>
    </form>
  );
}

// ── URL Ingest Form ───────────────────────────────────────────────────────────

function UrlIngestForm({ onAdded }: { onAdded: () => void }) {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [theme, setTheme] = useState<'space' | 'ticker' | 'shared'>('space');
  const [state, setState] = useState<AddState>('idle');
  const [progress, setProgress] = useState('');
  const [err, setErr] = useState('');

  const canSubmit = url.trim() && state !== 'loading';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setState('loading');
    setProgress('FETCHING URL...');
    setErr('');

    try {
      const res = await fetch('/api/corpus/url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim(), title: title.trim() || undefined, theme }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `HTTP ${res.status}`);
      }

      const data = await res.json();
      setProgress(`✓ INDEXED ${data.section_count} SECTIONS — "${data.title}"`);
      setState('done');
      setUrl('');
      setTitle('');
      onAdded();

      setTimeout(() => { setState('idle'); setProgress(''); }, 4000);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'UNKNOWN ERROR';
      setErr(msg.toUpperCase());
      setState('error');
    }
  };

  const inputStyle: React.CSSProperties = {
    background: 'var(--color-bg-card)',
    border: '1px solid var(--color-neon-cyan)',
    color: 'var(--color-neon-cyan)',
    fontFamily: 'var(--font-family-pixel)',
    fontSize: '10px',
    outline: 'none',
    width: '100%',
    padding: '6px 8px',
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div
        className="text-xs font-pixel tracking-widest pb-1"
        style={{ color: 'var(--color-neon-cyan)', borderBottom: '1px solid var(--color-neon-cyan)' }}
      >
        ▸ INGEST FROM URL
      </div>

      {/* URL */}
      <div className="flex flex-col gap-1">
        <label className="text-[9px] font-pixel tracking-widest" style={{ color: 'rgba(0,255,159,0.6)' }}>
          URL
        </label>
        <input
          type="url"
          value={url}
          onChange={e => setUrl(e.target.value)}
          placeholder="HTTPS://..."
          style={inputStyle}
          disabled={state === 'loading'}
        />
      </div>

      {/* Title (optional) */}
      <div className="flex flex-col gap-1">
        <label className="text-[9px] font-pixel tracking-widest" style={{ color: 'rgba(0,255,159,0.6)' }}>
          TITLE <span style={{ color: 'rgba(0,255,159,0.35)' }}>(OPTIONAL — AUTO-DETECTED)</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="LEAVE BLANK TO USE PAGE TITLE..."
          maxLength={200}
          style={inputStyle}
          disabled={state === 'loading'}
        />
      </div>

      {/* Theme */}
      <div className="flex flex-col gap-1">
        <label className="text-[9px] font-pixel tracking-widest" style={{ color: 'rgba(0,255,159,0.6)' }}>
          THEME
        </label>
        <select
          value={theme}
          onChange={e => setTheme(e.target.value as 'space' | 'ticker' | 'shared')}
          style={inputStyle}
          disabled={state === 'loading'}
        >
          <option value="space">SPACE</option>
          <option value="ticker">TICKER</option>
          <option value="shared">SHARED</option>
        </select>
      </div>

      {/* Status */}
      {state === 'loading' && (
        <div className="text-[9px] font-pixel animated-ellipsis" style={{ color: 'var(--color-neon-cyan)' }}>
          ⟳ {progress}
        </div>
      )}
      {state === 'done' && (
        <div className="text-[9px] font-pixel" style={{ color: 'var(--color-success)' }}>
          {progress}
        </div>
      )}
      {state === 'error' && (
        <div className="text-[9px] font-pixel break-words" style={{ color: 'var(--color-error)' }}>
          ⚠ {err}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={!canSubmit}
        className="px-4 py-2 text-xs font-pixel tracking-widest transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        style={{
          background: canSubmit ? 'var(--color-neon-cyan)' : 'transparent',
          color: canSubmit ? 'var(--color-bg-darker)' : 'var(--color-neon-cyan)',
          border: '1px solid var(--color-neon-cyan)',
        }}
      >
        {state === 'loading' ? 'FETCHING...' : 'FETCH + EMBED →'}
      </button>
    </form>
  );
}

// ── Upload Document Form ──────────────────────────────────────────────────────

const ACCEPTED_EXTENSIONS = '.pdf,.docx,.pptx,.doc,.txt,.md,.csv';
const ACCEPTED_LABEL = 'PDF, DOCX, PPTX, TXT, MD';

function UploadDocForm({ onAdded }: { onAdded: () => void }) {
  const [title, setTitle] = useState('');
  const [theme, setTheme] = useState<'space' | 'ticker' | 'shared'>('space');
  const [file, setFile] = useState<File | null>(null);
  const [state, setState] = useState<AddState>('idle');
  const [progress, setProgress] = useState('');
  const [err, setErr] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canSubmit = title.trim() && file && state !== 'loading';

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
    // Auto-fill title from filename if blank
    if (f && !title.trim()) {
      setTitle(f.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' '));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || !file) return;

    setState('loading');
    setProgress('UPLOADING + CONVERTING...');
    setErr('');

    try {
      const form = new FormData();
      form.append('file', file);
      form.append('title', title.trim());
      form.append('theme', theme);

      const res = await fetch('/api/corpus/upload', { method: 'POST', body: form });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        // Surface the docling_required hint as a friendlier message
        if (data.docling_required) {
          throw new Error('DOCLING NOT CONFIGURED — UPLOAD A .TXT OR .MD FILE, OR SET DOCLING_API_URL IN .ENV.LOCAL');
        }
        throw new Error(data.error || `HTTP ${res.status}`);
      }

      const data = await res.json();
      const via = data.via_docling ? ' VIA DOCLING' : '';
      setProgress(`✓ INDEXED ${data.section_count} SECTIONS${via}`);
      setState('done');
      setTitle('');
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      onAdded();

      setTimeout(() => { setState('idle'); setProgress(''); }, 4000);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'UNKNOWN ERROR';
      setErr(msg);
      setState('error');
    }
  };

  const inputStyle: React.CSSProperties = {
    background: 'var(--color-bg-card)',
    border: '1px solid var(--color-neon-cyan)',
    color: 'var(--color-neon-cyan)',
    fontFamily: 'var(--font-family-pixel)',
    fontSize: '10px',
    outline: 'none',
    width: '100%',
    padding: '6px 8px',
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div
        className="text-xs font-pixel tracking-widest pb-1"
        style={{ color: 'var(--color-neon-cyan)', borderBottom: '1px solid var(--color-neon-cyan)' }}
      >
        ▸ UPLOAD DOCUMENT
      </div>

      {/* Title */}
      <div className="flex flex-col gap-1">
        <label className="text-[9px] font-pixel tracking-widest" style={{ color: 'rgba(0,255,159,0.6)' }}>
          TITLE
        </label>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="DOCUMENT TITLE..."
          maxLength={200}
          style={inputStyle}
          disabled={state === 'loading'}
        />
      </div>

      {/* Theme */}
      <div className="flex flex-col gap-1">
        <label className="text-[9px] font-pixel tracking-widest" style={{ color: 'rgba(0,255,159,0.6)' }}>
          THEME
        </label>
        <select
          value={theme}
          onChange={e => setTheme(e.target.value as 'space' | 'ticker' | 'shared')}
          style={inputStyle}
          disabled={state === 'loading'}
        >
          <option value="space">SPACE</option>
          <option value="ticker">TICKER</option>
          <option value="shared">SHARED</option>
        </select>
      </div>

      {/* File picker */}
      <div className="flex flex-col gap-1">
        <label className="text-[9px] font-pixel tracking-widest" style={{ color: 'rgba(0,255,159,0.6)' }}>
          FILE <span style={{ color: 'rgba(0,255,159,0.35)' }}>({ACCEPTED_LABEL})</span>
        </label>
        <div
          className="flex items-center gap-2 px-2 py-2 cursor-pointer"
          style={{ border: '1px solid var(--color-neon-cyan)', background: 'var(--color-bg-card)' }}
          onClick={() => fileInputRef.current?.click()}
        >
          <span className="text-[9px] font-pixel" style={{ color: 'var(--color-neon-cyan)' }}>
            {file ? file.name : 'CHOOSE FILE...'}
          </span>
          {file && (
            <span className="text-[9px] font-pixel ml-auto shrink-0" style={{ color: 'rgba(0,255,159,0.4)' }}>
              {(file.size / 1024).toFixed(0)}KB
            </span>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_EXTENSIONS}
          onChange={handleFile}
          className="hidden"
          disabled={state === 'loading'}
        />
      </div>

      {/* Docling hint */}
      <p className="text-[9px] font-pixel" style={{ color: 'rgba(0,255,159,0.35)' }}>
        PDF/DOCX/PPTX REQUIRE DOCLING_API_URL. TXT/MD WORK WITHOUT IT.
      </p>

      {/* Status */}
      {state === 'loading' && (
        <div className="text-[9px] font-pixel animated-ellipsis" style={{ color: 'var(--color-neon-cyan)' }}>
          ⟳ {progress}
        </div>
      )}
      {state === 'done' && (
        <div className="text-[9px] font-pixel" style={{ color: 'var(--color-success)' }}>
          {progress}
        </div>
      )}
      {state === 'error' && (
        <div className="text-[9px] font-pixel break-words" style={{ color: 'var(--color-error)' }}>
          ⚠ {err}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={!canSubmit}
        className="px-4 py-2 text-xs font-pixel tracking-widest transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        style={{
          background: canSubmit ? 'var(--color-neon-cyan)' : 'transparent',
          color: canSubmit ? 'var(--color-bg-darker)' : 'var(--color-neon-cyan)',
          border: '1px solid var(--color-neon-cyan)',
        }}
      >
        {state === 'loading' ? 'PROCESSING...' : 'EMBED + ADD →'}
      </button>
    </form>
  );
}

// Made with Bob
