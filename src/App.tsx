import { lazy, Suspense, useEffect, useState } from 'react';
import { Loader2, AlertTriangle, Star, Sparkles, Clock, BookOpen, BarChart3, Network, Map, Sun, Moon, GitBranch, Zap } from 'lucide-react';
import { ReceiptsProvider } from './context/ReceiptsContext';
import { useReceiptsContext } from './context/useReceiptsContext';
import { SearchBar } from './components/SearchBar';
import { FilterControls } from './components/FilterControls';
import { StoryTimeline } from './views/StoryTimeline';
import { StoryMode } from './views/StoryMode';
import type { View } from './types/receipt';

const LazyInsights = lazy(() => import('./views/PatternInsights').then(m => ({ default: m.PatternInsights })));
const LazyConnections = lazy(() => import('./views/ConnectionsGraph').then(m => ({ default: m.ConnectionsGraph })));
const LazyPlaces = lazy(() => import('./views/PlacesFrequency').then(m => ({ default: m.PlacesFrequency })));

const VIEW_TABS: Array<{ id: View; label: string; icon: any; description: string }> = [
  { id: 'timeline',    label: 'Timeline',    icon: Clock,     description: 'Chronological receipts, grouped by day' },
  { id: 'story',       label: 'Story',       icon: BookOpen,  description: 'Auto-generated narrative chapters' },
  { id: 'insights',    label: 'Insights',    icon: BarChart3, description: 'Category trends, spend & listening' },
  { id: 'connections', label: 'Connections', icon: Network,   description: 'Interactive graph of relationships' },
  { id: 'places',      label: 'Places',      icon: Map,       description: 'Visit-frequency pattern view' },
];

function LoadingState() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="text-center">
        <div className="relative mx-auto w-20 h-20 mb-6">
          <div className="absolute inset-0 rounded-full bg-indigo-500/10 animate-ping" aria-hidden />
          <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500/20 via-fuchsia-500/10 to-amber-500/20 border border-indigo-500/30 flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-indigo-300 animate-twinkle" />
          </div>
        </div>
        <div className="inline-flex items-center gap-2 theme-text-secondary text-sm">
          <Loader2 className="w-4 h-4 animate-spin" />
          Gathering constellation data…
        </div>
        <p className="mt-2 text-xs theme-text-muted max-w-sm">
          4,016 receipts are being drawn into moments, chapters, and patterns.
        </p>
      </div>
    </div>
  );
}

function ErrorState({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full rounded-2xl border border-rose-500/30 bg-gradient-to-br from-rose-500/10 to-transparent p-6 text-center">
        <div className="mx-auto w-14 h-14 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-300 mb-4">
          <AlertTriangle className="w-7 h-7" />
        </div>
        <h2 className="text-lg font-semibold theme-text-primary">Couldn't load your constellation</h2>
        <p className="mt-2 text-sm theme-text-secondary">
          The request to fetch <code className="px-1.5 py-0.5 rounded theme-surface-raised theme-text-secondary text-xs">/receipts.json</code> failed with:
        </p>
        <pre className="mt-2 text-xs text-rose-300 break-all whitespace-pre-wrap theme-surface-muted rounded-lg p-2 theme-border border">{error}</pre>
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-slate-900 font-medium text-sm hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-400/60 min-h-[44px]"
        >
          <Zap className="w-4 h-4" /> Try again
        </button>
      </div>
    </div>
  );
}

function SuspenseFallback({ label }: { label: string }) {
  return (
    <div className="py-20 text-center">
      <Loader2 className="w-6 h-6 animate-spin text-indigo-400 mx-auto mb-3" />
      <p className="text-sm text-slate-400">Loading {label} view…</p>
    </div>
  );
}

function NavTabs() {
  const { view, setView } = useReceiptsContext();
  return (
    <nav aria-label="Primary views" role="tablist" className="relative overflow-x-auto pb-1">
      <ul className="grid grid-cols-5 min-w-[620px] gap-1.5 p-1.5 rounded-2xl theme-surface-muted border theme-border">
        {VIEW_TABS.map(t => {
          const Icon = t.icon;
          const active = view === t.id;
          return (
            <li key={t.id} role="none">
              <button
                role="tab"
                aria-selected={active}
                aria-controls="main-content"
                id={`tab-${t.id}`}
                onClick={() => setView(t.id)}
                title={t.description}
                className={`relative w-full group flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-2 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/60 min-h-[44px] ${active ? 'bg-gradient-to-br from-indigo-500/20 via-indigo-500/10 to-fuchsia-500/10 theme-text-primary border border-indigo-500/30 shadow-sm shadow-indigo-500/10' : 'theme-text-secondary hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200/70 dark:hover:bg-slate-800/40 border border-transparent'}`}
              >
                <Icon className="w-4 h-4 sm:w-4.5 sm:h-4.5" aria-hidden />
                <span>{t.label}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function AppHeader({ dark, toggleDark }: { dark: boolean; toggleDark: () => void }) {
  const { receipts } = useReceiptsContext();

  return (
    <header className="sticky top-0 z-30 backdrop-blur-xl theme-surface border-b theme-border">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-indigo-500 via-fuchsia-500 to-amber-400 p-[2px] shadow-lg shadow-indigo-500/20 flex-shrink-0">
              <div className="w-full h-full rounded-[14px] theme-surface flex items-center justify-center">
                <GitBranch className="w-5 h-5 text-indigo-300" />
              </div>
            </div>
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-bold theme-text-primary tracking-tight truncate">
                Constellation
              </h1>
              <p className="text-[11px] sm:text-xs theme-text-muted truncate">
                Your life, connected — receipts as points of light
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300 font-medium" aria-label={`${receipts.length.toLocaleString()} receipts loaded`}>
              <Star className="w-3 h-3" /> {receipts.length.toLocaleString()} receipts
            </div>
            <button
              type="button"
              onClick={toggleDark}
              aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
              className="w-10 h-10 rounded-xl theme-surface-muted border theme-border theme-text-secondary hover:text-slate-900 dark:hover:text-slate-100 hover:border-slate-400 dark:hover:border-slate-700 inline-flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-indigo-400/60 min-h-[44px] min-w-[44px]"
            >
              {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

function AppBody() {
  const { loading, error, reload, view, filteredReceipts } = useReceiptsContext();

  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} onRetry={reload} />;

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-6 py-5 sm:py-7">
      <div className="mb-5 flex flex-col gap-3">
        <SearchBar />
        <NavTabs />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-5 lg:gap-6">
        <aside className="lg:sticky lg:top-[88px] lg:self-start">
          <div className="rounded-2xl border theme-border theme-surface-muted p-4">
            <FilterControls />
            <div className="mt-5 pt-4 border-t theme-border">
              <div className="text-xs theme-text-muted">Currently showing</div>
              <div className="mt-1 text-lg font-semibold theme-text-primary tabular-nums">
                {filteredReceipts.length.toLocaleString()}
                <span className="text-xs theme-text-muted font-normal ml-1">receipts</span>
              </div>
            </div>
          </div>
        </aside>

        <main id="main-content" aria-labelledby={`tab-${view}`} className="min-w-0">
          <Suspense fallback={<SuspenseFallback label={view} />}>
            {view === 'timeline' ? <StoryTimeline /> : null}
            {view === 'story' ? <StoryMode /> : null}
            {view === 'insights' ? <LazyInsights /> : null}
            {view === 'connections' ? <LazyConnections /> : null}
            {view === 'places' ? <LazyPlaces /> : null}
          </Suspense>
          <footer className="mt-12 pt-6 border-t theme-border text-xs theme-text-muted flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div>
              <span className="font-semibold theme-text-secondary">Constellation</span> · A frontend-only constellation of real + synthetic personal receipts.
            </div>
            <div>Synthetic entries are tagged in-line; provenance documented in README.</div>
          </footer>
        </main>
      </div>
    </div>
  );
}

function App() {
  const [dark, setDark] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('constellation:theme');
      if (saved) return saved === 'dark';
      if (typeof window !== 'undefined' && window.matchMedia) {
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
      }
      return true;
    } catch {
      return true;
    }
  });

  useEffect(() => {
    const root = document.documentElement;
    if (dark) root.classList.add('dark');
    else root.classList.remove('dark');
    try { localStorage.setItem('constellation:theme', dark ? 'dark' : 'light'); } catch { /* noop */ }
  }, [dark]);

  return (
    <div className="min-h-screen theme-page antialiased">
      <svg className="pointer-events-none fixed inset-0 w-full h-full opacity-[0.08]" aria-hidden>
        <defs>
          <pattern id="stars" x="0" y="0" width="140" height="140" patternUnits="userSpaceOnUse">
            <circle cx="10" cy="20" r="1" fill="#e2e8f0" />
            <circle cx="60" cy="80" r="0.6" fill="#cbd5e1" />
            <circle cx="110" cy="40" r="0.9" fill="#fef3c7" />
            <circle cx="130" cy="120" r="0.5" fill="#e0e7ff" />
            <circle cx="30" cy="110" r="0.7" fill="#fde68a" />
            <circle cx="90" cy="10" r="0.4" fill="#c7d2fe" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#stars)" />
      </svg>
      <div className="relative">
        <ReceiptsProvider>
          <AppHeader dark={dark} toggleDark={() => setDark(d => !d)} />
          <AppBody />
        </ReceiptsProvider>
      </div>
    </div>
  );
}

export default App;
