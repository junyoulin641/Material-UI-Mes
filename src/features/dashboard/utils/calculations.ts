// Dashboard 計算工具函數

import { TestRecord, StationStats, ModelStats, DailyStats, KPIData, RetestRecord, DateRangeInfo } from '../types';

/**
 * 計算 KPI 數據
 * @param records - 測試記錄
 * @param filterStation - 篩選的站別（如果有的話），用於判斷良率計算邏輯
 */
export function calculateKPI(records: TestRecord[], filterStation?: string) {
  const totalTests = records.length;

  // 計算設備數（按序號統計，不分站別）
  const deviceCount = new Set(records.map(r => r.serialNumber)).size;

  // 按「序號」分組，找出每個序號在各站別的測試情況
  const serialGroups = new Map<string, TestRecord[]>();
  records.forEach(record => {
    const serial = record.serialNumber;
    if (!serialGroups.has(serial)) {
      serialGroups.set(serial, []);
    }
    serialGroups.get(serial)!.push(record);
  });

  let passed = 0;
  let passedDeviceCount = 0;

  if (filterStation && filterStation.trim() !== '') {
    // 單一站別模式：只看該站別，有 PASS 就算 PASS（包含復測後 PASS）
    serialGroups.forEach((allRecords, serial) => {
      // 只看該站別的記錄
      const stationRecords = allRecords.filter(r => r.station === filterStation);

      if (stationRecords.length > 0) {
        // 按時間排序，取最後一次測試結果
        const sortedRecords = stationRecords.sort((a, b) =>
          new Date(a.testTime).getTime() - new Date(b.testTime).getTime()
        );
        const lastResult = sortedRecords[sortedRecords.length - 1];

        if (lastResult.result === 'PASS') {
          passedDeviceCount++;
        }
      }
    });

    // 測試良率 = 生產良率（單站別模式下相同）
    passed = passedDeviceCount;

  } else {
    // 全部站別模式：每個序號在其實際測試過的所有站別都必須 PASS（包含復測後 PASS）
    serialGroups.forEach((allRecords, serial) => {
      // 按站別分組該序號的記錄
      const stationResults = new Map<string, TestRecord[]>();
      allRecords.forEach(record => {
        const station = record.station;
        if (!stationResults.has(station)) {
          stationResults.set(station, []);
        }
        stationResults.get(station)!.push(record);
      });

      // 檢查該序號實際測試過的每個站別的最終結果
      let allStationsPassed = true;
      stationResults.forEach((stationRecords, station) => {
        // 按時間排序，取最後一次測試結果
        const sortedRecords = stationRecords.sort((a, b) =>
          new Date(a.testTime).getTime() - new Date(b.testTime).getTime()
        );
        const lastResult = sortedRecords[sortedRecords.length - 1];

        if (lastResult.result !== 'PASS') {
          allStationsPassed = false;
        }
      });

      if (allStationsPassed) {
        passedDeviceCount++;
      }
    });

    // 測試良率 = 生產良率（全站別模式下相同）
    passed = passedDeviceCount;
  }

  const failed = deviceCount - passed;
  const passRate = deviceCount > 0 ? (passed / deviceCount) * 100 : 0;
  const productionYieldRate = passRate; // 兩者相同

  // 計算復測數量
  const retestCount = totalTests - deviceCount;

  // 計算趨勢
  const previousRate = 0;
  const trend = passRate > previousRate ? 'up' : passRate < previousRate ? 'down' : 'neutral';
  const trendValue = `${passRate.toFixed(1)}%`;

  return {
    total: totalTests,
    passed,
    failed,
    passRate: parseFloat(passRate.toFixed(1)),
    passRateText: `${passRate.toFixed(1)}%`,
    deviceCount,
    passedDeviceCount,
    productionYieldRate: parseFloat(productionYieldRate.toFixed(1)),
    productionYieldRateText: `${productionYieldRate.toFixed(1)}%`,
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
    const dailyStats: {
      date: string;
      total: number;
      passed: number;
      failed: number;
      devices: Set<string>;
      passedDevices: Set<string>;
    }[] = [];

    for (let i = 0; i < diffDays; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      dailyStats.push({
        date: currentDate.toISOString().slice(0, 10),
        total: 0,
        passed: 0,
        failed: 0,
        devices: new Set(),
        passedDevices: new Set()
      });
    }

    records.forEach(record => {
      const testDate = new Date(record.testTime).toISOString().slice(0, 10);
      const dayIndex = dailyStats.findIndex(day => day.date === testDate);

      if (dayIndex !== -1) {
        dailyStats[dayIndex].total++;
        if (record.result === 'PASS') {
          dailyStats[dayIndex].passed++;
          if (record.serialNumber) {
            dailyStats[dayIndex].passedDevices.add(record.serialNumber);
          }
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
      productionYieldRates: dailyStats.map(day =>
        day.devices.size > 0 ? Math.round((day.passedDevices.size / day.devices.size) * 100) : 0
      ),
      retestCounts: dailyStats.map(day => day.total - day.devices.size) // 實際復測數量 = 總測試數 - 不重複設備數
    };
}

/**
 * 按日期和站別統計
 */
export function calculateDailyStationStats(
  records: TestRecord[],
  dateRangeInfo: DateRangeInfo,
  configuredStations: string[]
) {
  const { startDate, diffDays } = dateRangeInfo;

  // 初始化每日每站別的統計
  const dailyStationStats: Record<string, number[]> = {};

  configuredStations.forEach(station => {
    dailyStationStats[station] = new Array(diffDays).fill(0);
  });

  // 統計每筆記錄
  records.forEach(record => {
    const testDate = new Date(record.testTime).toISOString().slice(0, 10);
    const station = record.station || 'Unknown';

    // 如果站別不在配置中，自動加入
    if (!dailyStationStats[station]) {
      dailyStationStats[station] = new Array(diffDays).fill(0);
    }

    // 找到對應的日期索引
    for (let i = 0; i < diffDays; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      const dateStr = currentDate.toISOString().slice(0, 10);

      if (testDate === dateStr) {
        dailyStationStats[station][i]++;
        break;
      }
    }
  });

  return dailyStationStats;
}

/**
 * 計算複測記錄（包含 PASS 和 FAIL 的複測）
 * 判定條件：序號 + 站別都要相同才算同一個複測組
 */
export function calculateRetestRecords(records: TestRecord[]): RetestRecord[] {
  // 使用「站別:序號」作為 key 來分組
  const stationSerialGroups = new Map<string, TestRecord[]>();

  records.forEach(record => {
    const station = record.station || 'Unknown';
    const serial = record.serialNumber;
    const key = `${station}:${serial}`;

    if (!stationSerialGroups.has(key)) {
      stationSerialGroups.set(key, []);
    }
    stationSerialGroups.get(key)!.push(record);
  });

  const retestData: RetestRecord[] = [];

  stationSerialGroups.forEach((groupRecords, key) => {
    // 只有測試次數 >= 2 才可能是複測
    if (groupRecords.length < 2) return;

    const [station, serialNumber] = key.split(':');

    // 按時間排序
    const sortedRecords = groupRecords.sort((a, b) =>
      new Date(a.testTime).getTime() - new Date(b.testTime).getTime()
    );

    // 檢查第一次測試結果
    const firstTest = sortedRecords[0];

    // 如果第一次就 PASS，不算複測，直接跳過
    if (firstTest.result === 'PASS') return;

    // 收集所有失敗的測項名稱
    const allFailedItems: string[] = [];
    sortedRecords.forEach(record => {
      if (record.items && Array.isArray(record.items)) {
        allFailedItems.push(
          ...record.items
            .filter(item => item.result === 'FAIL')
            .map(item => item.name)
        );
      }
    });

    // 取最後一次測試的結果作為最終狀態
    const latestRecord = sortedRecords[sortedRecords.length - 1];

    retestData.push({
      serialNumber,
      station,
      retestCount: groupRecords.length,
      failureReason: [...new Set(allFailedItems)].join(', ') || (latestRecord.result === 'PASS' ? '複測通過' : '測試失敗'),
      allRecords: sortedRecords,
      ...latestRecord
    });
  });

  // 按複測次數排序（從多到少）
  return retestData.sort((a, b) => b.retestCount - a.retestCount);
}

/**
 * 計算失敗原因分析
 */
export function calculateFailureReasons(records: TestRecord[]) {
  const testItemStats = new Map<string, { total: number, failed: number }>();

  // 統計每個測項的總數和失敗數
  records.forEach(record => {
    if (record.items && Array.isArray(record.items)) {
      record.items.forEach((item: any) => {
        const testName = item.name || 'Unknown Test';
        const current = testItemStats.get(testName) || { total: 0, failed: 0 };
        current.total++;
        if (item.result === 'FAIL') {
          current.failed++;
        }
        testItemStats.set(testName, current);
      });
    }
  });

  // 轉換為陣列並計算失敗比例，只顯示有失敗的測項
  return Array.from(testItemStats.entries())
    .map(([testName, stats]) => ({
      reason: testName,
      count: stats.failed,
      total: stats.total,
      failureRate: stats.total > 0 ? Number(((stats.failed / stats.total) * 100).toFixed(1)) : 0
    }))
    .filter(item => item.count > 0) // 只顯示有失敗的測項
    .sort((a, b) => b.failureRate - a.failureRate) // 按失敗率排序
    .slice(0, 10); // 限制顯示數量
}

/**
 * 計算復測統計數據（按站別+序號組合判斷）
 */
export function calculateRetestStats(records: TestRecord[]) {
  const retestData = new Map<string, { originalCount: number, retestCount: number, finalPassCount: number }>();

  // 根據「站別+序號」組合分組，找出同站別同序號的多次測試記錄
  const stationSerialGroups = new Map<string, any[]>();
  records.forEach(record => {
    const station = record.station || 'Unknown';
    const serial = record.serialNumber;
    const key = `${station}:${serial}`;

    if (!stationSerialGroups.has(key)) {
      stationSerialGroups.set(key, []);
    }
    stationSerialGroups.get(key)!.push(record);
  });

  // 分析每個站別+序號組合的測試情況
  stationSerialGroups.forEach((records, key) => {
    const station = key.split(':')[0];

    if (!retestData.has(station)) {
      retestData.set(station, { originalCount: 0, retestCount: 0, finalPassCount: 0 });
    }

    const stationData = retestData.get(station)!;

    if (records.length > 1) {
      // 同站別同序號有多次測試，需要檢查是否算復測
      // 按時間排序
      records.sort((a, b) => new Date(a.testTime).getTime() - new Date(b.testTime).getTime());

      const firstTest = records[0];

      // 只有第一次是 FAIL 才算復測
      if (firstTest.result === 'FAIL') {
        stationData.originalCount++;
        stationData.retestCount++;

        // 檢查最終結果是否通過
        const lastTest = records[records.length - 1];
        if (lastTest.result === 'PASS') {
          stationData.finalPassCount++;
        }
      } else {
        // 第一次就 PASS，不算復測，只算原始測試
        stationData.originalCount++;
      }
    } else {
      // 單次測試
      stationData.originalCount++;
    }
  });

  // 轉換為陣列並計算統計值
  return Array.from(retestData.entries())
    .map(([station, data]) => ({
      station,
      originalCount: data.originalCount,
      retestCount: data.retestCount,
      retestRate: data.originalCount > 0 ? Number(((data.retestCount / data.originalCount) * 100).toFixed(1)) : 0,
      finalPassCount: data.finalPassCount,
      retestPassRate: data.retestCount > 0 ? Number(((data.finalPassCount / data.retestCount) * 100).toFixed(1)) : 0
    }))
    .filter(item => item.retestCount > 0) // 只顯示有復測的站別
    .sort((a, b) => b.retestRate - a.retestRate); // 按復測率排序
}

/**
 * 計算每日各站別良率（用於熱力圖）
 * 返回格式：{ station: [(number|null)[], ...] }
 * null 表示該日期沒有測試數據
 */
export function calculateDailyStationPassRates(
  records: TestRecord[],
  dateRangeInfo: DateRangeInfo,
  configuredStations: string[]
): Record<string, (number | null)[]> {
  const { startDate, diffDays } = dateRangeInfo;
  const dailyStationPassRates: Record<string, (number | null)[]> = {};

  // 初始化每個站別的每日良率陣列（null 表示無數據）
  configuredStations.forEach(station => {
    dailyStationPassRates[station] = new Array(diffDays).fill(null);
  });

  // 按日期和站別分組計算良率
  for (let i = 0; i < diffDays; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + i);
    const dateStr = currentDate.toISOString().slice(0, 10);

    configuredStations.forEach(station => {
      // 取得該日期該站別的所有記錄
      const dayStationRecords = records.filter(record => {
        if (!record.testTime) return false;

        let recordDateStr: string;
        if (record.testTime.includes('T')) {
          recordDateStr = record.testTime.split('T')[0];
        } else if (record.testTime.includes(' ')) {
          recordDateStr = record.testTime.split(' ')[0];
        } else {
          recordDateStr = record.testTime.slice(0, 10);
        }

        return recordDateStr === dateStr && record.station === station;
      });

      if (dayStationRecords.length > 0) {
        const passedCount = dayStationRecords.filter(r => r.result === 'PASS').length;
        const passRate = (passedCount / dayStationRecords.length) * 100;
        dailyStationPassRates[station][i] = Math.round(passRate);
      }
      // 如果沒有記錄，保持為 null
    });
  }

  return dailyStationPassRates;
}
