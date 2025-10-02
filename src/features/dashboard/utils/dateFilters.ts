// Dashboard 日期篩選工具函數

import { DateRangeInfo, QuickFilterType } from '../types';

/**
 * 取得快速篩選的日期範圍
 */
export function getQuickFilterDateRange(filterType: QuickFilterType): DateRangeInfo {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (filterType) {
    case 'today': {
      return {
        startDate: today,
        endDate: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1),
        label: 'Today'
      };
    }

    case 'yesterday': {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      return {
        startDate: yesterday,
        endDate: new Date(yesterday.getTime() + 24 * 60 * 60 * 1000 - 1),
        label: 'Yesterday'
      };
    }

    case 'last7days': {
      const start = new Date(today);
      start.setDate(start.getDate() - 6);
      return {
        startDate: start,
        endDate: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1),
        label: 'Last 7 Days'
      };
    }

    case 'last30days': {
      const start = new Date(today);
      start.setDate(start.getDate() - 29);
      return {
        startDate: start,
        endDate: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1),
        label: 'Last 30 Days'
      };
    }

    case 'thisWeek': {
      const firstDay = new Date(today);
      firstDay.setDate(today.getDate() - today.getDay());
      return {
        startDate: firstDay,
        endDate: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1),
        label: 'This Week'
      };
    }

    case 'lastWeek': {
      const lastWeekStart = new Date(today);
      lastWeekStart.setDate(today.getDate() - today.getDay() - 7);
      const lastWeekEnd = new Date(lastWeekStart);
      lastWeekEnd.setDate(lastWeekStart.getDate() + 6);
      return {
        startDate: lastWeekStart,
        endDate: new Date(lastWeekEnd.getTime() + 24 * 60 * 60 * 1000 - 1),
        label: 'Last Week'
      };
    }

    case 'thisMonth': {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      return {
        startDate: firstDay,
        endDate: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1),
        label: 'This Month'
      };
    }

    case 'lastMonth': {
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
      return {
        startDate: lastMonthStart,
        endDate: new Date(lastMonthEnd.getTime() + 24 * 60 * 60 * 1000 - 1),
        label: 'Last Month'
      };
    }

    default: {
      return {
        startDate: today,
        endDate: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1),
        label: 'Custom'
      };
    }
  }
}

/**
 * 篩選日期範圍內的記錄
 */
export function filterRecordsByDateRange<T extends { datetime: string }>(
  records: T[],
  startDate: Date,
  endDate: Date
): T[] {
  return records.filter(record => {
    const recordDate = new Date(record.datetime);
    return recordDate >= startDate && recordDate <= endDate;
  });
}

/**
 * 格式化日期顯示
 */
export function formatDateDisplay(date: Date): string {
  return date.toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
}

/**
 * 格式化日期時間顯示
 */
export function formatDateTimeDisplay(date: Date): string {
  return date.toLocaleString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}
