import { memo } from 'react';
import { Filter, RotateCcw, Calendar as CalendarIcon } from 'lucide-react';
import { useReceiptsContext } from '../context/useReceiptsContext';
import { categoryMeta, ALL_CATEGORIES } from './categoryMeta';

export const FilterControls = memo(function FilterControls() {
  const { filters, toggleCategory, setDateRange, resetFilters, receipts } = useReceiptsContext();

  let minDate = '';
  let maxDate = '';
  if (receipts.length > 0) {
    const times = receipts.map(r => new Date(r.timestamp).getTime());
    const toDateOnly = (t: number) => {
      const d = new Date(t);
      return `${d.getUTCFullYear()}-${String(d.getUTCMonth()+1).padStart(2,'0')}-${String(d.getUTCDate()).padStart(2,'0')}`;
    };
    minDate = toDateOnly(Math.min(...times));
    maxDate = toDateOnly(Math.max(...times));
  }

  const hasAny = filters.search || filters.categories.length > 0 || filters.dateFrom || filters.dateTo;

  return (
    <section aria-label="Filter controls" className="space-y-3">
      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-slate-400" aria-hidden />
        <h2 className="text-sm font-semibold text-slate-300">Filters</h2>
        {hasAny ? (
          <button
            type="button"
            onClick={resetFilters}
            className="ml-auto inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-slate-100 hover:bg-slate-800/60 border border-slate-700/60 focus:outline-none focus:ring-2 focus:ring-indigo-400/60 min-h-[44px]"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden /> Reset
          </button>
        ) : null}
      </div>

      <fieldset className="space-y-2">
        <legend className="text-xs font-medium text-slate-400 mb-1">Categories</legend>
        <div className="flex flex-wrap gap-1.5">
          {ALL_CATEGORIES.map(cat => {
            const meta = categoryMeta(cat);
            const Icon = meta.icon;
            const active = filters.categories.includes(cat);
            return (
              <button
                key={cat}
                type="button"
                onClick={() => toggleCategory(cat)}
                aria-pressed={active}
                aria-label={`Filter by ${meta.label}${active ? ' — active' : ''}`}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition focus:outline-none focus:ring-2 focus:ring-indigo-400/60 min-h-[40px] ${active ? `${meta.bg} ${meta.text} ${meta.border}` : 'bg-slate-900/40 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'}`}
              >
                <Icon className="w-3.5 h-3.5" aria-hidden />
                {meta.label}
              </button>
            );
          })}
        </div>
      </fieldset>

      <fieldset className="space-y-2">
        <legend className="text-xs font-medium text-slate-400 mb-1 flex items-center gap-1.5">
          <CalendarIcon className="w-3.5 h-3.5" aria-hidden /> Date range
        </legend>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <label className="block">
            <span className="sr-only">From date</span>
            <input
              type="date"
              value={filters.dateFrom ?? ''}
              min={minDate}
              max={maxDate}
              onChange={(e) => setDateRange(e.target.value || undefined, filters.dateTo)}
              className="w-full min-h-[44px] px-3 py-2 rounded-lg bg-slate-900/60 border border-slate-700/60 text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-400/60"
            />
          </label>
          <label className="block">
            <span className="sr-only">To date</span>
            <input
              type="date"
              value={filters.dateTo ?? ''}
              min={minDate}
              max={maxDate}
              onChange={(e) => setDateRange(filters.dateFrom, e.target.value || undefined)}
              className="w-full min-h-[44px] px-3 py-2 rounded-lg bg-slate-900/60 border border-slate-700/60 text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-400/60"
            />
          </label>
        </div>
      </fieldset>
    </section>
  );
});
