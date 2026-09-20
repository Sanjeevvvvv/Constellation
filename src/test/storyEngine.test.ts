import { describe, it, expect } from 'vitest';
import { generateChapters } from '../services/storyEngine';
import { discoverConnections } from '../services/connectionEngine';
import type { Receipt } from '../types/receipt';

function makeR(id: string, category: any, timestamp: string, extra: Partial<Receipt> = {}): Receipt {
  return { id, category, timestamp, title: id, _source: 'synthetic', ...extra } as Receipt;
}

function week(d: Date) {
  const recs: Receipt[] = [];
  for (let i = 0; i < 5; i++) {
    const t = new Date(d);
    t.setDate(d.getDate() + i);
    recs.push(makeR(`r-${d.getTime()}-${i}`, i % 2 === 0 ? 'purchase' : 'music', t.toISOString(), { amount: 100 + i * 10 }));
  }
  recs.push(makeR(`m-${d.getTime()}`, 'movie', new Date(d.getTime() + 86400000 * 2).toISOString(), { title: 'Standout Film' }));
  return recs;
}

describe('storyEngine', () => {
  it('returns no chapters for empty input', () => {
    expect(generateChapters([], [])).toEqual([]);
  });

  it('skips weeks with fewer than 3 receipts', () => {
    const recs = [
      makeR('a', 'purchase', '2015-01-05T00:00:00Z'),
      makeR('b', 'purchase', '2015-01-06T00:00:00Z'),
    ];
    expect(generateChapters(recs, discoverConnections(recs))).toEqual([]);
  });

  it('creates one chapter per qualifying week', () => {
    const janWeek2 = week(new Date(Date.UTC(2015, 0, 5)));
    const febWeek1 = week(new Date(Date.UTC(2015, 1, 2)));
    const all = [...janWeek2, ...febWeek1];
    const chapters = generateChapters(all, discoverConnections(all));
    expect(chapters.length).toBeGreaterThanOrEqual(2);
  });

  it('fills chapter title, summary and dateRange deterministically', () => {
    const recs = week(new Date(Date.UTC(2015, 0, 5)));
    const chapters = generateChapters(recs, discoverConnections(recs));
    expect(chapters.length).toBe(1);
    const c = chapters[0];
    expect(c.title.length).toBeGreaterThan(0);
    expect(c.summary.length).toBeGreaterThan(0);
    expect(c.dateRange).toHaveLength(2);
    expect(c.momentIds.length).toBeGreaterThan(0);
    expect(new Date(c.dateRange[0]).getTime()).toBeLessThan(new Date(c.dateRange[1]).getTime());
    expect(c.summary).toMatch(/Standout|Biggest ticket|Notable/);
  });

  it('mentions total recorded spend in summary when amounts exist', () => {
    const recs = week(new Date(Date.UTC(2015, 0, 5)));
    const chapters = generateChapters(recs, discoverConnections(recs));
    expect(chapters[0].summary).toContain('Total recorded spend');
  });
});
