import { describe, expect, it } from 'vitest';
import { generateLifeSummary } from '../services/lifeSummary';
import type { Receipt } from '../types/receipt';

const receipt = (overrides: Partial<Receipt>): Receipt => ({
  id: 'receipt',
  category: 'purchase',
  timestamp: '2024-01-01T10:00:00.000Z',
  title: 'Receipt',
  _source: 'synthetic',
  ...overrides,
});

describe('generateLifeSummary', () => {
  it('summarizes totals and tracked days', () => {
    const summary = generateLifeSummary([
      receipt({ id: 'one', amount: 120, timestamp: '2024-01-01T10:00:00.000Z' }),
      receipt({ id: 'two', amount: 80, timestamp: '2024-01-01T12:00:00.000Z' }),
      receipt({ id: 'three', amount: 50, timestamp: '2024-01-03T12:00:00.000Z' }),
    ]);

    expect(summary).toMatchObject({ totalSpend: 250, daysTracked: 2, totalReceipts: 3 });
  });

  it('finds the most common category', () => {
    const summary = generateLifeSummary([
      receipt({ id: 'one', category: 'music' }),
      receipt({ id: 'two', category: 'music' }),
      receipt({ id: 'three', category: 'place' }),
    ]);

    expect(summary.topCategory).toBe('music');
  });

  it('finds the most active month using UTC dates', () => {
    const summary = generateLifeSummary([
      receipt({ id: 'one', timestamp: '2024-02-01T23:00:00.000Z' }),
      receipt({ id: 'two', timestamp: '2024-02-15T23:00:00.000Z' }),
      receipt({ id: 'three', timestamp: '2024-01-31T23:00:00.000Z' }),
    ]);

    expect(summary.favoriteMonth).toBe('2024-02');
  });

  it('returns stable empty defaults', () => {
    expect(generateLifeSummary([])).toEqual({
      totalSpend: 0,
      topCategory: 'note',
      daysTracked: 0,
      totalReceipts: 0,
      favoriteMonth: '',
    });
  });
});
