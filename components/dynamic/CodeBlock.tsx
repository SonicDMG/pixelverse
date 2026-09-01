'use client';

import { useState, useCallback } from 'react';

interface CodeBlockProps {
  code: string;
  language?: string;
  title?: string;
  showLineNumbers?: boolean;
}

/**
 * CodeBlock - Displays raw code / markup with pixel-retro styling
 *
 * Used when the agent needs to show DocLang markup, Markdown source,
 * JSON, YAML, or any other verbatim text that must be read as-written
 * rather than rendered.
 */
export function CodeBlock({
  code,
  language = 'text',
  title,
  showLineNumbers = true,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable — silent fail
    }
  }, [code]);

  const lines = code.split('\n');

  // Map language slugs to a display label
  const LANG_LABELS: Record<string, string> = {
    doclang: 'DocLang',
    markdown: 'Markdown',
    md: 'Markdown',
    json: 'JSON',
    yaml: 'YAML',
    yml: 'YAML',
    typescript: 'TypeScript',
    ts: 'TypeScript',
    javascript: 'JavaScript',
    js: 'JavaScript',
    python: 'Python',
    py: 'Python',
    bash: 'Bash',
    sh: 'Bash',
    text: 'Text',
    xml: 'XML',
    html: 'HTML',
    css: 'CSS',
    sql: 'SQL',
  };

  const langLabel = LANG_LABELS[language.toLowerCase()] ?? language.toUpperCase();

  return (
    <div className="w-full bg-[#080b1a] border-2 border-[#4169E1]/50 rounded-lg pixel-border overflow-hidden shadow-lg hover:border-[#00CED1]/60 transition-all duration-300">
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#0d1230] border-b border-[#4169E1]/30">
        <div className="flex items-center gap-3">
          {/* Traffic-light dots (purely decorative) */}
          <span className="w-3 h-3 rounded-full bg-[#ff5f57] opacity-70" />
          <span className="w-3 h-3 rounded-full bg-[#febc2e] opacity-70" />
          <span className="w-3 h-3 rounded-full bg-[#28c840] opacity-70" />
          <span className="font-mono text-xs text-[#4169E1] ml-2 uppercase tracking-widest">
            {langLabel}
          </span>
          {title && (
            <span className="font-pixel text-xs text-white/50 truncate max-w-xs">
              — {title}
            </span>
          )}
        </div>
        <button
          onClick={handleCopy}
          aria-label="Copy code"
          className="font-pixel text-xs px-3 py-1 border border-[#4169E1]/40 text-[#4169E1] hover:border-[#00CED1] hover:text-[#00CED1] transition-all duration-200 rounded"
        >
          {copied ? '✓ COPIED' : 'COPY'}
        </button>
      </div>

      {/* Code body */}
      <div className="overflow-x-auto">
        <pre className="p-4 text-xs leading-relaxed font-mono text-green-300/90 select-all">
          {showLineNumbers ? (
            <table className="w-full border-collapse">
              <tbody>
                {lines.map((line, i) => (
                  <tr key={i} className="group">
                    <td className="pr-4 select-none text-right text-[#4169E1]/40 group-hover:text-[#4169E1]/70 w-8 align-top text-xs leading-relaxed">
                      {i + 1}
                    </td>
                    <td className="whitespace-pre align-top text-green-300/90 group-hover:text-green-200">
                      {line || '\u00a0'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <code className="whitespace-pre">{code}</code>
          )}
        </pre>
      </div>
    </div>
  );
}

// Made with Bob
