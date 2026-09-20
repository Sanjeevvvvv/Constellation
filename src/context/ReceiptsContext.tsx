import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { Receipt, Moment, Chapter, Filters, View } from '../types/receipt';
import { discoverConnections } from '../services/connectionEngine';
import { generateChapters } from '../services/storyEngine';
import * as insights from '../services/patternInsights';
import { selectFilteredReceipts, selectTimelineGroups } from '../selectors';

interface ReceiptsState {
  receipts: Receipt[];
  loading: boolean;
  error: string | null;
  filters: Filters;
  view: View;
  selectedChapterId: string | null;
  favoritedMomentIds: string[];
  lastViewedChapterId: string | null;
  surpriseMomentId: string | null;
}

interface ReceiptsContextValue extends ReceiptsState {
  moments: Moment[];
  chapters: Chapter[];
  filteredReceipts: Receipt[];
  timelineGroups: ReturnType<typeof selectTimelineGroups>;
  categoryDistribution: ReturnType<typeof insights.categoryDistribution>;
  monthlySpending: ReturnType<typeof insights.monthlySpending>;
  monthlyListening: ReturnType<typeof insights.monthlyListening>;
  placeFrequency: ReturnType<typeof insights.placeVisitFrequency>;
  setSearch: (s: string) => void;
  toggleCategory: (c: Filters['categories'][number]) => void;
  setDateRange: (from?: string, to?: string) => void;
  setView: (v: View) => void;
  setSelectedChapterId: (id: string | null) => void;
  toggleFavoriteMoment: (id: string) => void;
  resetFilters: () => void;
  reload: () => void;
}

const ReceiptsContext = createContext<ReceiptsContextValue | undefined>(undefined);

const STORAGE_KEYS = {
  favorites: 'constellation:favorites',
  lastChapter: 'constellation:lastChapter',
} as const;

function loadStored<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function ReceiptsProvider({ children }: { children: React.ReactNode }) {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>({ search: '', categories: [], dateFrom: undefined, dateTo: undefined });
  const [view, setView] = useState<View>('timeline');
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);
  const [favoritedMomentIds, setFavoritedMomentIds] = useState<string[]>(() => loadStored(STORAGE_KEYS.favorites, []));
  const [lastViewedChapterId, setLastViewedChapterId] = useState<string | null>(() => loadStored(STORAGE_KEYS.lastChapter, null));
  const [surpriseMomentId, setSurpriseMomentId] = useState<string | null>(null);

  const fetchReceipts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/receipts.json', { cache: 'no-cache' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as Receipt[];
      setReceipts(data);
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load receipts');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchReceipts();
  }, [fetchReceipts]);

  const moments = useMemo(() => discoverConnections(receipts), [receipts]);
  const chapters = useMemo(() => generateChapters(receipts, moments), [receipts, moments]);
  const filteredReceipts = useMemo(() => selectFilteredReceipts(receipts, filters), [receipts, filters]);
  const timelineGroups = useMemo(() => selectTimelineGroups(filteredReceipts), [filteredReceipts]);
  const categoryDistribution = useMemo(() => insights.categoryDistribution(filteredReceipts), [filteredReceipts]);
  const monthlySpending = useMemo(() => insights.monthlySpending(filteredReceipts), [filteredReceipts]);
  const monthlyListening = useMemo(() => insights.monthlyListening(filteredReceipts), [filteredReceipts]);
  const placeFrequency = useMemo(() => insights.placeVisitFrequency(filteredReceipts), [filteredReceipts]);

  useEffect(() => {
    if (surpriseMomentId) return;
    if (moments.length === 0) return;
    const candidates = moments.filter(m => m.receiptIds.length >= 5);
    const pool = candidates.length > 0 ? candidates : moments;
    const pick = pool[Math.floor(Math.random() * pool.length)];
    setSurpriseMomentId(pick.id);
  }, [moments, surpriseMomentId]);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEYS.favorites, JSON.stringify(favoritedMomentIds)); } catch { /* noop */ }
  }, [favoritedMomentIds]);

  useEffect(() => {
    if (!lastViewedChapterId) return;
    try { localStorage.setItem(STORAGE_KEYS.lastChapter, JSON.stringify(lastViewedChapterId)); } catch { /* noop */ }
  }, [lastViewedChapterId]);

  const setSearch = useCallback((s: string) => setFilters(f => ({ ...f, search: s })), []);
  const toggleCategory = useCallback((c: any) => setFilters(f => {
    const has = f.categories.includes(c);
    return { ...f, categories: has ? f.categories.filter(x => x !== c) : [...f.categories, c] };
  }), []);
  const setDateRange = useCallback((from?: string, to?: string) => setFilters(f => ({ ...f, dateFrom: from, dateTo: to })), []);
  const resetFilters = useCallback(() => setFilters({ search: '', categories: [], dateFrom: undefined, dateTo: undefined }), []);
  const toggleFavoriteMoment = useCallback((id: string) => {
    setFavoritedMomentIds(ids => ids.includes(id) ? ids.filter(x => x !== id) : [...ids, id]);
  }, []);

  const setSelectedChapterIdWrapper = useCallback((id: string | null) => {
    setSelectedChapterId(id);
    if (id) setLastViewedChapterId(id);
  }, []);

  const value: ReceiptsContextValue = {
    receipts, loading, error, filters, view, selectedChapterId, favoritedMomentIds, lastViewedChapterId, surpriseMomentId,
    moments, chapters, filteredReceipts, timelineGroups,
    categoryDistribution, monthlySpending, monthlyListening, placeFrequency,
    setSearch, toggleCategory, setDateRange, setView,
    setSelectedChapterId: setSelectedChapterIdWrapper,
    toggleFavoriteMoment, resetFilters, reload: fetchReceipts,
  };

  return React.createElement(ReceiptsContext.Provider, { value }, children);
}

export { ReceiptsContext };
