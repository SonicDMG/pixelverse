'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

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
}

export function KnowledgePanel({ open, onClose }: KnowledgePanelProps) {
  const [tab, setTab] = useState<'corpus' | 'my-sources'>('corpus');
  const [docs, setDocs] = useState<CorpusDocument[]>([]);
  const [grouped, setGrouped] = useState<Record<string, CorpusDocument[]>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  const fetchCorpus = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/corpus');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setDocs(data.documents ?? []);
      setGrouped(data.grouped ?? {});
    } catch {
      setError('FAILED TO LOAD CORPUS');
    } finally {
      setLoading(false);
    }
  }, []);

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
        className="relative flex flex-col h-full w-full max-w-lg"
        style={{
          background: 'var(--color-bg-darker)',
          borderLeft: '2px solid var(--color-neon-cyan)',
          boxShadow: '-4px 0 24px rgba(0,255,159,0.18)',
        }}
        onClick={e => e.stopPropagation()}
      >
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
            <CorpusTab grouped={grouped} />
          )}

          {!loading && !error && tab === 'my-sources' && (
            <MySourcesTab
              docs={docs.filter(d => d.source === 'user')}
              onDelete={handleDelete}
              onAdded={fetchCorpus}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// ── Corpus Tab ────────────────────────────────────────────────────────────────

function CorpusTab({ grouped }: { grouped: Record<string, CorpusDocument[]> }) {
  const themes = Object.keys(grouped).sort();

  if (!themes.length) {
    return (
      <p className="text-xs font-pixel text-center mt-8" style={{ color: 'rgba(0,255,159,0.5)' }}>
        NO DOCUMENTS IN CORPUS
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {themes.map(theme => (
        <ThemeGroup key={theme} theme={theme} docs={grouped[theme]} />
      ))}
    </div>
  );
}

function ThemeGroup({ theme, docs }: { theme: string; docs: CorpusDocument[] }) {
  const themeColor = theme === 'ticker' ? 'var(--color-ticker-primary)' : 'var(--color-neon-cyan)';

  return (
    <div>
      <div
        className="text-xs font-pixel tracking-widest mb-2 pb-1"
        style={{ color: themeColor, borderBottom: `1px solid ${themeColor}` }}
      >
        ▸ {theme.toUpperCase()} ({docs.length})
      </div>
      <div className="flex flex-col gap-1">
        {docs.map(doc => (
          <DocRow key={doc.id} doc={doc} />
        ))}
      </div>
    </div>
  );
}

function DocRow({ doc }: { doc: CorpusDocument }) {
  const sourceColor =
    doc.source === 'wikipedia'
      ? '#aabfff'
      : doc.source === 'user'
      ? 'var(--color-neon-magenta)'
      : 'var(--color-accent)';

  return (
    <div
      className="flex items-center justify-between gap-2 px-2 py-1 text-xs font-pixel"
      style={{
        background: 'var(--color-bg-card)',
        border: '1px solid rgba(0,255,159,0.15)',
      }}
    >
      <div className="flex items-center gap-2 min-w-0">
        <span
          className="shrink-0 px-1 text-[9px]"
          style={{
            color: sourceColor,
            border: `1px solid ${sourceColor}`,
          }}
        >
          {doc.source.toUpperCase()}
        </span>
        {doc.url ? (
          <a
            href={doc.url}
            target="_blank"
            rel="noopener noreferrer"
            className="truncate hover:underline"
            style={{ color: 'rgba(0,255,159,0.85)' }}
            title={doc.title}
          >
            {doc.title}
          </a>
        ) : (
          <span className="truncate" style={{ color: 'rgba(0,255,159,0.85)' }} title={doc.title}>
            {doc.title}
          </span>
        )}
      </div>
      <span className="shrink-0" style={{ color: 'rgba(0,255,159,0.4)' }}>
        {doc.section_count}§
      </span>
    </div>
  );
}

// ── My Sources Tab ────────────────────────────────────────────────────────────

interface MySourcesTabProps {
  docs: CorpusDocument[];
  onDelete: (id: string) => void;
  onAdded: () => void;
}

function MySourcesTab({ docs, onDelete, onAdded }: MySourcesTabProps) {
  return (
    <div className="flex flex-col gap-6">
      <AddDocForm onAdded={onAdded} />

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
              <UserDocRow key={doc.id} doc={doc} onDelete={onDelete} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function UserDocRow({
  doc,
  onDelete,
}: {
  doc: CorpusDocument;
  onDelete: (id: string) => void;
}) {
  const [confirming, setConfirming] = useState(false);

  return (
    <div
      className="flex items-center justify-between gap-2 px-2 py-1 text-xs font-pixel"
      style={{
        background: 'var(--color-bg-card)',
        border: '1px solid rgba(255,0,255,0.2)',
      }}
    >
      <div className="flex items-center gap-2 min-w-0">
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

      <div className="flex items-center gap-2 shrink-0">
        <span style={{ color: 'rgba(0,255,159,0.4)' }}>{doc.section_count}§</span>
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
            onClick={() => setConfirming(true)}
            className="text-[9px] px-1 py-0.5 transition-colors"
            style={{ color: 'var(--color-error)', border: '1px solid var(--color-error)' }}
            aria-label={`Delete ${doc.title}`}
          >
            DEL
          </button>
        )}
      </div>
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
        <div className="text-[9px] font-pixel" style={{ color: 'var(--color-neon-cyan)' }}>
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

// Made with Bob
