import React, { useSyncExternalStore } from 'react';
import { render as rtlRender } from '@testing-library/react';
import { ReceiptsContext } from '../context/ReceiptsContext';

function createStore(initial: any) {
  let state = { ...initial };
  const listeners = new Set<() => void>();
  const notify = () => { for (const l of listeners) l(); };
  const get = () => state;
  const subscribe = (l: () => void) => { listeners.add(l); return () => listeners.delete(l); };
  const setState = (patch: any) => { state = { ...state, ...patch }; notify(); };
  const setFiltersPatch = (fp: any) => setState({ filters: { ...state.filters, ...fp } });
  const store: any = { get, subscribe, setState, setFiltersPatch };
  return store;
}

export function render(ui: React.ReactNode, overrides: Partial<any> = {}) {
  const INITIAL: any = {
    receipts: [],
    loading: false,
    error: null,
    filters: { search: '', categories: [], dateFrom: undefined, dateTo: undefined },
    view: 'timeline' as const,
    selectedChapterId: null,
    favoritedMomentIds: [],
    lastViewedChapterId: null,
    surpriseMomentId: null,
    moments: [],
    chapters: [],
    filteredReceipts: [],
    timelineGroups: [],
    categoryDistribution: [],
    monthlySpending: [],
    monthlyListening: [],
    placeFrequency: [],
    ...overrides,
  };
  const store = createStore(INITIAL);
  store.setSearch = (s: string) => store.setFiltersPatch({ search: s });
  store.toggleCategory = (c: any) => {
    const f = store.get().filters;
    const has = f.categories.includes(c);
    store.setFiltersPatch({ categories: has ? f.categories.filter((x: any) => x !== c) : [...f.categories, c] });
  };
  store.setDateRange = (from?: string, to?: string) => store.setFiltersPatch({ dateFrom: from, dateTo: to });
  store.resetFilters = () => store.setState({ filters: { search: '', categories: [], dateFrom: undefined, dateTo: undefined } });
  store.setView = (v: any) => store.setState({ view: v });
  store.setSelectedChapterId = (id: string | null) => store.setState({ selectedChapterId: id, ...(id ? { lastViewedChapterId: id } : {}) });
  store.toggleFavoriteMoment = (id: string) => {
    const f: string[] = store.get().favoritedMomentIds ?? [];
    store.setState({ favoritedMomentIds: f.includes(id) ? f.filter((x: string) => x !== id) : [...f, id] });
  };
  store.reload = () => {};

  function Provider({ children }: { children: React.ReactNode }) {
    const value: any = useSyncExternalStore(store.subscribe, store.get, store.get);
    const api = { ...(value as object), ...pickFns(store) };
    return React.createElement(ReceiptsContext.Provider, { value: api as any }, children);
  }

  const result = rtlRender(React.createElement(Provider, null, ui));
  (store as any).getState = store.get;
  return { ...result, ctx: store } as any;
}

function pickFns(store: any) {
  return {
    setSearch: store.setSearch,
    toggleCategory: store.toggleCategory,
    setDateRange: store.setDateRange,
    resetFilters: store.resetFilters,
    setView: store.setView,
    setSelectedChapterId: store.setSelectedChapterId,
    toggleFavoriteMoment: store.toggleFavoriteMoment,
    reload: store.reload,
  };
}
