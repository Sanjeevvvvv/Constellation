import { memo } from 'react';
import { IndianRupee, Tag, Map as MapIcon, Sparkles } from 'lucide-react';
import type { Receipt } from '../types/receipt';
import { CATEGORY_META } from './categoryMeta';

function formatTime(ts: string): string {
  try {
    return new Date(ts).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

interface ReceiptCardProps {
  receipt: Receipt;
  onSelect?: () => void;
  highlight?: boolean;
}

export const ReceiptCard = memo(function ReceiptCard({ receipt, onSelect, highlight }: ReceiptCardProps) {
  const meta = CATEGORY_META[receipt.category];
  const Icon = meta.icon;
  const interactive = Boolean(onSelect);
  return (
    <article
      onClick={onSelect}
      onKeyDown={(e) => { if ((e.key === 'Enter' || e.key === ' ') && onSelect) { e.preventDefault(); onSelect(); } }}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      aria-label={`${meta.label} — ${receipt.title}`}
      className={`group relative p-4 sm:p-5 rounded-xl border border-amber-900/20 dark:border-slate-600/70 min-h-[44px] transition-all receipt-paper shadow-sm ${interactive ? 'cursor-pointer hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-indigo-400/60 focus:ring-offset-2 focus:ring-offset-slate-950' : ''} ${highlight ? 'ring-2 ring-yellow-400/60 ring-offset-2 ring-offset-slate-950' : ''}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="font-mono text-[10px] font-semibold tracking-[0.2em] text-slate-500 dark:text-slate-400">OFFICIAL LIFE RECEIPT</div>
          <div className="mt-1 font-mono text-[10px] tracking-wide text-slate-500 dark:text-slate-400">RCP-{receipt.id.slice(0, 8)}</div>
        </div>
        <div className={`flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center ${meta.bg} ${meta.text} ${meta.border} border`}>
          <Icon className="w-4 h-4" aria-hidden />
        </div>
      </div>
      <div className="my-3 border-t border-dashed receipt-divider" aria-hidden />
      <div className="flex gap-3 sm:gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`inline-flex items-center text-xs font-semibold uppercase tracking-wide ${meta.text}`}>
                  <span className="sr-only">Category: </span>
                  {meta.label}
                </span>
                {receipt._synthetic ? (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] rounded-full theme-surface-raised theme-text-secondary border theme-border">
                    <Sparkles className="w-3 h-3" aria-hidden /> synthetic
                  </span>
                ) : null}
                <time className="font-mono text-xs text-slate-500 dark:text-slate-400 tabular-nums" dateTime={receipt.timestamp}>
                  {formatTime(receipt.timestamp)}
                </time>
              </div>
              <h3 className="mt-0.5 text-sm sm:text-base font-semibold text-slate-900 dark:text-slate-100 truncate">{receipt.title}</h3>
              {receipt.description ? (
                <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-300 line-clamp-2">{receipt.description}</p>
              ) : null}
            </div>
            {typeof receipt.amount === 'number' ? (
              <div className="flex-shrink-0 flex items-center gap-0.5 font-mono text-slate-900 dark:text-slate-100 text-sm font-semibold tabular-nums">
                <IndianRupee className="w-3.5 h-3.5" aria-hidden />
                {receipt.amount.toFixed(receipt.amount % 1 === 0 ? 0 : 2)}
              </div>
            ) : null}
          </div>
          <div className="mt-2 flex items-center gap-2 flex-wrap">
            {receipt.tags && receipt.tags.length > 0 ? (
              <div className="flex items-center gap-1 flex-wrap">
                <Tag className="w-3 h-3 theme-text-muted" aria-hidden />
                {receipt.tags.slice(0, 4).map(t => (
                  <span key={t} className="px-1.5 py-0.5 text-[10px] rounded theme-surface-raised theme-text-secondary border theme-border">
                    {t}
                  </span>
                ))}
              </div>
            ) : null}
            {receipt.location?.name ? (
              <div className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] rounded theme-surface-raised theme-text-secondary border theme-border">
                <MapIcon className="w-3 h-3" aria-hidden />
                <span>{receipt.location.name}</span>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
});
