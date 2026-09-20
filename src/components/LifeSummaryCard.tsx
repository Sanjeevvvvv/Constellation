import { memo } from 'react';
import { Receipt as ReceiptIcon } from 'lucide-react';
import { useReceiptsContext } from '../context/useReceiptsContext';
import { generateLifeSummary } from '../services/lifeSummary';
import { categoryMeta } from './categoryMeta';

function formatMonth(month: string): string {
  if (!month) return 'No data';
  const [year, monthNumber] = month.split('-').map(Number);
  return new Date(Date.UTC(year, monthNumber - 1, 1)).toLocaleDateString(undefined, { month: 'long', year: 'numeric', timeZone: 'UTC' });
}

export const LifeSummaryCard = memo(function LifeSummaryCard() {
  const { receipts } = useReceiptsContext();
  const summary = generateLifeSummary(receipts);
  const category = categoryMeta(summary.topCategory).label;

  return (
    <section aria-labelledby="life-summary-title" className="relative overflow-hidden rounded-2xl border border-indigo-500/25 theme-surface p-4 sm:p-5 shadow-lg shadow-indigo-950/20">
      <div className="flex items-center gap-2 text-indigo-300">
        <ReceiptIcon className="h-4 w-4" aria-hidden />
        <h2 id="life-summary-title" className="text-sm font-semibold uppercase tracking-[0.18em]">Life summary</h2>
      </div>
      <div className="my-4 border-t border-dashed border-slate-700/80" aria-hidden />
      <div className="grid grid-cols-2 gap-x-5 gap-y-4 sm:grid-cols-4">
        <div>
          <div className="text-[11px] uppercase tracking-wide theme-text-muted">Receipts</div>
            <div className="mt-1 font-mono text-xl font-semibold tabular-nums theme-text-primary">{summary.totalReceipts.toLocaleString()}</div>
        </div>
        <div>
          <div className="text-[11px] uppercase tracking-wide theme-text-muted">Recorded spend</div>
          <div className="mt-1 font-mono text-xl font-semibold tabular-nums theme-text-primary">₹{summary.totalSpend.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
        </div>
        <div>
          <div className="text-[11px] uppercase tracking-wide theme-text-muted">Days tracked</div>
          <div className="mt-1 font-mono text-xl font-semibold tabular-nums theme-text-primary">{summary.daysTracked.toLocaleString()}</div>
        </div>
        <div>
          <div className="text-[11px] uppercase tracking-wide theme-text-muted">Top category</div>
          <div className="mt-1 truncate text-base font-semibold theme-text-primary" title={category}>{category}</div>
        </div>
      </div>
      <p className="mt-4 text-sm italic theme-text-secondary">
        Mostly {category} — busiest in {formatMonth(summary.favoriteMonth)}.
      </p>
      <div className="my-4 border-t border-dashed border-slate-700/80" aria-hidden />
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs theme-text-secondary">
        <span>Most active month</span>
        <span className="font-mono font-medium text-indigo-300">{formatMonth(summary.favoriteMonth)}</span>
      </div>
    </section>
  );
});
