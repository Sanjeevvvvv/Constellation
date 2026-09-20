import { memo } from 'react';
import { BookMarked, LibraryBig } from 'lucide-react';
import { useReceiptsContext } from '../context/useReceiptsContext';
import { ChapterCard } from '../components/ChapterCard';

export const StoryMode = memo(function StoryMode() {
  const { chapters, lastViewedChapterId } = useReceiptsContext();

  if (chapters.length === 0) {
    return (
      <div className="text-center py-20 px-6">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-slate-800/60 border border-slate-700 flex items-center justify-center text-slate-500 mb-4">
          <BookMarked className="w-8 h-8" />
        </div>
        <h2 className="text-lg font-semibold text-slate-200">Your story is still being written</h2>
        <p className="mt-1 text-sm text-slate-400">Chapters form when a calendar week holds 3 or more receipts. Widen your filters or wait for the constellation to grow.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex items-start gap-3 pb-2 border-b border-slate-800">
        <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-300">
          <LibraryBig className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-100">Your chapters</h1>
          <p className="mt-1 text-sm text-slate-400">
            {chapters.length} chapter{chapters.length === 1 ? '' : 's'} automatically woven from calendar weeks that held three or more receipts.
            {lastViewedChapterId ? ' Jump back in where you left off below.' : ''}
          </p>
        </div>
      </header>
      <ul className="space-y-4">
        {chapters.map(c => (
          <li key={c.id}>
            <ChapterCard chapter={c} initiallyOpen={c.id === lastViewedChapterId} />
          </li>
        ))}
      </ul>
    </div>
  );
});
