import type { Receipt, ReceiptCategory } from '../types/receipt';

export interface LifeSummary {
  totalSpend: number;
  topCategory: ReceiptCategory;
  daysTracked: number;
  totalReceipts: number;
  favoriteMonth: string;
}

function monthKey(timestamp: string): string {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return '';
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
}

export function generateLifeSummary(receipts: Receipt[]): LifeSummary {
  const categoryCounts = new Map<ReceiptCategory, number>();
  const days = new Set<string>();
  const months = new Map<string, number>();
  let totalSpend = 0;

  for (const receipt of receipts) {
    categoryCounts.set(receipt.category, (categoryCounts.get(receipt.category) ?? 0) + 1);
    const date = new Date(receipt.timestamp);
    if (!Number.isNaN(date.getTime())) {
      days.add(`${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`);
    }
    const month = monthKey(receipt.timestamp);
    if (month) months.set(month, (months.get(month) ?? 0) + 1);
    if (typeof receipt.amount === 'number' && Number.isFinite(receipt.amount)) totalSpend += receipt.amount;
  }

  const topCategory = [...categoryCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'note';
  const favoriteMonth = [...months.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? '';

  return {
    totalSpend,
    topCategory,
    daysTracked: days.size,
    totalReceipts: receipts.length,
    favoriteMonth,
  };
}
