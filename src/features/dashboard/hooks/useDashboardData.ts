import { useState, useEffect, useMemo } from 'react';
import { getMESDatabase, TestRecord } from '../../../utils/MESDatabase';
import { SimpleFilterOptions } from '../components/SimpleQuickFilters';
import { useLanguage } from '../../../contexts/LanguageContext';
import {
  calculateKPI,
  calculateStationStats,
  calculateModelStats,
  calculateDailyStats,
  calculateDailyStationStats,
  calculateDailyStationPassRates,
  calculateRetestRecords,
  calculateFailureReasons,
  calculateRetestStats,
} from '../utils/calculations';

/**
 * 負責儀表板所有資料載入、篩選和計算的 Hook
 * @param filters - 從 UI 傳入的篩選條件物件
 */
export function useDashboardData(filters: SimpleFilterOptions) {
  const { t } = useLanguage();
  const [allRecords, setAllRecords] = useState<TestRecord[]>([]);
  const [configuredStations, setConfiguredStations] = useState<string[]>([]);
  const [configuredModels, setConfiguredModels] = useState<string[]>([]);

  // 載入原始資料 (Test Records, Stations, Models)
  useEffect(() => {
    const loadData = async () => {
      try {
        const db = await getMESDatabase();
        const records = await db.getAllTestRecords();
        setAllRecords(records);
        console.log(`[useDashboardData] Loaded ${records.length} records from DB.`);

        const stations = JSON.parse(localStorage.getItem('mesStations') || '[]');
        const models = JSON.parse(localStorage.getItem('mesModels') || '[]');
        setConfiguredStations(stations);
        setConfiguredModels(models);

      } catch (error) {
        console.error('[useDashboardData] Failed to load initial data:', error);
      }
    };

    loadData();

    // 監聽外部資料更新事件
    const handleDataUpdate = () => loadData();
    window.addEventListener('mesDataUpdated', handleDataUpdate);
    return () => {
      window.removeEventListener('mesDataUpdated', handleDataUpdate);
    };
  }, []);

  // 根據篩選條件過濾資料
  const filteredData = useMemo(() => {
    let filtered = [...allRecords];

    // 日期篩選
    if (filters.dateFrom && filters.dateTo) {
      // 使用字串比較避免時區問題
      const startDateStr = filters.dateFrom; // 格式: YYYY-MM-DD
      const endDateStr = filters.dateTo;     // 格式: YYYY-MM-DD

      filtered = filtered.filter(record => {
        if (!record.testTime) return false;

        // 從 testTime 取出日期部分 (YYYY-MM-DD)
        // 支援多種格式: "2025-09-20 06:35:09" 或 "2025-09-20T06:35:09" 或 "2025-09-20T06:35:09.000Z"
        let recordDateStr: string;

        if (record.testTime.includes('T')) {
          // ISO 8601 格式: "2025-09-20T06:35:09..." 或 "2025-09-19T22:35:09.000Z"
          recordDateStr = record.testTime.split('T')[0];
        } else if (record.testTime.includes(' ')) {
          // 空格分隔格式: "2025-09-20 06:35:09"
          recordDateStr = record.testTime.split(' ')[0];
        } else {
          // 只有日期: "2025-09-20"
          recordDateStr = record.testTime.slice(0, 10);
        }

        // 字串比較 (YYYY-MM-DD 格式可以直接比較)
        return recordDateStr >= startDateStr && recordDateStr <= endDateStr;
      });
    }

    // 結果篩選
    if (filters.result && filters.result !== 'all') {
      filtered = filtered.filter(record => record.result.toLowerCase() === filters.result?.toLowerCase());
    }

    // 序號篩選
    if (filters.serialNumber && filters.serialNumber.trim() !== '') {
      filtered = filtered.filter(record => record.serialNumber.toLowerCase().includes(filters.serialNumber!.toLowerCase()));
    }

    // 工單篩選
    if (filters.workOrder && filters.workOrder.trim() !== '') {
      filtered = filtered.filter(record => record.workOrder.toLowerCase().includes(filters.workOrder!.toLowerCase()));
    }

    // 站別篩選
    if (filters.station && filters.station.trim() !== '') {
      filtered = filtered.filter(record => record.station === filters.station);
    }

    // 機種篩選
    if (filters.model && filters.model.trim() !== '') {
      filtered = filtered.filter(record => record.model === filters.model);
    }

    return filtered;
  }, [allRecords, filters]);

  // 計算日期範圍和間隔文字
  const dateRangeInfo = useMemo(() => {
    if (filters.dateFrom && filters.dateTo) {
      const startDate = new Date(filters.dateFrom);
      const endDate = new Date(filters.dateTo);
      const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      const formatDate = (date: Date) => date.toLocaleDateString('zh-TW', { month: '2-digit', day: '2-digit' });
      const intervalText = diffDays === 1
        ? `${formatDate(startDate)}`
        : `${formatDate(startDate)} - ${formatDate(endDate)} (${diffDays} ${t('days')})`;
      return { startDate, endDate, intervalText, diffDays };
    }
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 6);
    return { startDate, endDate, intervalText: t('last.7.days'), diffDays: 7 };
  }, [filters.dateFrom, filters.dateTo, t]);

  // --- 所有統計資料計算 ---
  const stats = useMemo(() => calculateKPI(filteredData, filters.station), [filteredData, filters.station]);
  const detailedStationStats = useMemo(() => calculateStationStats(filteredData, configuredStations), [filteredData, configuredStations]);
  const modelStats = useMemo(() => calculateModelStats(filteredData, configuredModels), [filteredData, configuredModels]);
  const failureReasons = useMemo(() => calculateFailureReasons(filteredData), [filteredData]);
  const retestStats = useMemo(() => calculateRetestStats(filteredData), [filteredData]);
  const retestRecords = useMemo(() => calculateRetestRecords(filteredData), [filteredData]);
  const dailySeriesData = useMemo(() => calculateDailyStats(filteredData, dateRangeInfo), [filteredData, dateRangeInfo]);
  const dailyStationData = useMemo(() => calculateDailyStationStats(filteredData, dateRangeInfo, configuredStations), [filteredData, dateRangeInfo, configuredStations]);
  const dailyStationPassRates = useMemo(() => calculateDailyStationPassRates(filteredData, dateRangeInfo, configuredStations), [filteredData, dateRangeInfo, configuredStations]);

  // 圖表數據
  const chartData = useMemo(() => {
    const pieData = [
      { id: 0, value: stats.passed, label: 'PASS', color: '#4caf50' },
      { id: 1, value: stats.failed, label: 'FAIL', color: '#f44336' },
    ];

    const barData = detailedStationStats.map(stat => ({
        station: stat.station,
        pass: stat.passed,
        fail: stat.failed,
    })).sort((a, b) => {
        const aIsConfigured = configuredStations.includes(a.station);
        const bIsConfigured = configuredStations.includes(b.station);
        if (aIsConfigured && !bIsConfigured) return -1;
        if (!aIsConfigured && bIsConfigured) return 1;
        return a.station.localeCompare(b.station);
    });

    return { pie: pieData, bar: barData };
  }, [stats, detailedStationStats, configuredStations]);


  return {
    // Data
    filteredData,
    retestRecords,
    detailedStationStats,
    modelStats,
    failureReasons,
    retestStats,
    stats,
    dailySeriesData,
    dailyStationData,
    dailyStationPassRates,
    chartData,
    dateRangeInfo,
    // Configuration
    configuredStations,
    configuredModels,
  };
}