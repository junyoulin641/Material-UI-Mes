import { useState, useEffect, useMemo } from 'react';
import { getMESDatabase, TestRecord } from '../../../utils/MESDatabase';
import { SimpleFilterOptions } from '../components/SimpleQuickFilters';
import {
  calculateKPI,
  calculateStationStats,
  calculateModelStats,
  calculateDailyStats,
  calculateRetestRecords,
  calculateFailureReasons,
  calculateRetestStats,
} from '../utils/calculations';

/**
 * 負責儀表板所有資料載入、篩選和計算的 Hook
 * @param filters - 從 UI 傳入的篩選條件物件
 */
export function useDashboardData(filters: SimpleFilterOptions) {
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
      const startDate = new Date(filters.dateFrom);
      const endDate = new Date(filters.dateTo);
      endDate.setHours(23, 59, 59, 999);

      filtered = filtered.filter(record => {
        const recordDate = new Date(record.testTime);
        return recordDate >= startDate && recordDate <= endDate;
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
      const intervalText = diffDays === 1 ? `${formatDate(startDate)}` : `${formatDate(startDate)} - ${formatDate(endDate)} (${diffDays}天)`;
      return { startDate, endDate, intervalText, diffDays };
    }
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 6);
    return { startDate, endDate, intervalText: '最近 7 天', diffDays: 7 };
  }, [filters.dateFrom, filters.dateTo]);

  // --- 所有統計資料計算 ---
  const stats = useMemo(() => calculateKPI(filteredData), [filteredData]);
  const detailedStationStats = useMemo(() => calculateStationStats(filteredData, configuredStations), [filteredData, configuredStations]);
  const modelStats = useMemo(() => calculateModelStats(filteredData, configuredModels), [filteredData, configuredModels]);
  const failureReasons = useMemo(() => calculateFailureReasons(filteredData), [filteredData]);
  const retestStats = useMemo(() => calculateRetestStats(filteredData), [filteredData]);
  const retestRecords = useMemo(() => calculateRetestRecords(filteredData), [filteredData]);
  const dailySeriesData = useMemo(() => calculateDailyStats(filteredData, dateRangeInfo), [filteredData, dateRangeInfo]);

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
    chartData,
    dateRangeInfo,
  };
}