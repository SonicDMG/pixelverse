'use client';

/**
 * useSuggestedQuestions
 *
 * Generates context-aware question chips for the generalist mode based on
 * whichever corpus documents are currently selected.
 *
 * Behaviour:
 *   - All docs selected (activeDocIds === undefined) → return static baked questions
 *   - Subset selected → immediately show template questions, then replace with
 *     LLM-generated questions once the debounced fetch resolves (Option D)
 *   - Results cached by sorted doc-ID fingerprint so re-selecting the same set
 *     is instant with no extra LLM call
 *   - If the LLM call fails, template questions are kept as the final answer
 */

import { useState, useEffect, useRef, useCallback } from 'react';

export interface SuggestedQuestionsState {
  /** The questions to display — templates initially, then LLM results */
  questions: string[];
  /** True while the LLM fetch is in-flight (chips shimmer) */
  loading: boolean;
}

interface CorpusDocMeta {
  id: string;
  title: string;
}

const DEBOUNCE_MS = 1400;

// Cache keyed by sorted-joined doc IDs
const _cache = new Map<string, string[]>();

function cacheKey(ids: string[]): string {
  return [...ids].sort().join('|');
}

/**
 * Build instant template questions from document titles.
 * Generic but immediately meaningful — shown while LLM call is in flight.
 */
function buildTemplates(docs: CorpusDocMeta[]): string[] {
  if (docs.length === 0) return [];

  if (docs.length === 1) {
    const t = docs[0].title;
    return [
      `What are the key topics in ${t}?`,
      `Summarize the main findings of ${t}`,
      `What is the most important insight from ${t}?`,
      `Show me a timeline of events in ${t}`,
      `What are the key metrics or numbers in ${t}?`,
    ];
  }

  if (docs.length === 2) {
    const [a, b] = docs;
    return [
      `Compare ${a.title} and ${b.title}`,
      `What are the key themes across both documents?`,
      `Summarize the main findings of ${a.title}`,
      `Summarize the main findings of ${b.title}`,
      `What do ${a.title} and ${b.title} have in common?`,
    ];
  }

  // 3+ docs
  const titles = docs.map(d => d.title);
  return [
    `What are the common themes across these documents?`,
    `Summarize the key findings from ${titles[0]}`,
    `Compare the main ideas across the selected documents`,
    `What are the most important metrics or numbers?`,
    `Show me a timeline of key events across these documents`,
  ];
}

export function useSuggestedQuestions(
  activeDocIds: string[] | undefined,
  allDocs: CorpusDocMeta[],
  staticQuestions: string[]
): SuggestedQuestionsState {
  const [questions, setQuestions] = useState<string[]>(staticQuestions);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const fetchLlmQuestions = useCallback(async (ids: string[], signal: AbortSignal) => {
    const key = cacheKey(ids);

    // Cache hit — no fetch needed
    if (_cache.has(key)) {
      return _cache.get(key)!;
    }

    const res = await fetch('/api/corpus/suggest-questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ doc_ids: ids }),
      signal,
    });

    if (!res.ok) throw new Error(`suggest-questions ${res.status}`);
    const data = await res.json() as { questions?: string[] };
    console.log('[useSuggestedQuestions] API response:', JSON.stringify(data));
    const qs = data.questions ?? [];
    console.log('[useSuggestedQuestions] parsed questions:', qs);

    if (qs.length > 0) _cache.set(key, qs);
    return qs;
  }, []);

  useEffect(() => {
    console.log('[useSuggestedQuestions] effect fired — activeDocIds:', activeDocIds, '| allDocs.length:', allDocs.length);

    // Clear any pending debounce + in-flight request
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (abortRef.current) abortRef.current.abort();

    // All docs selected → restore static defaults immediately
    if (activeDocIds === undefined) {
      console.log('[useSuggestedQuestions] all-docs mode → static questions:', staticQuestions.length);
      setQuestions(staticQuestions);
      setLoading(false);
      return;
    }

    // Empty selection → nothing to ask about
    if (activeDocIds.length === 0) {
      console.log('[useSuggestedQuestions] empty selection → clearing questions');
      setQuestions([]);
      setLoading(false);
      return;
    }

    const key = cacheKey(activeDocIds);

    // Cache hit → show immediately, no loading state
    if (_cache.has(key)) {
      console.log('[useSuggestedQuestions] cache hit for key:', key);
      setQuestions(_cache.get(key)!);
      setLoading(false);
      return;
    }

    // Show templates immediately while the LLM call is debounced
    const selectedDocs = allDocs.filter(d => activeDocIds.includes(d.id));
    console.log('[useSuggestedQuestions] selectedDocs:', selectedDocs.map(d => d.title));
    const templates = buildTemplates(selectedDocs);
    console.log('[useSuggestedQuestions] templates built:', templates);
    setQuestions(templates);
    setLoading(true);

    debounceRef.current = setTimeout(async () => {
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const llmQuestions = await fetchLlmQuestions(activeDocIds, controller.signal);
        console.log('[useSuggestedQuestions] LLM questions received:', llmQuestions);
        if (llmQuestions.length > 0) {
          setQuestions(llmQuestions);
        }
        // If LLM returned nothing, keep templates
      } catch (err: unknown) {
        if ((err as Error)?.name !== 'AbortError') {
          console.warn('[useSuggestedQuestions] LLM fetch failed, keeping templates:', err);
        }
      } finally {
        setLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (abortRef.current) abortRef.current.abort();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeDocIds?.join('|') ?? 'all', staticQuestions.join('|')]);

  return { questions, loading };
}

// Made with Bob
