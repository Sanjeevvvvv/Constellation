import type { Receipt } from '../types/receipt';

export interface MonthlyPoint {
  month: string;
  value: number;
}

export interface CategoryBreakdown {
  category: string;
  count: number;
}

export interface PlaceCount {
  name: string;
  count: number;
}

function monthKey(ts: string): string {
  const d = new Date(ts);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
}

export function categoryDistribution(receipts: Receipt[]): CategoryBreakdown[] {
  const map = new Map<string, number>();
  for (const r of receipts) {
    map.set(r.category, (map.get(r.category) ?? 0) + 1);
  }
  return [...map.entries()]
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count);
}

export function monthlySpending(receipts: Receipt[]): MonthlyPoint[] {
  const map = new Map<string, number>();
  for (const r of receipts) {
    const key = monthKey(r.timestamp);
    const prev = map.get(key) ?? 0;
    map.set(key, prev + (r.amount ?? 0));
  }
  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, value]) => ({ month, value: Math.round(value * 100) / 100 }));
}

export function monthlyListening(receipts: Receipt[]): MonthlyPoint[] {
  const map = new Map<string, number>();
  for (const r of receipts) {
    if (r.category !== 'music') continue;
    const key = monthKey(r.timestamp);
    map.set(key, (map.get(key) ?? 0) + 1);
  }
  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, value]) => ({ month, value }));
}

export function placeVisitFrequency(receipts: Receipt[]): PlaceCount[] {
  const map = new Map<string, number>();
  for (const r of receipts) {
    const name = r.location?.name;
    if (!name) continue;
    map.set(name, (map.get(name) ?? 0) + 1);
  }
  return [...map.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

export function categoryDistributionOverTime(receipts: Receipt[]): Array<{ month: string; [key: string]: string | number }> {
  const months = new Set<string>();
  const byMonthCat = new Map<string, Map<string, number>>();
  for (const r of receipts) {
    const m = monthKey(r.timestamp);
    months.add(m);
    if (!byMonthCat.has(m)) byMonthCat.set(m, new Map());
    const inner = byMonthCat.get(m)!;
    inner.set(r.category, (inner.get(r.category) ?? 0) + 1);
  }
  const sortedMonths = [...months].sort();
  return sortedMonths.map(m => {
    const inner = byMonthCat.get(m)!;
    const row: { month: string; [key: string]: string | number } = { month: m };
    for (const [cat, count] of inner) row[cat] = count;
    return row;
  });
}
