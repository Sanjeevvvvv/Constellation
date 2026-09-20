import { memo, useState } from 'react';
import { ArrowLeft, ArrowRight, BookMarked, LibraryBig } from 'lucide-react';
import { useReceiptsContext } from '../context/useReceiptsContext';
import { ChapterCard } from '../components/ChapterCard';

export const StoryMode = memo(function StoryMode() {
  const { chapters, lastViewedChapterId } = useReceiptsContext();
  const [activeChapter, setActiveChapter] = useState(0);

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
      <div className="flex items-center justify-between gap-3 rounded-xl border theme-border theme-surface-muted px-3 py-2">
        <button
          type="button"
          onClick={() => setActiveChapter(index => Math.max(0, index - 1))}
          disabled={activeChapter === 0}
          aria-label="Previous chapter"
          className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg theme-text-secondary transition hover:bg-slate-200 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-35 dark:hover:bg-slate-800 dark:hover:text-slate-100"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
        </button>
        <div className="flex items-center gap-2" aria-label={`Chapter ${activeChapter + 1} of ${chapters.length}`}>
          {chapters.map((chapter, index) => (
            <button
              key={chapter.id}
              type="button"
              onClick={() => setActiveChapter(index)}
              aria-label={`Go to chapter ${index + 1}`}
              aria-current={activeChapter === index ? 'step' : undefined}
              className={`h-2.5 w-2.5 rounded-full border transition ${activeChapter === index ? 'border-indigo-400 bg-indigo-400 shadow-sm shadow-indigo-400/50' : 'border-slate-400 bg-transparent dark:border-slate-600'}`}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={() => setActiveChapter(index => Math.min(chapters.length - 1, index + 1))}
          disabled={activeChapter === chapters.length - 1}
          aria-label="Next chapter"
          className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg theme-text-secondary transition hover:bg-slate-200 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-35 dark:hover:bg-slate-800 dark:hover:text-slate-100"
        >
          <ArrowRight className="h-4 w-4" aria-hidden />
        </button>
      </div>
      <ChapterCard chapter={chapters[activeChapter]} initiallyOpen={chapters[activeChapter].id === lastViewedChapterId} />
    </div>
  );
});
