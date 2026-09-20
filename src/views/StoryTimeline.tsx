import { memo, useEffect, useRef } from 'react';
import { Lightbulb, Sparkles } from 'lucide-react';
import { useReceiptsContext } from '../context/useReceiptsContext';
import { LifeSummaryCard } from '../components/LifeSummaryCard';
import { ReceiptCard } from '../components/ReceiptCard';
import { receiptsForMoment } from '../selectors';
import { celebrateFavoriteMilestone } from '../utils/celebrate';

export const StoryTimeline = memo(function StoryTimeline() {
  const { timelineGroups, filteredReceipts, surpriseMomentId, moments, receipts, favoritedMomentIds, toggleFavoriteMoment } = useReceiptsContext();
  const previousFavoriteCount = useRef(favoritedMomentIds.length);

  useEffect(() => {
    const crossedMilestone = previousFavoriteCount.current < 5 && favoritedMomentIds.length >= 5;
    previousFavoriteCount.current = favoritedMomentIds.length;
    if (crossedMilestone) celebrateFavoriteMilestone();
  }, [favoritedMomentIds.length]);

  if (filteredReceipts.length === 0) {
    return (
      <div className="text-center py-20 px-6">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-slate-800/60 border border-slate-700 flex items-center justify-center text-slate-500 mb-4">
          <Lightbulb className="w-8 h-8" />
        </div>
        <h2 className="text-lg font-semibold text-slate-200">No receipts match your filters</h2>
        <p className="mt-1 text-sm text-slate-400">Try clearing your search or expanding the category/date selection.</p>
      </div>
    );
  }

  const surpriseMoment = moments.find(m => m.id === surpriseMomentId);
  const surpriseReceiptIds = new Set<string>(surpriseMoment?.receiptIds ?? []);
  const receiptToMoment = new Map<string, typeof moments[0]>();
  for (const m of moments) for (const rid of m.receiptIds) receiptToMoment.set(rid, m);

  return (
    <div className="space-y-10">
      <LifeSummaryCard />
      {surpriseMoment ? (
        <aside
          aria-label="Surprise connection"
          className="relative rounded-2xl p-4 sm:p-5 border border-yellow-500/30 bg-gradient-to-br from-yellow-500/10 via-amber-500/5 to-transparent"
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-yellow-500/15 border border-yellow-500/30 flex items-center justify-center text-yellow-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-yellow-300 flex items-center gap-1.5">
                Surprise connection
              </h3>
              <p className="mt-1 text-sm text-slate-300">
                On <time className="font-medium text-slate-200" dateTime={surpriseMoment.startTime}>{new Date(surpriseMoment.startTime).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</time>, {surpriseMoment.receiptIds.length} receipts orbited around the theme <span className="font-semibold text-yellow-300">“{surpriseMoment.theme}”</span>.
              </p>
              <div className="mt-2 flex items-center gap-2 flex-wrap">
                {receiptsForMoment(receipts, surpriseMoment).slice(0, 3).map(r => (
                  <span key={r.id} className="text-[11px] px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-300 border border-yellow-500/20">
                    {r.title}
                  </span>
                ))}
                {surpriseMoment.receiptIds.length > 3 ? (
                  <span className="text-[11px] text-slate-400">+{surpriseMoment.receiptIds.length - 3} more</span>
                ) : null}
              </div>
              {!favoritedMomentIds.includes(surpriseMoment.id) ? (
                <button
                  type="button"
                  onClick={() => toggleFavoriteMoment(surpriseMoment.id)}
                  className="mt-3 text-xs font-medium text-yellow-300 hover:text-yellow-200 underline-offset-2 hover:underline min-h-[44px] px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-yellow-400/60"
                >
                  Save this moment
                </button>
              ) : (
                <span className="mt-3 inline-block text-xs font-medium text-yellow-400/80">★ Saved moment</span>
              )}
            </div>
          </div>
        </aside>
      ) : null}

      <ol className="relative space-y-10" aria-label="Receipt timeline">
        {timelineGroups.map((group, gi) => (
          <li key={group.dayKey} className="relative">
            <div className="flex items-baseline gap-3 mb-3 sm:mb-4">
              <h2 className="text-sm sm:text-base font-semibold text-slate-200">{group.label}</h2>
              <span className="text-xs text-slate-500 tabular-nums">{group.receipts.length} item{group.receipts.length === 1 ? '' : 's'}</span>
              <div className="flex-1 h-px bg-gradient-to-r from-slate-700/70 to-transparent" aria-hidden />
            </div>
            <div className={`relative ml-3 sm:ml-5 pl-4 sm:pl-6 border-l-2 ${group.receipts.some(r => surpriseReceiptIds.has(r.id)) ? 'border-yellow-500/40' : 'border-slate-800'}`}>
              <ul className="space-y-3 sm:space-y-4">
                {group.receipts.map((r, ri) => {
                  const m = receiptToMoment.get(r.id);
                  const isSurprise = surpriseReceiptIds.has(r.id);
                  return (
                    <li key={r.id}>
                      <div className="absolute -left-[9px] sm:-left-[11px] mt-4 sm:mt-5 w-4 h-4 rounded-full bg-slate-950 border-2 border-slate-700" aria-hidden />
                      <ReceiptCard receipt={r} highlight={isSurprise} />
                      {m && ri === group.receipts.length - 1 && (
                        <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1.5">
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-indigo-500/60" aria-hidden />
                          Moment · “{m.theme}” · {m.receiptIds.length} entries
                          {favoritedMomentIds.includes(m.id) ? <span className="text-yellow-500/80">★</span> : null}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
            {gi < timelineGroups.length - 1 ? <div className="h-6" aria-hidden /> : null}
          </li>
        ))}
      </ol>
    </div>
  );
});
