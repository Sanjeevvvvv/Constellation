import { describe, it, expect } from 'vitest';
import {
  selectFilteredReceipts, selectTimelineGroups, selectChapterById,
  receiptsForChapter, receiptsForMoment,
} from '../selectors';
import type { Receipt, Chapter, Moment, Filters } from '../types/receipt';
import { discoverConnections } from '../services/connectionEngine';
import { generateChapters } from '../services/storyEngine';

function makeR(id: string, category: any, timestamp: string, extra: Partial<Receipt> = {}): Receipt {
  return { id, category, timestamp, title: id, _source: 'synthetic', ...extra } as Receipt;
}

const baseFilters: Filters = { search: '', categories: [], dateFrom: undefined, dateTo: undefined };

describe('selectors', () => {
  describe('selectFilteredReceipts', () => {
    const data: Receipt[] = [
      makeR('a', 'purchase', '2015-01-15T12:00:00Z', { title: 'Groceries', tags: ['Food', 'Cash'] }),
      makeR('b', 'music',    '2015-03-20T12:00:00Z', { title: 'Mr. Jones', tags: ['Counting Crows'] }),
      makeR('c', 'place',    '2015-05-01T12:00:00Z', { title: 'Visit Café', location: { name: 'Riverside Café' } }),
      makeR('d', 'note',     '2015-07-10T12:00:00Z', { title: 'Personal Note', description: 'Feeling anxious today' }),
    ];

    it('passes through everything when filters are empty', () => {
      expect(selectFilteredReceipts(data, baseFilters)).toHaveLength(4);
    });

    it('filters by multiple categories (multi-select)', () => {
      const out = selectFilteredReceipts(data, { ...baseFilters, categories: ['purchase', 'music'] });
      expect(out.map(r => r.id).sort()).toEqual(['a', 'b']);
    });

    it('filters by date range inclusive', () => {
      const out = selectFilteredReceipts(data, { ...baseFilters, dateFrom: '2015-02-01', dateTo: '2015-06-30' });
      expect(out.map(r => r.id).sort()).toEqual(['b', 'c']);
    });

    it('searches by title substring (case-insensitive)', () => {
      const out = selectFilteredReceipts(data, { ...baseFilters, search: 'grocer' });
      expect(out.map(r => r.id)).toEqual(['a']);
    });

    it('searches by tag', () => {
      expect(selectFilteredReceipts(data, { ...baseFilters, search: 'counting' }).map(r => r.id)).toEqual(['b']);
    });

    it('searches by location name', () => {
      expect(selectFilteredReceipts(data, { ...baseFilters, search: 'riverside' }).map(r => r.id)).toEqual(['c']);
    });

    it('searches by description', () => {
      expect(selectFilteredReceipts(data, { ...baseFilters, search: 'anxious' }).map(r => r.id)).toEqual(['d']);
    });

    it('combines filters together (AND)', () => {
      const out = selectFilteredReceipts(data, { ...baseFilters, categories: ['place'], search: 'Riverside' });
      expect(out.map(r => r.id)).toEqual(['c']);
      const none = selectFilteredReceipts(data, { ...baseFilters, categories: ['music'], search: 'Groceries' });
      expect(none).toEqual([]);
    });
  });

  describe('selectTimelineGroups', () => {
    it('groups by UTC day in chronological order', () => {
      const data = [
        makeR('a', 'purchase', '2015-03-14T09:00:00Z'),
        makeR('b', 'purchase', '2015-03-15T09:00:00Z'),
        makeR('c', 'purchase', '2015-03-14T22:00:00Z'),
      ];
      const groups = selectTimelineGroups(data);
      expect(groups).toHaveLength(2);
      expect(groups[0].receipts.map(r => r.id)).toEqual(['a', 'c']);
      expect(groups[1].receipts.map(r => r.id)).toEqual(['b']);
    });

    it('produces a human-friendly label in 2015', () => {
      const groups = selectTimelineGroups([makeR('a', 'purchase', '2015-01-01T12:00:00Z')]);
      expect(groups[0].label).toMatch(/2015/);
    });
  });

  describe('selectChapterById', () => {
    const recs: Receipt[] = Array.from({ length: 10 }, (_, i) =>
      makeR(`r-${i}`, 'purchase', `2015-01-0${(i % 7) + 1}T12:00:00Z`, { amount: 50 + i }),
    );
    const moments: Moment[] = discoverConnections(recs);
    const chapters: Chapter[] = generateChapters(recs, moments);

    it('finds chapter by id', () => {
      if (chapters.length > 0) {
        expect(selectChapterById(chapters, chapters[0].id)?.id).toBe(chapters[0].id);
      }
    });

    it('returns undefined when id missing or undefined', () => {
      expect(selectChapterById(chapters, undefined)).toBeUndefined();
      expect(selectChapterById(chapters, 'nope')).toBeUndefined();
    });
  });

  describe('receiptsForMoment / receiptsForChapter', () => {
    const r1 = makeR('a', 'purchase', '2015-06-01T09:00:00Z', { amount: 10 });
    const r2 = makeR('b', 'music',    '2015-06-01T10:00:00Z');
    const r3 = makeR('c', 'purchase', '2015-06-02T09:00:00Z', { amount: 20 });
    const recs = [r1, r2, r3];
    const moments = discoverConnections(recs);
    const chapters = generateChapters(recs, moments);

    it('returns receipts belonging to moment', () => {
      const m0 = moments[0];
      const out = receiptsForMoment(recs, m0);
      expect(out.map(r => r.id).sort()).toEqual(m0.receiptIds.slice().sort());
    });

    it('returns receipts for chapter sorted chronologically', () => {
      if (chapters.length > 0) {
        const out = receiptsForChapter(recs, moments, chapters[0]);
        const times = out.map(r => new Date(r.timestamp).getTime());
        for (let i = 1; i < times.length; i++) expect(times[i]).toBeGreaterThanOrEqual(times[i - 1]);
      }
    });
  });
});
