// Table 型別定義

import { TestRecord } from '../../dashboard/types';

export type { TestRecord };

export interface TableFilters {
  searchTerm: string;
  station: string;
  model: string;
  result: 'ALL' | 'PASS' | 'FAIL';
  dateFrom: string;
  dateTo: string;
}

export interface ColumnVisibility {
  [key: string]: boolean;
}

export interface ColumnWidths {
  [key: string]: number;
}

export type SortDirection = 'asc' | 'desc' | null;

export interface SortConfig {
  field: string | null;
  direction: SortDirection;
}
