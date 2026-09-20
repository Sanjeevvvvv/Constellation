import { describe, it, expect } from 'vitest';
import {
  categoryDistribution, monthlySpending, monthlyListening,
  placeVisitFrequency, categoryDistributionOverTime,
} from '../services/patternInsights';
import type { Receipt } from '../types/receipt';

function makeR(id: string, category: any, timestamp: string, extra: Partial<Receipt> = {}): Receipt {
  return { id, category, timestamp, title: id, _source: 'synthetic', ...extra } as Receipt;
}

describe('patternInsights', () => {
  describe('categoryDistribution', () => {
    it('sorts categories descending by count', () => {
      const data = [
        makeR('a', 'purchase', '2015-01-01T00:00:00Z'),
        makeR('b', 'purchase', '2015-01-02T00:00:00Z'),
        makeR('c', 'music',    '2015-01-02T00:00:00Z'),
      ];
      const dist = categoryDistribution(data);
      expect(dist.map(d => d.category)).toEqual(['purchase', 'music']);
      expect(dist[0].count).toBe(2);
    });

    it('returns empty array for empty input', () => {
      expect(categoryDistribution([])).toEqual([]);
    });
  });

  describe('monthlySpending', () => {
    it('aggregates amount by month, treating absent as 0', () => {
      const data = [
        makeR('a', 'purchase', '2015-01-01T12:00:00Z', { amount: 100 }),
        makeR('b', 'purchase', '2015-01-15T12:00:00Z', { amount: 50.5 }),
        makeR('c', 'music',    '2015-02-01T12:00:00Z'),
        makeR('d', 'purchase', '2015-02-01T12:00:00Z', { amount: 75 }),
      ];
      const s = monthlySpending(data);
      expect(s).toHaveLength(2);
      expect(s[0].month).toBe('2015-01');
      expect(s[0].value).toBe(150.5);
      expect(s[1].month).toBe('2015-02');
      expect(s[1].value).toBe(75);
    });
  });

  describe('monthlyListening', () => {
    it('counts only music receipts per month', () => {
      const data = [
        makeR('a', 'music',    '2015-03-01T12:00:00Z'),
        makeR('b', 'music',    '2015-03-15T12:00:00Z'),
        makeR('c', 'purchase', '2015-03-20T12:00:00Z'),
        makeR('d', 'music',    '2015-04-01T12:00:00Z'),
      ];
      const l = monthlyListening(data);
      expect(l).toHaveLength(2);
      expect(l[0].value).toBe(2);
      expect(l[1].value).toBe(1);
    });

    it('returns empty when no music receipts exist', () => {
      expect(monthlyListening([makeR('a', 'purchase', '2015-01-01T00:00:00Z')])).toEqual([]);
    });
  });

  describe('placeVisitFrequency', () => {
    it('counts by location.name and ignores receipts without location', () => {
      const data = [
        makeR('a', 'place',    '2015-01-01T00:00:00Z', { location: { name: 'Café' } }),
        makeR('b', 'place',    '2015-01-02T00:00:00Z', { location: { name: 'Café' } }),
        makeR('c', 'purchase', '2015-01-02T00:00:00Z', { location: { name: 'Station' } }),
        makeR('d', 'purchase', '2015-01-02T00:00:00Z'),
      ];
      const p = placeVisitFrequency(data);
      expect(p).toHaveLength(2);
      expect(p[0].name).toBe('Café');
      expect(p[0].count).toBe(2);
      expect(p[1].name).toBe('Station');
    });

    it('returns empty for empty input', () => {
      expect(placeVisitFrequency([])).toEqual([]);
    });
  });

  describe('categoryDistributionOverTime', () => {
    it('produces one row per month with category counts', () => {
      const data = [
        makeR('a', 'purchase', '2015-01-01T12:00:00Z'),
        makeR('b', 'music',    '2015-01-02T12:00:00Z'),
        makeR('c', 'purchase', '2015-02-01T12:00:00Z'),
      ];
      const rows = categoryDistributionOverTime(data);
      expect(rows).toHaveLength(2);
      expect(rows[0].month).toBe('2015-01');
      expect((rows[0] as any).purchase).toBe(1);
      expect((rows[0] as any).music).toBe(1);
      expect(rows[1].month).toBe('2015-02');
      expect((rows[1] as any).purchase).toBe(1);
    });
  });
});
