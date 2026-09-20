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
      className={`group relative p-3 sm:p-4 rounded-xl border min-h-[44px] transition-all ${interactive ? 'cursor-pointer hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-indigo-400/60 focus:ring-offset-2 focus:ring-offset-slate-950' : ''} ${meta.bg} ${meta.border} ${highlight ? 'ring-2 ring-yellow-400/60 ring-offset-2 ring-offset-slate-950' : ''}`}
    >
      <div className="flex gap-3 sm:gap-4">
        <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${meta.bg} ${meta.text} ${meta.border} border`}>
          <Icon className="w-5 h-5" aria-hidden />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`inline-flex items-center text-xs font-semibold uppercase tracking-wide ${meta.text}`}>
                  <span className="sr-only">Category: </span>
                  {meta.label}
                </span>
                {receipt._synthetic ? (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] rounded-full bg-slate-800/60 text-slate-400 border border-slate-700/50">
                    <Sparkles className="w-3 h-3" aria-hidden /> synthetic
                  </span>
                ) : null}
                <time className="text-xs text-slate-500 tabular-nums" dateTime={receipt.timestamp}>
                  {formatTime(receipt.timestamp)}
                </time>
              </div>
              <h3 className="mt-0.5 text-sm sm:text-base font-medium text-slate-100 truncate">{receipt.title}</h3>
              {receipt.description ? (
                <p className="mt-1 text-xs sm:text-sm text-slate-400 line-clamp-2">{receipt.description}</p>
              ) : null}
            </div>
            {typeof receipt.amount === 'number' ? (
              <div className="flex-shrink-0 flex items-center gap-0.5 text-slate-200 text-sm font-semibold tabular-nums">
                <IndianRupee className="w-3.5 h-3.5" aria-hidden />
                {receipt.amount.toFixed(receipt.amount % 1 === 0 ? 0 : 2)}
              </div>
            ) : null}
          </div>
          <div className="mt-2 flex items-center gap-2 flex-wrap">
            {receipt.tags && receipt.tags.length > 0 ? (
              <div className="flex items-center gap-1 flex-wrap">
                <Tag className="w-3 h-3 text-slate-500" aria-hidden />
                {receipt.tags.slice(0, 4).map(t => (
                  <span key={t} className="px-1.5 py-0.5 text-[10px] rounded bg-slate-800/60 text-slate-300 border border-slate-700/40">
                    {t}
                  </span>
                ))}
              </div>
            ) : null}
            {receipt.location?.name ? (
              <div className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] rounded bg-slate-800/60 text-slate-300 border border-slate-700/40">
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
