// Dashboard 計算工具函數

import { TestRecord, StationStats, ModelStats, DailyStats, KPIData, RetestRecord, DateRangeInfo } from '../types';

/**
 * 計算 KPI 數據
 */
export function calculateKPI(records: TestRecord[]) {
  const totalTests = records.length;
  const passed = records.filter(r => r.result === 'PASS').length;
  const failed = totalTests - passed;
  const passRate = totalTests > 0 ? (passed / totalTests) * 100 : 0;
  const deviceCount = new Set(records.map(r => r.serialNumber)).size;
  const passedDeviceCount = new Set(records.filter(r => r.result === 'PASS').map(r => r.serialNumber)).size;
  const productionYieldRate = deviceCount > 0 ? (passedDeviceCount / deviceCount) * 100 : 0;
  const retestCount = records.length - deviceCount;
  const previousRate = 85; // 假設的前期數據
  const trend = passRate > previousRate ? 'up' : passRate < previousRate ? 'down' : 'neutral';
  const trendValue = `${Math.abs(passRate - previousRate).toFixed(1)}%`;

  return {
    total: totalTests,
    passed,
    failed,
    passRate: parseFloat(passRate.toFixed(1)),
    passRateText: `${passRate.toFixed(1)}`,
    deviceCount,
    passedDeviceCount,
    productionYieldRate: parseFloat(productionYieldRate.toFixed(1)),
    productionYieldRateText: `${productionYieldRate.toFixed(1)}`,
    retestCount,
    trend,
    trendValue
  };
}

/**
 * 按站別統計
 */
export function calculateStationStats(records: TestRecord[], configuredStations: string[]): StationStats[] {
  const stats: Record<string, { total: number; failed: number; passed: number }> = {};

  configuredStations.forEach(station => {
    stats[station] = { total: 0, failed: 0, passed: 0 };
  });

  records.forEach(record => {
    const station = record.station || 'Unknown';
    if (!stats[station]) {
      stats[station] = { total: 0, failed: 0, passed: 0 };
    }
    stats[station].total++;
    if (record.result === 'PASS') {
      stats[station].passed++;
    } else {
      stats[station].failed++;
    }
  });
  
  return Object.entries(stats).map(([station, data]) => ({
      ...data,
      station,
      passRate: data.total > 0 ? (data.passed / data.total) * 100 : 0,
  }));
}

/**
 * 按機種統計
 */
export function calculateModelStats(records: TestRecord[], configuredModels: string[]) {
  const stats: Record<string, { total: number; passed: number; passRate: number }> = {};

  configuredModels.forEach((model: string) => {
    stats[model] = { total: 0, passed: 0, passRate: 0 };
  });

  records.forEach(record => {
    const model = record.model || 'Unknown';
    if (!stats[model]) {
      stats[model] = { total: 0, passed: 0, passRate: 0 };
    }
    stats[model].total++;
    if (record.result === 'PASS') {
      stats[model].passed++;
    }
  });

  Object.keys(stats).forEach(model => {
    const data = stats[model];
    data.passRate = data.total > 0 ? Number(((data.passed / data.total) * 100).toFixed(1)) : 0;
  });

  return stats;
}

/**
 * 按日期統計
 */
export function calculateDailyStats(records: TestRecord[], dateRangeInfo: DateRangeInfo) {
    const { startDate, endDate, diffDays } = dateRangeInfo;
    const dailyStats: { date: string; total: number; passed: number; failed: number; devices: Set<string> }[] = [];

    for (let i = 0; i < diffDays; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      dailyStats.push({
        date: currentDate.toISOString().slice(0, 10),
        total: 0,
        passed: 0,
        failed: 0,
        devices: new Set()
      });
    }

    records.forEach(record => {
      const testDate = new Date(record.testTime).toISOString().slice(0, 10);
      const dayIndex = dailyStats.findIndex(day => day.date === testDate);

      if (dayIndex !== -1) {
        dailyStats[dayIndex].total++;
        if (record.result === 'PASS') {
          dailyStats[dayIndex].passed++;
        } else {
          dailyStats[dayIndex].failed++;
        }
        if (record.serialNumber) {
          dailyStats[dayIndex].devices.add(record.serialNumber);
        }
      }
    });

    return {
      totalTests: dailyStats.map(day => day.total),
      passRates: dailyStats.map(day => day.total > 0 ? Math.round((day.passed / day.total) * 100) : 0),
      deviceCounts: dailyStats.map(day => day.devices.size),
      retestCounts: dailyStats.map(day => Math.floor(day.failed * 0.3)) // 模擬數據
    };
}

/**
 * 計算複測記錄
 */
export function calculateRetestRecords(records: TestRecord[]): RetestRecord[] {
  const failedRecords = records.filter(r => r.result === 'FAIL');
  const serialGroups = new Map<string, TestRecord[]>();

  failedRecords.forEach(record => {
    const serial = record.serialNumber;
    if (!serialGroups.has(serial)) {
      serialGroups.set(serial, []);
    }
    serialGroups.get(serial)!.push(record);
  });

  const retestData: RetestRecord[] = [];
  serialGroups.forEach((records, serialNumber) => {
    if (records.length < 2) return;

    const sortedRecords = records.sort((a, b) => new Date(a.testTime).getTime() - new Date(b.testTime).getTime());
    const allFailedItems: string[] = [];
    sortedRecords.forEach(record => {
      if (record.items && Array.isArray(record.items)) {
        allFailedItems.push(...record.items.filter(item => item.result === 'FAIL').map(item => item.name));
      }
    });

    retestData.push({
      serialNumber,
      retestCount: records.length,
      failureReason: [...new Set(allFailedItems)].join(', ') || '測試失敗',
      allRecords: sortedRecords,
      ...sortedRecords[sortedRecords.length - 1]
    });
  });

  return retestData.sort((a, b) => b.retestCount - a.retestCount);
}
