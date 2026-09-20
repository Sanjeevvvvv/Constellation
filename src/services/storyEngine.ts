import type { Receipt, Moment, Chapter } from '../types/receipt';

function getWeekKey(ts: string): string {
  const d = new Date(ts);
  const date = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${date.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

function weekToDateRange(weekKey: string): [string, string] {
  const [yearStr, weekStr] = weekKey.split('-W');
  const year = parseInt(yearStr, 10);
  const week = parseInt(weekStr, 10);
  const jan4 = new Date(Date.UTC(year, 0, 4));
  const dayOfWeek = jan4.getUTCDay() || 7;
  const yearStart = new Date(jan4);
  yearStart.setUTCDate(jan4.getUTCDate() - dayOfWeek + 1);
  const start = new Date(yearStart);
  start.setUTCDate(yearStart.getUTCDate() + (week - 1) * 7);
  const end = new Date(start);
  end.setUTCDate(start.getUTCDate() + 6);
  return [start.toISOString(), end.toISOString()];
}

function dominantTheme(recs: Receipt[]): string {
  const catCount = new Map<string, number>();
  const tagCount = new Map<string, number>();
  for (const r of recs) {
    catCount.set(r.category, (catCount.get(r.category) ?? 0) + 1);
    for (const t of r.tags ?? []) {
      tagCount.set(t, (tagCount.get(t) ?? 0) + 1);
    }
  }
  const topTag = [...tagCount.entries()].sort((a, b) => b[1] - a[1])[0];
  const topCat = [...catCount.entries()].sort((a, b) => b[1] - a[1])[0];
  if (topTag && topTag[1] >= 3) return topTag[0];
  if (topCat) return topCat[0];
  return 'A Week in Review';
}

function findStandout(recs: Receipt[]): Receipt | undefined {
  const movieOrEvent = recs.find(r => r.category === 'movie' || r.category === 'event');
  if (movieOrEvent) return movieOrEvent;
  const withAmount = recs.filter(r => typeof r.amount === 'number');
  if (withAmount.length === 0) return recs[0];
  withAmount.sort((a, b) => (b.amount ?? 0) - (a.amount ?? 0));
  return withAmount[0];
}

function buildSummary(recs: Receipt[]): string {
  const cats = [...new Set(recs.map(r => r.category))];
  const catNames = cats.map(c => c === 'purchase' ? 'spending' : c + 's').join(', ');
  const standout = findStandout(recs);
  const total = recs.reduce((s, r) => s + (r.amount ?? 0), 0);
  const standoutText = standout
    ? standout.category === 'movie' || standout.category === 'event'
      ? `Highlight: ${standout.title}.`
      : standout.amount
        ? `Biggest ticket: ${standout.title} (${standout.amount.toFixed(0)}).`
        : `Notable: ${standout.title}.`
    : '';
  const spendText = total > 0 ? `Total recorded spend: ${total.toFixed(0)}.` : '';
  return `This week brought ${cats.length} kinds of moments: ${catNames}. ${standoutText} ${spendText}`.trim();
}

export function generateChapters(receipts: Receipt[], moments: Moment[]): Chapter[] {
  if (receipts.length === 0) return [];
  const sorted = [...receipts].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  const weekMap = new Map<string, Receipt[]>();
  for (const r of sorted) {
    const key = getWeekKey(r.timestamp);
    if (!weekMap.has(key)) weekMap.set(key, []);
    weekMap.get(key)!.push(r);
  }
  const momentByReceipt = new Map<string, string>();
  for (const m of moments) {
    for (const rid of m.receiptIds) momentByReceipt.set(rid, m.id);
  }
  const chapters: Chapter[] = [];
  let cIdx = 0;
  for (const [weekKey, recs] of weekMap) {
    if (recs.length < 3) continue;
    const momentIds = [...new Set(recs.map(r => momentByReceipt.get(r.id)).filter(Boolean) as string[])];
    const [start, end] = weekToDateRange(weekKey);
    chapters.push({
      id: `chapter-${cIdx++}`,
      title: dominantTheme(recs),
      summary: buildSummary(recs),
      momentIds,
      dateRange: [start, end],
    });
  }
  return chapters;
}
