export type ReceiptCategory = 'music' | 'purchase' | 'movie' | 'event' | 'place' | 'photo' | 'message' | 'search' | 'note';

export interface Receipt {
  id: string;
  category: ReceiptCategory;
  timestamp: string;
  title: string;
  description?: string;
  tags?: string[];
  location?: { name: string };
  amount?: number;
  _source: 'real:spotify' | 'real:household' | 'synthetic';
  _synthetic?: boolean;
}

export interface Moment {
  id: string;
  receiptIds: string[];
  theme: string;
  startTime: string;
  endTime: string;
}

export interface Chapter {
  id: string;
  title: string;
  summary: string;
  momentIds: string[];
  dateRange: [string, string];
}

export interface Filters {
  search: string;
  categories: ReceiptCategory[];
  dateFrom?: string;
  dateTo?: string;
}

export type View = 'timeline' | 'story' | 'insights' | 'connections' | 'places';
