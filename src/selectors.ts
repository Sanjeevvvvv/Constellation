import type { Receipt, Chapter, Filters, Moment } from './types/receipt';

export function selectFilteredReceipts(receipts: Receipt[], filters: Filters): Receipt[] {
  const q = (filters.search ?? '').toLowerCase().trim();
  return receipts.filter(r => {
    if (filters.categories.length > 0 && !filters.categories.includes(r.category)) return false;
    if (filters.dateFrom) {
      const from = new Date(filters.dateFrom).getTime();
      if (new Date(r.timestamp).getTime() < from) return false;
    }
    if (filters.dateTo) {
      const to = new Date(filters.dateTo + 'T23:59:59').getTime();
      if (new Date(r.timestamp).getTime() > to) return false;
    }
    if (q) {
      const titleHit = r.title.toLowerCase().includes(q);
      const descHit = (r.description ?? '').toLowerCase().includes(q);
      const tagsHit = (r.tags ?? []).some(t => t.toLowerCase().includes(q));
      const locHit = (r.location?.name ?? '').toLowerCase().includes(q);
      if (!titleHit && !descHit && !tagsHit && !locHit) return false;
    }
    return true;
  });
}

export interface TimelineGroup {
  dayKey: string;
  label: string;
  receipts: Receipt[];
}

function getDayKey(ts: string): string {
  const d = new Date(ts);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
}

function formatDayLabel(dayKey: string): string {
  const [y, m, d] = dayKey.split('-');
  const date = new Date(Date.UTC(parseInt(y, 10), parseInt(m, 10) - 1, parseInt(d, 10)));
  return date.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

export function selectTimelineGroups(receipts: Receipt[]): TimelineGroup[] {
  const sorted = [...receipts].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  const map = new Map<string, Receipt[]>();
  const order: string[] = [];
  for (const r of sorted) {
    const key = getDayKey(r.timestamp);
    if (!map.has(key)) {
      map.set(key, []);
      order.push(key);
    }
    map.get(key)!.push(r);
  }
  return order.map(k => ({
    dayKey: k,
    label: formatDayLabel(k),
    receipts: map.get(k)!,
  }));
}

export function selectChapterById(chapters: Chapter[], id: string | undefined): Chapter | undefined {
  if (!id) return undefined;
  return chapters.find(c => c.id === id);
}

export function receiptsForMoment(allReceipts: Receipt[], moment: Moment): Receipt[] {
  const set = new Set(moment.receiptIds);
  return allReceipts.filter(r => set.has(r.id));
}

export function receiptsForChapter(allReceipts: Receipt[], allMoments: Moment[], chapter: Chapter): Receipt[] {
  const set = new Set<string>();
  for (const mid of chapter.momentIds) {
    const m = allMoments.find(x => x.id === mid);
    if (!m) continue;
    for (const rid of m.receiptIds) set.add(rid);
  }
  return allReceipts.filter(r => set.has(r.id)).sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
}
