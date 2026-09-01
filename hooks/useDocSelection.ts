'use client';

/**
 * useDocSelection
 *
 * Manages the set of corpus document IDs the user has selected for generalist
 * search. Selection is persisted in localStorage so it survives page refreshes.
 *
 * Semantics:
 *   - When allDocs is empty the selection is considered "all" (no filter sent).
 *   - When allDocs is non-empty the selection defaults to all doc IDs on first
 *     load, then honours whatever the user saved.
 *   - selectedIds === null means "use all docs" (no filter). Once the user
 *     interacts, it becomes a Set<string>.
 *
 * Bulk helpers:
 *   selectAll()          — include every doc in allDocs
 *   deselectAll()        — exclude every doc (empty set → no context)
 *   selectByTheme(t)     — select only docs whose theme === t
 *   deselectByTheme(t)   — remove docs whose theme === t
 *   toggleTheme(t)       — if all docs in theme are selected, deselect them;
 *                          otherwise select them (standard "group checkbox" UX)
 */

import { useState, useCallback, useEffect, useMemo } from 'react';

const STORAGE_KEY = 'pixelverse_doc_selection';

export interface SelectableDoc {
  id: string;
  theme: string;
}

const CACHE_STORAGE_KEY = 'pixelverse_doc_cache';

export interface DocSelectionState {
  /** null = all docs selected (no explicit filter) */
  selectedIds: Set<string> | null;
  /** true when every doc in allDocs is selected (or selection is null) */
  isAllSelected: boolean;
  /** Returns true if a given doc id is selected */
  isSelected: (id: string) => boolean;
  /** Toggle a single doc */
  toggle: (id: string) => void;
  /** Select every doc */
  selectAll: () => void;
  /** Deselect every doc */
  deselectAll: () => void;
  /** Select only docs matching theme */
  selectByTheme: (theme: string) => void;
  /** Deselect docs matching theme */
  deselectByTheme: (theme: string) => void;
  /** Toggle entire theme group */
  toggleTheme: (theme: string) => void;
  /** True if every doc in this theme group is currently selected */
  isThemeAllSelected: (theme: string) => boolean;
  /** True if some (but not all) docs in this theme are selected */
  isThemePartiallySelected: (theme: string) => boolean;
  /**
   * The array of IDs to send with the API request.
   * Returns undefined when all docs are selected (server uses no-filter path).
   */
  activeDocIds: string[] | undefined;
  /** Set of doc IDs whose full text should be loaded directly into the prompt */
  cachedIds: Set<string>;
  /** Returns true if a given doc id is cached */
  isCached: (id: string) => boolean;
  /** Toggle cache flag for a single doc */
  toggleCache: (id: string) => void;
  /** Array of cached doc IDs to send with the API request (empty = none cached) */
  activeCachedDocIds: string[] | undefined;
}

export function useDocSelection(allDocs: SelectableDoc[]): DocSelectionState {
  const allIds = useMemo(() => allDocs.map(d => d.id), [allDocs]);

  // Initialise from localStorage, falling back to null (= all selected)
  const [selectedIds, setSelectedIds] = useState<Set<string> | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const arr = JSON.parse(raw) as string[];
      if (!Array.isArray(arr)) return null;
      return new Set(arr);
    } catch {
      return null;
    }
  });

  // When allDocs first arrives (async corpus fetch), initialise selection to all
  useEffect(() => {
    if (allIds.length === 0) return;
    if (selectedIds === null) {
      // First meaningful load — default to everything selected
      setSelectedIds(new Set(allIds));
    } else {
      // Prune stale IDs that no longer exist in the corpus
      setSelectedIds(prev => {
        if (!prev) return new Set(allIds);
        const pruned = new Set([...prev].filter(id => allIds.includes(id)));
        // If nothing survived pruning, reset to all
        return pruned.size > 0 ? pruned : new Set(allIds);
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allIds.join(',')]);

  // Persist selection to localStorage on every change
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (selectedIds === null) {
      localStorage.removeItem(STORAGE_KEY);
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...selectedIds]));
    }
  }, [selectedIds]);

  // ── Cache state ────────────────────────────────────────────────────────────
  const [cachedIds, setCachedIds] = useState<Set<string>>(() => {
    if (typeof window === 'undefined') return new Set();
    try {
      const raw = localStorage.getItem(CACHE_STORAGE_KEY);
      if (!raw) return new Set();
      const arr = JSON.parse(raw) as string[];
      return Array.isArray(arr) ? new Set(arr) : new Set();
    } catch {
      return new Set();
    }
  });

  // Prune stale cached IDs when corpus changes
  useEffect(() => {
    if (allIds.length === 0) return;
    setCachedIds(prev => new Set([...prev].filter(id => allIds.includes(id))));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allIds.join(',')]);

  // Persist cache to localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(CACHE_STORAGE_KEY, JSON.stringify([...cachedIds]));
  }, [cachedIds]);

  const isCached = useCallback((id: string) => cachedIds.has(id), [cachedIds]);

  const toggleCache = useCallback((id: string) => {
    setCachedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const isSelected = useCallback(
    (id: string) => selectedIds === null ? true : selectedIds.has(id),
    [selectedIds]
  );

  const isAllSelected = useMemo(() => {
    if (selectedIds === null) return true;
    return allIds.length > 0 && allIds.every(id => selectedIds.has(id));
  }, [selectedIds, allIds]);

  const toggle = useCallback((id: string) => {
    setSelectedIds(prev => {
      const base = prev ?? new Set(allIds);
      const next = new Set(base);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, [allIds]);

  const selectAll = useCallback(() => {
    setSelectedIds(new Set(allIds));
  }, [allIds]);

  const deselectAll = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const selectByTheme = useCallback((theme: string) => {
    const themeIds = allDocs.filter(d => d.theme === theme).map(d => d.id);
    setSelectedIds(prev => {
      const base = prev ?? new Set(allIds);
      const next = new Set(base);
      themeIds.forEach(id => next.add(id));
      return next;
    });
  }, [allDocs, allIds]);

  const deselectByTheme = useCallback((theme: string) => {
    const themeIds = new Set(allDocs.filter(d => d.theme === theme).map(d => d.id));
    setSelectedIds(prev => {
      const base = prev ?? new Set(allIds);
      return new Set([...base].filter(id => !themeIds.has(id)));
    });
  }, [allDocs, allIds]);

  const isThemeAllSelected = useCallback((theme: string) => {
    const themeIds = allDocs.filter(d => d.theme === theme).map(d => d.id);
    if (themeIds.length === 0) return false;
    return themeIds.every(id => isSelected(id));
  }, [allDocs, isSelected]);

  const isThemePartiallySelected = useCallback((theme: string) => {
    const themeIds = allDocs.filter(d => d.theme === theme).map(d => d.id);
    if (themeIds.length === 0) return false;
    const someSelected = themeIds.some(id => isSelected(id));
    const allSel = themeIds.every(id => isSelected(id));
    return someSelected && !allSel;
  }, [allDocs, isSelected]);

  const toggleTheme = useCallback((theme: string) => {
    if (isThemeAllSelected(theme)) {
      deselectByTheme(theme);
    } else {
      selectByTheme(theme);
    }
  }, [isThemeAllSelected, deselectByTheme, selectByTheme]);

  // What to actually send in the request body.
  // If everything is selected send undefined (server falls back to hybridSearchAll).
  const activeDocIds = useMemo((): string[] | undefined => {
    if (selectedIds === null) return undefined;
    if (isAllSelected) return undefined;
    return [...selectedIds];
  }, [selectedIds, isAllSelected]);

  // Cached doc IDs — only send if non-empty
  const activeCachedDocIds = useMemo((): string[] | undefined => {
    return cachedIds.size > 0 ? [...cachedIds] : undefined;
  }, [cachedIds]);

  return {
    selectedIds,
    isAllSelected,
    isSelected,
    toggle,
    selectAll,
    deselectAll,
    selectByTheme,
    deselectByTheme,
    toggleTheme,
    isThemeAllSelected,
    isThemePartiallySelected,
    activeDocIds,
    cachedIds,
    isCached,
    toggleCache,
    activeCachedDocIds,
  };
}

// Made with Bob
