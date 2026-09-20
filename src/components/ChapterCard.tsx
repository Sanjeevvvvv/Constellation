import { memo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Sparkles, BookOpen } from 'lucide-react';
import type { Chapter } from '../types/receipt';
import { ReceiptCard } from './ReceiptCard';
import { useReceiptsContext } from '../context/useReceiptsContext';
import { receiptsForChapter } from '../selectors';

interface ChapterCardProps {
  chapter: Chapter;
  initiallyOpen?: boolean;
}

function formatRange([start, end]: [string, string]): string {
  const fmt = (s: string) => {
    const d = new Date(s);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };
  return `${fmt(start)} – ${fmt(end)}`;
}

export const ChapterCard = memo(function ChapterCard({ chapter, initiallyOpen }: ChapterCardProps) {
  const { receipts, moments, setSelectedChapterId } = useReceiptsContext();
  const [open, setOpen] = useState<boolean>(!!initiallyOpen);
  const chapterReceipts = receiptsForChapter(receipts, moments, chapter);
  const byCat = new Map<string, number>();
  for (const r of chapterReceipts) byCat.set(r.category, (byCat.get(r.category) ?? 0) + 1);
  const catList = [...byCat.entries()].sort((a, b) => b[1] - a[1]);

  useEffect(() => {
    if (initiallyOpen) setSelectedChapterId(chapter.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border bg-gradient-to-br from-slate-900/60 to-slate-900/20 overflow-hidden ${open ? 'border-indigo-500/30' : 'border-slate-800'}`}
    >
      <button
        type="button"
        onClick={() => {
          const willOpen = !open;
          setOpen(willOpen);
          if (willOpen) setSelectedChapterId(chapter.id);
        }}
        aria-expanded={open}
        aria-controls={`chapter-body-${chapter.id}`}
        className="w-full text-left p-4 sm:p-5 flex items-start gap-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/60 focus-visible:ring-inset min-h-[44px]"
      >
        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-300">
          <BookOpen className="w-5 h-5" aria-hidden />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-base sm:text-lg font-semibold text-slate-100">
              <Sparkles className="inline w-4 h-4 mr-1.5 text-yellow-400" aria-hidden />
              {chapter.title}
            </h3>
            <span className="text-xs text-slate-400 font-medium px-2 py-0.5 rounded-full bg-slate-800/60 border border-slate-700/60">
              {formatRange(chapter.dateRange)}
            </span>
          </div>
          <p className="mt-1.5 text-sm text-slate-300 leading-relaxed">{chapter.summary}</p>
          <div className="mt-2 flex items-center gap-1.5 flex-wrap">
            {catList.slice(0, 5).map(([cat, n]) => (
              <span key={cat} className="text-[11px] px-1.5 py-0.5 rounded bg-slate-800/70 text-slate-300 border border-slate-700/50">
                {cat} · {n}
              </span>
            ))}
            <span className="text-[11px] text-slate-500 ml-auto mr-2 tabular-nums">{chapterReceipts.length} entries</span>
          </div>
        </div>
        <div className="flex-shrink-0 self-center text-slate-400 group-hover:text-slate-200">
          {open ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </div>
      </button>
      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            id={`chapter-body-${chapter.id}`}
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-1 border-t border-slate-800/70">
              <ul className="space-y-3">
                {chapterReceipts.map(r => (
                  <li key={r.id}>
                    <ReceiptCard receipt={r} />
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.article>
  );
});
