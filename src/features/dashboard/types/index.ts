// Dashboard 型別定義

/**
 * StatCardProps - StatCard 組件的 Props 定義
 */
export interface StatCardProps {
  title: string;              // 卡片標題（例如：「總測試數」）- 必填
  value: string;              // 主要數值（例如：「1,234」）- 必填
  subtitle?: string;          // 副標題（例如：「較上週」）- 可選
  interval: string;           // 時間區間（例如：「最近 7 天」）- 必填
  trend: "up" | "down" | "neutral";  // 趨勢方向（上升/下降/持平）- 必填
  trendValue?: string;        // 趨勢值（例如：「+25%」）- 可選，有預設值
  data: number[];             // 趨勢圖資料（數字陣列）- 必填
  icon?: React.ReactNode;     // 圖示（顯示在右上角）- 可選
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning';  // 主題色 - 可選
  chip?: {                    // 自訂 Chip 標籤 - 可選
    label: string;
    color: 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning';
  };
  dateRange?: {               // 日期範圍 - 可選
    startDate: Date;
    endDate: Date;
  };
}

export interface TestRecord {
  id: number;
  serial: string;
  workOrder?: string;
  station: string;
  model: string;
  result: 'PASS' | 'FAIL';
  datetime: string;
  tester?: string;
  items?: TestItem[];
  [key: string]: any;
}

export interface TestItem {
  name: string;
  value: string | number;
  result: 'PASS' | 'FAIL';
  unit?: string;
}

export interface StationStats {
  station: string;
  total: number;
  pass: number;
  fail: number;
  passRate: number;
}

export interface ModelStats {
  model: string;
  total: number;
  pass: number;
  fail: number;
  passRate: number;
}

export interface DailyStats {
  date: string;
  total: number;
  pass: number;
  fail: number;
  passRate: number;
}

export interface KPIData {
  totalTests: number;
  passCount: number;
  failCount: number;
  passRate: number;
}

export interface RetestRecord {
  serial: string;
  model: string;
  station: string;
  retestCount: number;
  failedItems: string[];
  records: TestRecord[];
}

export interface DateRangeInfo {
  startDate: Date;
  endDate: Date;
  label: string;
}

export type QuickFilterType = 'today' | 'yesterday' | 'last7days' | 'last30days' | 'thisWeek' | 'lastWeek' | 'thisMonth' | 'lastMonth' | 'custom';
