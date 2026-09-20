import { memo } from 'react';
import { Search as SearchIcon, X } from 'lucide-react';
import { useReceiptsContext } from '../context/useReceiptsContext';

export const SearchBar = memo(function SearchBar() {
  const { filters, setSearch } = useReceiptsContext();
  const value = filters.search;
  return (
    <form role="search" onSubmit={(e) => e.preventDefault()} className="relative">
      <label htmlFor="global-search" className="sr-only">Search receipts by title, tag, location, or description</label>
      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" aria-hidden />
        <input
          id="global-search"
          type="search"
          value={value}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search title, tag, location, notes…"
          className="w-full min-h-[44px] pl-10 pr-10 py-2 rounded-xl bg-slate-900/60 border border-slate-700/60 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-400/60 focus:border-indigo-400/60 transition"
          aria-describedby="search-count-hint"
        />
        {value ? (
          <button
            type="button"
            onClick={() => setSearch('')}
            aria-label="Clear search"
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 inline-flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 focus:outline-none focus:ring-2 focus:ring-indigo-400/60 min-h-[44px] min-w-[44px]"
          >
            <X className="w-4 h-4" />
          </button>
        ) : null}
      </div>
    </form>
  );
});
