import { describe, it, expect } from 'vitest';
import { discoverConnections, discoverConnectionsV2 } from '../services/connectionEngine';
import type { Receipt } from '../types/receipt';

function makeR(id: string, category: any, timestamp: string, extra: Partial<Receipt> = {}): Receipt {
  return {
    id, category, timestamp, title: id,
    _source: 'synthetic',
    ...extra,
  } as Receipt;
}

describe('connectionEngine', () => {
  it('returns empty moments for empty receipts', () => {
    expect(discoverConnections([])).toEqual([]);
  });

  it('groups receipts from the same calendar day into one moment', () => {
    const a = makeR('a', 'purchase', '2015-03-14T09:00:00Z');
    const b = makeR('b', 'music',    '2015-03-14T22:00:00Z');
    const c = makeR('c', 'purchase', '2015-03-15T00:00:00Z');
    const moments = discoverConnections([a, b, c]);
    expect(moments).toHaveLength(2);
    expect(moments[0].receiptIds).toEqual(expect.arrayContaining(['a', 'b']));
    expect(moments[1].receiptIds).toEqual(['c']);
  });

  it('uses UTC calendar day boundaries', () => {
    const a = makeR('a', 'purchase', '2015-01-01T23:30:00Z');
    const b = makeR('b', 'purchase', '2015-01-02T00:30:00Z');
    const moments = discoverConnections([a, b]);
    expect(moments).toHaveLength(2);
  });

  it('sorts moments chronologically', () => {
    const late = makeR('late', 'purchase', '2015-12-01T00:00:00Z');
    const early = makeR('early', 'purchase', '2015-01-01T00:00:00Z');
    const moments = discoverConnections([late, early]);
    expect(moments.map(m => m.receiptIds[0])).toEqual(['early', 'late']);
  });

  it('sets startTime and endTime to the min/max timestamps of the group', () => {
    const a = makeR('a', 'purchase', '2015-06-01T08:00:00Z');
    const b = makeR('b', 'music',    '2015-06-01T20:00:00Z');
    const [m] = discoverConnections([a, b]);
    expect(new Date(m.startTime).getTime()).toBeLessThan(new Date(m.endTime).getTime());
    const sh = new Date(m.startTime).getUTCHours();
    const eh = new Date(m.endTime).getUTCHours();
    expect(sh).toBe(8);
    expect(eh).toBe(20);
  });

  it('infers theme from most common tag, falling back to most common category', () => {
    const a = makeR('a', 'purchase', '2015-09-09T09:00:00', { tags: ['Food', 'Cash'] });
    const b = makeR('b', 'purchase', '2015-09-09T10:00:00', { tags: ['Food', 'Credit Card'] });
    const c = makeR('c', 'music',    '2015-09-09T11:00:00', { tags: ['John Mayer'] });
    const [m] = discoverConnections([a, b, c]);
    expect(m.theme).toBe('Food');
  });

  it('falls back to category when no tag repeats', () => {
    const a = makeR('a', 'purchase', '2015-09-10T09:00:00', { tags: ['OneOff'] });
    const b = makeR('b', 'purchase', '2015-09-10T10:00:00', { tags: ['Other'] });
    const [m] = discoverConnections([a, b]);
    expect(m.theme).toBe('purchase');
  });

  it('discoverConnectionsV2 returns same groups as V1', () => {
    const a = makeR('a', 'purchase', '2015-03-14T09:00:00Z', { tags: ['Food'] });
    const b = makeR('b', 'purchase', '2015-03-14T10:00:00Z', { tags: ['Food'] });
    const v1 = discoverConnections([a, b]);
    const v2 = discoverConnectionsV2([a, b]);
    expect(v2.length).toEqual(v1.length);
  });
});
