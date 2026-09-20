import type { Receipt, Moment } from '../types/receipt';

function getDayKey(ts: string): string {
  const d = new Date(ts);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
}

function inferTheme(receipts: Receipt[]): string {
  const catCount = new Map<string, number>();
  const tagCount = new Map<string, number>();
  for (const r of receipts) {
    catCount.set(r.category, (catCount.get(r.category) ?? 0) + 1);
    for (const t of r.tags ?? []) {
      tagCount.set(t, (tagCount.get(t) ?? 0) + 1);
    }
  }
  const topTag = [...tagCount.entries()].sort((a, b) => b[1] - a[1])[0];
  const topCat = [...catCount.entries()].sort((a, b) => b[1] - a[1])[0];
  if (topTag && topTag[1] >= 2) return topTag[0];
  if (topCat) return topCat[0];
  return 'miscellaneous';
}

export function discoverConnections(receipts: Receipt[]): Moment[] {
  if (receipts.length === 0) return [];
  const sorted = [...receipts].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  const dayMap = new Map<string, Receipt[]>();
  for (const r of sorted) {
    const key = getDayKey(r.timestamp);
    if (!dayMap.has(key)) dayMap.set(key, []);
    dayMap.get(key)!.push(r);
  }
  const moments: Moment[] = [];
  let mIdx = 0;
  for (const [day, recs] of dayMap) {
    if (recs.length === 0) continue;
    const times = recs.map(r => new Date(r.timestamp).getTime());
    moments.push({
      id: `moment-${mIdx++}`,
      receiptIds: recs.map(r => r.id),
      theme: inferTheme(recs),
      startTime: new Date(Math.min(...times)).toISOString(),
      endTime: new Date(Math.max(...times)).toISOString(),
    });
  }
  return moments;
}

export function discoverConnectionsV2(receipts: Receipt[]): Moment[] {
  const v1 = discoverConnections(receipts);
  const byId = new Map(receipts.map(r => [r.id, r]));
  const tagMoments = new Map<string, string[]>();
  const locMoments = new Map<string, string[]>();
  for (const m of v1) {
    const mRecs = m.receiptIds.map(id => byId.get(id)!).filter(Boolean);
    const seenTags = new Set<string>();
    const seenLocs = new Set<string>();
    for (const r of mRecs) {
      for (const t of r.tags ?? []) {
        if (!seenTags.has(t)) {
          seenTags.add(t);
          const arr = tagMoments.get(t) ?? [];
          arr.push(m.id);
          tagMoments.set(t, arr);
        }
      }
      const ln = r.location?.name;
      if (ln && !seenLocs.has(ln)) {
        seenLocs.add(ln);
        const arr = locMoments.get(ln) ?? [];
        arr.push(m.id);
        locMoments.set(ln, arr);
      }
    }
  }
  return v1;
}
