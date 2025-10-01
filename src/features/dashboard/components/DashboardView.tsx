import * as React from 'react';
import { useState, useMemo, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import LinearProgress from '@mui/material/LinearProgress';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import HomeIcon from '@mui/icons-material/Home';
import InfoIcon from '@mui/icons-material/Info';
import StatCard, { StatCardProps } from './StatCard';
import SimpleQuickFilters, { SimpleFilterOptions } from './SimpleQuickFilters';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import VisibilityIcon from '@mui/icons-material/Visibility';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AssessmentIcon from '@mui/icons-material/Assessment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import MemoryIcon from '@mui/icons-material/Memory';
import { PieChart } from '@mui/x-charts/PieChart';
import { BarChart } from '@mui/x-charts/BarChart';
import { LineChart } from '@mui/x-charts/LineChart';
import { useLanguage } from '../../../contexts/LanguageContext';
import { getMESDatabase } from '../../../utils/MESDatabase';
import { useNavigation } from '../../common/components/AppRouter';

// 從 IndexedDB 載入實際測試數據
const loadRealTestData = async () => {
  try {
    // 優先從 IndexedDB 載入
    const db = await getMESDatabase();
    const records = await db.getAllTestRecords();

    if (records.length > 0) {
      console.log(`儀表板從 IndexedDB 載入 ${records.length} 筆記錄`);
      return records.map((record, index) => ({
        id: record.id || index + 1,
        serialNumber: record.serialNumber || '',
        workOrder: record.workOrder || '',
        station: record.station || '',
        model: record.model || '',
        result: record.result || 'FAIL',
        testTime: record.testTime || new Date().toISOString(),
        tester: record.tester || 'Unknown',
        partNumber: record.partNumber || '',
        items: record.items || [],
      }));
    }
  } catch (error) {
    console.error('從 IndexedDB 載入資料失敗，嘗試 localStorage:', error);
  }

  // 備援：從 localStorage 載入
  try {
    const storedData = localStorage.getItem('mesTestData');
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      console.log(`儀表板從 localStorage 載入 ${parsedData.length} 筆記錄`);
      return parsedData.map((record: any, index: number) => ({
        id: index + 1,
        serialNumber: record.serialNumber || '',
        workOrder: record.workOrder || '',
        station: record.station || '',
        model: record.model || '',
        result: record.result || 'FAIL',
        testTime: record.testTime || new Date().toISOString(),
        tester: record.tester || 'Unknown',
        partNumber: record.partNumber || '',
        items: record.items || [],
      }));
    }
  } catch (error) {
    console.error('從 localStorage 載入資料時發生錯誤:', error);
  }

  return [];
};

interface CompleteMesDashboardProps {
  showAdvanced?: boolean;
}

export default function CompleteMesDashboard({ showAdvanced = true }: CompleteMesDashboardProps) {
  const { t } = useLanguage();
  const { setCurrentView } = useNavigation();
  const [dashboardFilters, setDashboardFilters] = useState<SimpleFilterOptions>({});
  const [refreshKey, setRefreshKey] = useState(0);
  const [testData, setTestData] = useState<any[]>([]);
  const [exportAnchorEl, setExportAnchorEl] = useState<null | HTMLElement>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedRetestRecord, setSelectedRetestRecord] = useState<any>(null);

  // 拖拽縮放狀態管理
  const [cardSizes, setCardSizes] = useState<Record<string, { width: number; height: number }>>({
    stationPerformance: { width: 50, height: 400 }, // 50% 寬度
    stationTestCount: { width: 50, height: 400 },
    stationStats: { width: 50, height: 400 },
    failureAnalysis: { width: 50, height: 400 },
    retestStats: { width: 50, height: 400 },
    recentRecords: { width: 50, height: 400 },
    modelStats: { width: 50, height: 400 }
  });
  const [dragState, setDragState] = useState<{
    isDragging: boolean;
    cardId: string;
    startX: number;
    startY: number;
    startWidth: number;
    startHeight: number;
  } | null>(null);

  // 載入測試數據
  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await loadRealTestData();
        setTestData(data);
        console.log(`儀表板資料載入完成: ${data.length} 筆記錄`);
      } catch (error) {
        console.error('載入儀表板資料失敗:', error);
        setTestData([]);
      }
    };

    loadData();
  }, [refreshKey]);

  // 監聽資料更新
  useEffect(() => {
    const handleDataUpdate = async () => {
      console.log('儀表板收到資料更新事件...');
      try {
        const data = await loadRealTestData();
        setTestData(data);
        console.log(`儀表板資料已更新: ${data.length} 筆記錄`);
      } catch (error) {
        console.error('儀表板資料更新失敗:', error);
      }
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'mesTestData') {
        handleDataUpdate();
      }
    };

    // 監聽事件
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('mesDataUpdated', handleDataUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('mesDataUpdated', handleDataUpdate);
    };
  }, []);

  // 從系統設定讀取站別配置
  const configuredStations = useMemo(() => {
    try {
      const saved = localStorage.getItem('mesStations');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  }, []);

  // 根據篩選條件過濾數據
  const filteredData = useMemo(() => {
    let filtered = [...testData];

    // 日期篩選 - 使用具體的日期範圍
    if (dashboardFilters.dateFrom && dashboardFilters.dateTo) {
      const startDate = new Date(dashboardFilters.dateFrom);
      const endDate = new Date(dashboardFilters.dateTo);
      endDate.setHours(23, 59, 59, 999); // 包含結束日期當天

      filtered = filtered.filter(record => {
        const recordDate = new Date(record.testTime);
        return recordDate >= startDate && recordDate <= endDate;
      });
    }

    // 結果篩選
    if (dashboardFilters.result && dashboardFilters.result !== 'all') {
      filtered = filtered.filter(record =>
        record.result.toLowerCase() === dashboardFilters.result?.toLowerCase()
      );
    }

    // 序號篩選
    if (dashboardFilters.serialNumber && dashboardFilters.serialNumber.trim() !== '') {
      filtered = filtered.filter(record =>
        record.serialNumber.toLowerCase().includes(dashboardFilters.serialNumber!.toLowerCase())
      );
    }

    // 工單篩選
    if (dashboardFilters.workOrder && dashboardFilters.workOrder.trim() !== '') {
      filtered = filtered.filter(record =>
        record.workOrder.toLowerCase().includes(dashboardFilters.workOrder!.toLowerCase())
      );
    }

    // 站別篩選 (空字串代表全部)
    if (dashboardFilters.station && dashboardFilters.station.trim() !== '') {
      filtered = filtered.filter(record => record.station === dashboardFilters.station);
    }

    // 機種篩選 (空字串代表全部)
    if (dashboardFilters.model && dashboardFilters.model.trim() !== '') {
      filtered = filtered.filter(record => record.model === dashboardFilters.model);
    }

    return filtered;
  }, [testData, dashboardFilters]);

  // 計算複測記錄（相同序號的多次測試，且結果為 FAIL）
  const retestRecords = useMemo(() => {
    // 只篩選 FAIL 的記錄
    const failedRecords = filteredData.filter(record => record.result === 'FAIL');

    // 按序號分組
    const serialNumberGroups = new Map<string, any[]>();

    failedRecords.forEach(record => {
      const serial = record.serialNumber;
      if (!serialNumberGroups.has(serial)) {
        serialNumberGroups.set(serial, []);
      }
      serialNumberGroups.get(serial)!.push(record);
    });

    // 處理每個序號群組
    const retestData: any[] = [];
    serialNumberGroups.forEach((records, serialNumber) => {
      // 按時間排序記錄
      const sortedRecords = records.sort((a, b) =>
        new Date(a.testTime).getTime() - new Date(b.testTime).getTime()
      );

      const firstRecord = sortedRecords[0]; // 最早的記錄
      const lastRecord = sortedRecords[sortedRecords.length - 1]; // 最晚的記錄

      // 收集所有 FAIL 測項
      const allFailedItems: string[] = [];

      sortedRecords.forEach(record => {
        if (record.items && Array.isArray(record.items)) {
          const failedItems = record.items.filter((item: any) => item.result === 'FAIL');
          failedItems.forEach((item: any) => {
            if (item.name) {
              allFailedItems.push(item.name);
            }
          });
        }
      });

      // 去重並排序
      const uniqueFailedItems = [...new Set(allFailedItems)].sort();

      // 生成失敗原因顯示
      const failureReason = uniqueFailedItems.length > 0
        ? uniqueFailedItems.join(', ')
        : t('test.failed');

      retestData.push({
        ...lastRecord,
        retestCount: records.length,
        firstTestTime: firstRecord.testTime,
        lastTestTime: lastRecord.testTime,
        failureReason: failureReason,
        allRecords: sortedRecords, // 保存所有記錄
        failedItems: uniqueFailedItems
      });
    });

    // 按複測次數排序（次數多的在前）
    return retestData.sort((a, b) => b.retestCount - a.retestCount);
  }, [filteredData, t]);

  // 計算站別統計資料 (用於詳細統計表格)
  const detailedStationStats = useMemo(() => {
    const stats: Record<string, { total: number; failed: number; passed: number }> = {};

    // 初始化所有配置的站別
    configuredStations.forEach(station => {
      stats[station] = { total: 0, failed: 0, passed: 0 };
    });

    // 統計實際資料
    filteredData.forEach(record => {
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

    return stats;
  }, [configuredStations, filteredData]);

  // 計算機種統計資料
  const modelStats = useMemo(() => {
    try {
      const saved = localStorage.getItem('mesModels');
      const configuredModels = saved ? JSON.parse(saved) : [];
      const stats: Record<string, { total: number; passed: number; passRate: number }> = {};

      // 初始化所有配置的機種
      configuredModels.forEach((model: string) => {
        stats[model] = { total: 0, passed: 0, passRate: 0 };
      });

      // 統計實際資料
      filteredData.forEach(record => {
        const model = record.model || 'Unknown';
        if (!stats[model]) {
          stats[model] = { total: 0, passed: 0, passRate: 0 };
        }
        stats[model].total++;
        if (record.result === 'PASS') {
          stats[model].passed++;
        }
      });

      // 計算通過率
      Object.keys(stats).forEach(model => {
        const data = stats[model];
        data.passRate = data.total > 0 ? Number(((data.passed / data.total) * 100).toFixed(1)) : 0;
      });

      return stats;
    } catch {
      return {};
    }
  }, [filteredData]);

  // 計算失敗原因分析
  const failureReasons = useMemo(() => {
    const testItemStats = new Map<string, { total: number, failed: number }>();

    // 統計每個測項的總數和失敗數
    filteredData.forEach(record => {
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
  }, [filteredData]);

  // 計算復測統計數據
  const retestStats = useMemo(() => {
    const retestData = new Map<string, { originalCount: number, retestCount: number, finalPassCount: number }>();

    // 根據序號分組，找出同一序號的多次測試記錄
    const serialGroups = new Map<string, any[]>();
    filteredData.forEach(record => {
      const serial = record.serialNumber;
      if (!serialGroups.has(serial)) {
        serialGroups.set(serial, []);
      }
      serialGroups.get(serial)!.push(record);
    });

    // 分析每個序號的測試情況
    serialGroups.forEach((records, serial) => {
      if (records.length > 1) {
        // 按時間排序
        records.sort((a, b) => new Date(a.testTime).getTime() - new Date(b.testTime).getTime());

        const firstTest = records[0];
        const station = firstTest.station || 'Unknown';

        if (!retestData.has(station)) {
          retestData.set(station, { originalCount: 0, retestCount: 0, finalPassCount: 0 });
        }

        const stationData = retestData.get(station)!;
        stationData.originalCount++;

        // 如果有多次測試，算作復測
        if (records.length > 1) {
          stationData.retestCount++;

          // 檢查最終結果是否通過
          const lastTest = records[records.length - 1];
          if (lastTest.result === 'PASS') {
            stationData.finalPassCount++;
          }
        }
      } else {
        // 單次測試
        const record = records[0];
        const station = record.station || 'Unknown';

        if (!retestData.has(station)) {
          retestData.set(station, { originalCount: 0, retestCount: 0, finalPassCount: 0 });
        }

        retestData.get(station)!.originalCount++;
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
  }, [filteredData]);

  // 計算統計數據
  const stats = useMemo(() => {
    const total = filteredData.length;
    const passed = filteredData.filter(r => r.result === 'PASS').length;
    const failed = total - passed;
    const passRate = total > 0 ? ((passed / total) * 100) : 0;

    // 模擬設備統計
    const deviceCount = 50; // 模擬設備總數
    const passedDeviceCount = Math.floor(deviceCount * (passRate / 100));
    const productionYieldRate = total > 0 ? ((passedDeviceCount / deviceCount) * 100) : 0;

    // 模擬複測統計
    const retestCount = Math.floor(failed * 0.3); // 假設30%的失敗需要複測

    // 計算趨勢
    const previousRate = 85; // 假設的前期數據
    const trend = passRate > previousRate ? 'up' : passRate < previousRate ? 'down' : 'neutral';
    const trendValue = `${Math.abs(passRate - previousRate).toFixed(1)}%`;

    return {
      total,
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
  }, [filteredData]);

  // 計算日期範圍和間隔文字
  const dateRangeInfo = useMemo(() => {
    if (dashboardFilters.dateFrom && dashboardFilters.dateTo) {
      const startDate = new Date(dashboardFilters.dateFrom);
      const endDate = new Date(dashboardFilters.dateTo);

      // 計算日期間隔
      const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 包含結束日

      // 格式化日期顯示
      const formatDate = (date: Date) => {
        return date.toLocaleDateString('zh-TW', {
          month: '2-digit',
          day: '2-digit'
        });
      };

      const intervalText = diffDays === 1
        ? `${formatDate(startDate)}`
        : `${formatDate(startDate)} - ${formatDate(endDate)} (${diffDays}${t('days.suffix')})`;

      return {
        startDate,
        endDate,
        intervalText,
        diffDays
      };
    }

    // 預設為最近7天
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 6);

    return {
      startDate,
      endDate,
      intervalText: t('last.7.days'),
      diffDays: 7
    };
  }, [dashboardFilters.dateFrom, dashboardFilters.dateTo, t]);

  // 計算每日時間序列數據
  const dailySeriesData = useMemo(() => {
    const { startDate, endDate, diffDays } = dateRangeInfo;

    // 初始化每日統計
    const dailyStats = [];
    for (let i = 0; i < diffDays; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      const dateStr = currentDate.toISOString().slice(0, 10);

      dailyStats.push({
        date: dateStr,
        total: 0,
        passed: 0,
        failed: 0,
        devices: new Set()
      });
    }

    // 統計實際資料
    filteredData.forEach(record => {
      const testDate = new Date(record.testTime).toISOString().slice(0, 10);
      const dayIndex = dailyStats.findIndex(day => day.date === testDate);

      if (dayIndex !== -1) {
        dailyStats[dayIndex].total++;
        if (record.result === 'PASS') {
          dailyStats[dayIndex].passed++;
        } else {
          dailyStats[dayIndex].failed++;
        }
        // 統計不同設備
        if (record.serialNumber) {
          dailyStats[dayIndex].devices.add(record.serialNumber);
        }
      }
    });

    return {
      totalTests: dailyStats.map(day => day.total),
      passRates: dailyStats.map(day =>
        day.total > 0 ? Math.round((day.passed / day.total) * 100) : 0
      ),
      deviceCounts: dailyStats.map(day => day.devices.size),
      retestCounts: dailyStats.map(day => Math.floor(day.failed * 0.3)) // 模擬復測數據
    };
  }, [filteredData, dateRangeInfo]);

  // MES 統計卡片數據
  const data: StatCardProps[] = [
    {
      title: t('total.test.count'),
      value: stats.total.toLocaleString(),
      subtitle: `${t('device.count')}: ${stats.deviceCount}`,
      interval: dateRangeInfo.intervalText,
      trend: "up",
      icon: <AssessmentIcon />,
      color: 'primary',
      data: dailySeriesData.totalTests,
      dateRange: {
        startDate: dateRangeInfo.startDate,
        endDate: dateRangeInfo.endDate
      },
    },
    {
      title: t('test.pass.rate'),
      value: stats.passRateText,
      subtitle: `${t('pass')}: ${stats.passed} / ${t('fail')}: ${stats.failed}`,
      interval: dateRangeInfo.intervalText,
      trend: stats.trend as "up" | "down" | "neutral",
      trendValue: stats.trendValue,
      icon: <CheckCircleIcon />,
      color: 'success',
      data: dailySeriesData.passRates,
      dateRange: {
        startDate: dateRangeInfo.startDate,
        endDate: dateRangeInfo.endDate
      },
    },
    {
      title: t('production.yield.rate'),
      value: stats.productionYieldRateText,
      subtitle: `${t('completed')}: ${stats.passedDeviceCount} / ${t('total')}: ${stats.deviceCount}`,
      interval: dateRangeInfo.intervalText,
      trend: "up",
      icon: <MemoryIcon />,
      color: 'info',
      data: dailySeriesData.deviceCounts,
      dateRange: {
        startDate: dateRangeInfo.startDate,
        endDate: dateRangeInfo.endDate
      },
    },
    {
      title: t('retest.count'),
      value: stats.retestCount.toLocaleString(),
      interval: dateRangeInfo.intervalText,
      subtitle: `${t('retest.count')}: ${stats.retestCount.toLocaleString()}`,
      trend: "down",
      icon: <ErrorIcon />,
      color: 'warning',
      data: dailySeriesData.retestCounts,
      dateRange: {
        startDate: dateRangeInfo.startDate,
        endDate: dateRangeInfo.endDate
      },
    },
  ];

  // 圖表數據
  const chartData = useMemo(() => {
    // 測試結果分佈 (圓餅圖)
    const pieData = [
      { id: 0, value: stats.passed, label: 'PASS', color: '#4caf50' },
      { id: 1, value: stats.failed, label: 'FAIL', color: '#f44336' },
    ];

    // 站別測試數量 (長條圖) - 使用系統設定的站別，確保一致性
    const stationStats = new Map();

    // 初始化所有配置的站別，確保它們都出現在圖表中
    configuredStations.forEach(station => {
      stationStats.set(station, { pass: 0, fail: 0 });
    });

    // 統計實際資料
    filteredData.forEach(record => {
      const station = record.station || 'Unknown';
      const current = stationStats.get(station) || { pass: 0, fail: 0 };
      if (record.result === 'PASS') {
        current.pass++;
      } else {
        current.fail++;
      }
      stationStats.set(station, current);
    });

    const barData = Array.from(stationStats.entries()).map(([station, data]) => ({
      station,
      tests: data.pass + data.fail,
      pass: data.pass,
      fail: data.fail
    })).sort((a, b) => {
      // 優先顯示配置的站別，然後是其他站別
      const aIsConfigured = configuredStations.includes(a.station);
      const bIsConfigured = configuredStations.includes(b.station);
      if (aIsConfigured && !bIsConfigured) return -1;
      if (!aIsConfigured && bIsConfigured) return 1;
      return a.station.localeCompare(b.station);
    });

    // 測試趨勢 (折線圖) - 按天統計選定時間範圍
    const dateRange = [];
    const dailyStats = new Map();

    // 初始化選定時間範圍內的所有日期
    for (let i = 0; i < dateRangeInfo.diffDays; i++) {
      const date = new Date(dateRangeInfo.startDate);
      date.setDate(dateRangeInfo.startDate.getDate() + i);
      const dateStr = date.toISOString().slice(0, 10);
      dateRange.push(dateStr);
      dailyStats.set(dateStr, { total: 0, pass: 0, fail: 0 });
    }

    // 統計實際資料
    filteredData.forEach(record => {
      const testDate = new Date(record.testTime).toISOString().slice(0, 10);
      if (dailyStats.has(testDate)) {
        const current = dailyStats.get(testDate);
        current.total++;
        if (record.result === 'PASS') {
          current.pass++;
        } else {
          current.fail++;
        }
      }
    });

    const lineData = dateRange.map(date => {
      const stats = dailyStats.get(date);
      return {
        date: new Date(date).toLocaleDateString('zh-TW', { month: 'short', day: 'numeric' }),
        total: stats.total,
        pass: stats.pass,
        fail: stats.fail,
        passRate: stats.total > 0 ? (stats.pass / stats.total * 100) : 0
      };
    });

    return {
      pie: pieData,
      bar: barData,
      line: {
        months: lineData.map(d => d.date),
        actual: lineData.map(d => d.total),
        targets: lineData.map(d => d.passRate),
        projected: lineData.map(d => d.pass)
      }
    };
  }, [filteredData, stats, dateRangeInfo]);


  const handleDashboardFilterChange = (filters: SimpleFilterOptions) => {
    setDashboardFilters(filters);
  };


  const handleExport = () => {
    // 匯出CSV功能
    const csvContent = [
      [t('serial.number'), t('work.order'), t('station'), t('model'), t('result'), t('test.time'), t('tester')].join(','),
      ...filteredData.map(record => [
        record.serialNumber,
        record.workOrder,
        record.station,
        record.model,
        record.result,
        record.testTime,
        record.tester
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `MES_Dashboard_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  // 匯出 JSON 功能
  const handleExportJSON = () => {
    const blob = new Blob([JSON.stringify(filteredData, null, 2)], { type: 'application/json;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `MES_Dashboard_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
  };

  const openExportMenu = (e: React.MouseEvent<HTMLButtonElement>) => {
    setExportAnchorEl(e.currentTarget);
  };

  const closeExportMenu = () => setExportAnchorEl(null);

  const handleExportFormat = (format: 'csv' | 'json') => {
    if (format === 'csv') handleExport();
    if (format === 'json') handleExportJSON();
    closeExportMenu();
  };

  // 拖拽縮放處理函數
  const handleResizeStart = (e: React.MouseEvent, cardId: string) => {
    e.preventDefault();
    e.stopPropagation();

    const currentSize = cardSizes[cardId];
    setDragState({
      isDragging: true,
      cardId,
      startX: e.clientX,
      startY: e.clientY,
      startWidth: currentSize.width,
      startHeight: currentSize.height
    });
  };

  // 監聽全域滑鼠事件
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragState?.isDragging) return;

      const deltaX = e.clientX - dragState.startX;
      const deltaY = e.clientY - dragState.startY;

      // 計算新的寬度和高度
      const containerWidth = window.innerWidth;
      const deltaWidthPercent = (deltaX / containerWidth) * 100;

      let newWidth = Math.max(25, Math.min(100, dragState.startWidth + deltaWidthPercent)); // 最小25%，最大100%
      let newHeight = Math.max(300, dragState.startHeight + deltaY); // 最小高度300px

      setCardSizes(prev => ({
        ...prev,
        [dragState.cardId]: {
          width: newWidth,
          height: newHeight
        }
      }));
    };

    const handleMouseUp = () => {
      setDragState(null);
    };

    if (dragState?.isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [dragState]);

  return (
    <Box sx={{
      width: "100%",
      maxWidth: { sm: "100%", md: "1700px" },
      pl: { xs: 2, sm: 3, md: 4 }, // 增加左側邊距
      pr: { xs: 2, sm: 3 },
      py: 3
    }}>
      {/* 頁面標題區域 */}
      <Box sx={{ mb: 3 }}>
        {/* 麵包屑導航 */}
        <Breadcrumbs
          separator={<NavigateNextIcon fontSize="small" />}
          sx={{ mb: 2 }}
        >
          <Link
            underline="hover"
            sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary', cursor: 'pointer' }}
            onClick={() => setCurrentView('dashboard')}
          >
            <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
            {t('home')}
          </Link>
          <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
            {t('dashboard')}
          </Typography>
        </Breadcrumbs>

        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600, mb: 0 }}>
          {t('mes.dashboard.title')}
        </Typography>
      </Box>


      {/* 快速篩選卡片 */}
      <Card sx={{ mb: 3, border: 1, borderColor: 'divider', boxShadow: 1 }}>
        <CardContent>
          <SimpleQuickFilters onFilterChange={handleDashboardFilterChange} />
        </CardContent>
      </Card>

      {/* 工具列：匯出 / 重新整理 / 檢視全部 */}
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Button
            variant="contained"
            startIcon={<FileDownloadIcon />}
            onClick={openExportMenu}
          >
            {t('export')}
          </Button>
          <Menu
            anchorEl={exportAnchorEl}
            open={Boolean(exportAnchorEl)}
            onClose={closeExportMenu}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <MenuItem onClick={() => handleExportFormat('csv')}>{t('csv.export')}</MenuItem>
            <MenuItem onClick={() => handleExportFormat('json')}>{t('json.export')}</MenuItem>
          </Menu>
        </Stack>
      </Box>

      {/* KPI 統計區域 */}
      <Box sx={{ mb: 3 }}>
        <Grid container spacing={3}>
      {data.map((card, index) => (
        <Grid key={index} size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard {...card} />
        </Grid>
      ))}
        </Grid>
      </Box>

      {/* 圖表網格區域 - 動態佈局 */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* 各站點測試表現統計 */}
        <Grid size={{ xs: 12, md: cardSizes.stationPerformance.width / 100 * 12 }}>
          <Card sx={{
            border: 1,
            borderColor: 'divider',
            boxShadow: 1,
            height: cardSizes.stationPerformance.height,
            position: 'relative',
            transition: dragState?.cardId === 'stationPerformance' ? 'none' : 'all 0.2s ease',
            '&:hover .resize-handle': { opacity: 1 }
          }}>
            <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {t('station.performance.stats')}
                </Typography>
                <IconButton size="small" sx={{ opacity: 0.5 }}>
                  <VisibilityIcon fontSize="small" />
                </IconButton>
              </Box>
              <Box sx={{ flex: 1, minHeight: 0 }}>
                <BarChart
                  xAxis={[{ scaleType: 'band', data: chartData.bar.map(item => item.station) }]}
                  series={[
                    {
                      data: chartData.bar.map(item => item.pass),
                      label: 'PASS',
                      color: '#4caf50',
                      stack: 'total'
                    },
                    {
                      data: chartData.bar.map(item => item.fail),
                      label: 'FAIL',
                      color: '#f44336',
                      stack: 'total'
                    },
                  ]}
                  height={320}
                  margin={{ left: 60, right: 20, top: 20, bottom: 60 }}
                  slotProps={{
                    legend: {
                      direction: 'row',
                      position: { vertical: 'top', horizontal: 'right' },
                    },
                  }}
                />
              </Box>
            </CardContent>
            {/* 拖拽手柄 */}
            <Box
              className="resize-handle"
              onMouseDown={(e) => handleResizeStart(e, 'stationPerformance')}
              sx={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                width: 20,
                height: 20,
                cursor: 'se-resize',
                opacity: 0,
                transition: 'opacity 0.2s',
                background: 'linear-gradient(-45deg, transparent 30%, #ccc 30%, #ccc 40%, transparent 40%, transparent 60%, #ccc 60%, #ccc 70%, transparent 70%)',
                '&:hover': { opacity: 1 }
              }}
            />
          </Card>
        </Grid>

        {/* 站別測試數量統計 */}
        <Grid size={{ xs: 12, md: cardSizes.stationTestCount.width / 100 * 12 }}>
          <Card sx={{
            border: 1,
            borderColor: 'divider',
            boxShadow: 1,
            height: cardSizes.stationTestCount.height,
            position: 'relative',
            transition: dragState?.cardId === 'stationTestCount' ? 'none' : 'all 0.2s ease',
            '&:hover .resize-handle': { opacity: 1 }
          }}>
            <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {t('station.test.count')}
                </Typography>
                <IconButton size="small" sx={{ opacity: 0.5 }}>
                  <VisibilityIcon fontSize="small" />
                </IconButton>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Daily station test count by test type
              </Typography>
              <Box sx={{ flex: 1, minHeight: 0 }}>
                <BarChart
                  xAxis={[{
                    scaleType: 'band',
                    data: dailySeriesData.totalTests.map((_, index) => {
                      const date = new Date(dateRangeInfo.startDate);
                      date.setDate(date.getDate() + index);
                      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                    })
                  }]}
                  yAxis={[{
                    label: '',
                    max: Math.max(...dailySeriesData.totalTests) * 1.2
                  }]}
                  series={[
                    {
                      data: dailySeriesData.totalTests.map(total => Math.floor(total * 0.4)),
                      label: 'ST1.large',
                      color: '#6366f1',
                      stack: 'total'
                    },
                    {
                      data: dailySeriesData.totalTests.map(total => Math.floor(total * 0.25)),
                      label: 'ST1.xlarge',
                      color: '#ec4899',
                      stack: 'total'
                    },
                    {
                      data: dailySeriesData.totalTests.map(total => Math.floor(total * 0.25)),
                      label: 'ST1.medium',
                      color: '#10b981',
                      stack: 'total'
                    },
                    {
                      data: dailySeriesData.totalTests.map(total => Math.floor(total * 0.1)),
                      label: 'ST1.small',
                      color: '#8b5cf6',
                      stack: 'total'
                    },
                  ]}
                  height={300}
                  margin={{ left: 50, right: 20, top: 20, bottom: 60 }}
                  slotProps={{
                    legend: {
                      direction: 'row',
                      position: { vertical: 'bottom', horizontal: 'left' },
                      itemMarkWidth: 12,
                      itemMarkHeight: 12,
                      markGap: 6,
                      itemGap: 16,
                      padding: 0,
                    },
                  }}
                />
              </Box>
            </CardContent>
            {/* 拖拽手柄 */}
            <Box
              className="resize-handle"
              onMouseDown={(e) => handleResizeStart(e, 'stationTestCount')}
              sx={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                width: 20,
                height: 20,
                cursor: 'se-resize',
                opacity: 0,
                transition: 'opacity 0.2s',
                background: 'linear-gradient(-45deg, transparent 30%, #ccc 30%, #ccc 40%, transparent 40%, transparent 60%, #ccc 60%, #ccc 70%, transparent 70%)',
                '&:hover': { opacity: 1 }
              }}
            />
          </Card>
        </Grid>

        {/* 站別表現統計 */}
        <Grid size={{ xs: 12, md: cardSizes.stationStats.width / 100 * 12 }}>
          <Card sx={{
            border: 1,
            borderColor: 'divider',
            boxShadow: 1,
            height: cardSizes.stationStats.height,
            position: 'relative',
            transition: dragState?.cardId === 'stationStats' ? 'none' : 'all 0.2s ease',
            '&:hover .resize-handle': { opacity: 1 }
          }}>
            <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {t('station.performance.table')}
                </Typography>
                <IconButton size="small" sx={{ opacity: 0.5 }}>
                  <VisibilityIcon fontSize="small" />
                </IconButton>
              </Box>
              <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
                <TableContainer sx={{ height: '100%' }}>
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell>{t('station')}</TableCell>
                        <TableCell align="center">{t('total')}</TableCell>
                        <TableCell align="center">{t('pass.rate')}</TableCell>
                        <TableCell align="center">{t('status')}</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {Object.entries(detailedStationStats).map(([station, stationData]) => {
                        const passRate = stationData.total > 0 ?
                          ((stationData.total - stationData.failed) / stationData.total * 100) : 0;
                        const status = passRate >= 95 ? 'excellent' : passRate >= 85 ? 'good' : passRate >= 70 ? 'warning' : 'critical';
                        const statusText = status === 'excellent' ? t('excellent') : status === 'good' ? t('good') : status === 'warning' ? t('warning') : t('critical');
                        const statusColor = status === 'excellent' ? 'success' : status === 'good' ? 'info' : status === 'warning' ? 'warning' : 'error';

                        return (
                          <TableRow key={station} hover>
                            <TableCell sx={{ fontFamily: 'monospace' }}>
                              {station}
                            </TableCell>
                            <TableCell align="center">
                              {stationData.total}
                            </TableCell>
                            <TableCell align="center">
                              <Box>
                                <Typography variant="body2" sx={{ mb: 0.5 }}>
                                  {passRate.toFixed(1)}%
                                </Typography>
                                <LinearProgress
                                  variant="determinate"
                                  value={passRate}
                                  color={statusColor as any}
                                  sx={{ height: 6, borderRadius: 3 }}
                                />
                              </Box>
                            </TableCell>
                            <TableCell align="center">
                              <Chip
                                label={statusText}
                                size="small"
                                color={statusColor as any}
                                variant="outlined"
                              />
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            </CardContent>
            {/* 拖拽手柄 */}
            <Box
              className="resize-handle"
              onMouseDown={(e) => handleResizeStart(e, 'stationStats')}
              sx={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                width: 20,
                height: 20,
                cursor: 'se-resize',
                opacity: 0,
                transition: 'opacity 0.2s',
                background: 'linear-gradient(-45deg, transparent 30%, #ccc 30%, #ccc 40%, transparent 40%, transparent 60%, #ccc 60%, #ccc 70%, transparent 70%)',
                '&:hover': { opacity: 1 }
              }}
            />
          </Card>
        </Grid>
                {/* 機種測試統計 */}
                <Grid size={{ xs: 12, md: cardSizes.modelStats.width / 100 * 12 }}>
          <Card sx={{
            border: 1,
            borderColor: 'divider',
            boxShadow: 1,
            height: cardSizes.modelStats.height,
            position: 'relative',
            transition: dragState?.cardId === 'modelStats' ? 'none' : 'all 0.2s ease',
            '&:hover .resize-handle': { opacity: 1 }
          }}>
            <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {t('model.test.statistics')}
                </Typography>
                <IconButton size="small" sx={{ opacity: 0.5 }}>
                  <MemoryIcon fontSize="small" />
                </IconButton>
              </Box>
              <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
                <TableContainer sx={{ height: '100%' }}>
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell>{t('model')}</TableCell>
                        <TableCell align="center">{t('test.count')}</TableCell>
                        <TableCell align="center">{t('pass.count')}</TableCell>
                        <TableCell align="center">{t('pass.rate')}</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {Object.entries(modelStats).map(([model, data]) => (
                        <TableRow key={model} hover>
                          <TableCell>
                            <Chip
                              label={model}
                              size="small"
                              color="primary"
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell align="center">
                            {data.total}
                          </TableCell>
                          <TableCell align="center">
                            {data.passed}
                          </TableCell>
                          <TableCell align="center">
                            <Typography
                              variant="body2"
                              color={data.passRate >= 90 ? 'success.main' : data.passRate >= 80 ? 'warning.main' : 'error.main'}
                              sx={{ fontWeight: 600 }}
                            >
                              {data.passRate}%
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            </CardContent>
            {/* 拖拽手柄 */}
            <Box
              className="resize-handle"
              onMouseDown={(e) => handleResizeStart(e, 'modelStats')}
              sx={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                width: 20,
                height: 20,
                cursor: 'se-resize',
                opacity: 0,
                transition: 'opacity 0.2s',
                background: 'linear-gradient(-45deg, transparent 30%, #ccc 30%, #ccc 40%, transparent 40%, transparent 60%, #ccc 60%, #ccc 70%, transparent 70%)',
                '&:hover': { opacity: 1 }
              }}
            />
          </Card>
        </Grid>
      </Grid>

      {/* 第二行統計卡片區域 */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* 失敗原因分析 */}
        <Grid size={{ xs: 12, md: cardSizes.failureAnalysis.width / 100 * 12 }}>
          <Card sx={{
            border: 1,
            borderColor: 'divider',
            boxShadow: 1,
            height: cardSizes.failureAnalysis.height,
            position: 'relative',
            transition: dragState?.cardId === 'failureAnalysis' ? 'none' : 'all 0.2s ease',
            '&:hover .resize-handle': { opacity: 1 }
          }}>
            <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {t('failure.analysis')}
                </Typography>
                <IconButton size="small" sx={{ opacity: 0.5 }}>
                  <ErrorIcon fontSize="small" />
                </IconButton>
              </Box>
              <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
                {failureReasons.length > 0 ? (
                  <TableContainer sx={{ height: '100%' }}>
                    <Table size="small" stickyHeader>
                      <TableHead>
                        <TableRow>
                          <TableCell>{t('test.item.name')}</TableCell>
                          <TableCell align="center">{t('failure.count')}</TableCell>
                          <TableCell align="center">{t('total.test.count')}</TableCell>
                          <TableCell align="center">{t('failure.rate')}</TableCell>
                          <TableCell>{t('distribution')}</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {failureReasons.slice(0, 5).map((reason, index) => (
                          <TableRow key={reason.reason} hover>
                            <TableCell>
                              <Box display="flex" alignItems="center" gap={1}>
                                <Typography variant="body2" sx={{ fontWeight: index < 3 ? 600 : 400 }}>
                                  #{index + 1}
                                </Typography>
                                <Typography variant="body2">
                                  {reason.reason}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell align="center">
                              <Chip
                                label={reason.count}
                                size="small"
                                color={index < 2 ? 'error' : 'default'}
                                variant="outlined"
                              />
                            </TableCell>
                            <TableCell align="center">
                              {reason.total}
                            </TableCell>
                            <TableCell align="center">
                              <Typography
                                variant="body2"
                                color={reason.failureRate >= 50 ? 'error.main' : reason.failureRate >= 20 ? 'warning.main' : 'text.primary'}
                                sx={{ fontWeight: 600 }}
                              >
                                {reason.failureRate}%
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <LinearProgress
                                variant="determinate"
                                value={Math.min(reason.failureRate, 100)}
                                color={reason.failureRate >= 50 ? 'error' : reason.failureRate >= 20 ? 'warning' : 'primary'}
                                sx={{ height: 6, borderRadius: 3 }}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Box display="flex" alignItems="center" justifyContent="center" height="100%">
                    <Typography variant="body2" color="text.secondary">
                      {t('no.failure.data')}
                    </Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
            {/* 拖拽手柄 */}
            <Box
              className="resize-handle"
              onMouseDown={(e) => handleResizeStart(e, 'failureAnalysis')}
              sx={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                width: 20,
                height: 20,
                cursor: 'se-resize',
                opacity: 0,
                transition: 'opacity 0.2s',
                background: 'linear-gradient(-45deg, transparent 30%, #ccc 30%, #ccc 40%, transparent 40%, transparent 60%, #ccc 60%, #ccc 70%, transparent 70%)',
                '&:hover': { opacity: 1 }
              }}
            />
          </Card>
        </Grid>
          {/* 復測統計 */}
          <Grid size={{ xs: 12, md: cardSizes.retestStats.width / 100 * 12 }}>
          <Card sx={{
            border: 1,
            borderColor: 'divider',
            boxShadow: 1,
            height: cardSizes.retestStats.height,
            position: 'relative',
            transition: dragState?.cardId === 'retestStats' ? 'none' : 'all 0.2s ease',
            '&:hover .resize-handle': { opacity: 1 }
          }}>
            <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {t('retest.statistics')}
                </Typography>
                <IconButton size="small" sx={{ opacity: 0.5 }}>
                  <TrendingUpIcon fontSize="small" />
                </IconButton>
              </Box>
              <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
                {retestStats.length > 0 ? (
                  <TableContainer sx={{ height: '100%' }}>
                    <Table size="small" stickyHeader>
                      <TableHead>
                        <TableRow>
                          <TableCell>{t('station')}</TableCell>
                          <TableCell align="center">{t('original.test')}</TableCell>
                          <TableCell align="center">{t('retest.count')}</TableCell>
                          <TableCell align="center">{t('retest.rate')}</TableCell>
                          <TableCell align="center">{t('retest.pass')}</TableCell>
                          <TableCell align="center">{t('retest.pass.rate')}</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {retestStats.map((item, index) => (
                          <TableRow key={item.station} hover>
                            <TableCell>
                              <Chip
                                label={item.station}
                                size="small"
                                color="primary"
                                variant="outlined"
                              />
                            </TableCell>
                            <TableCell align="center">
                              {item.originalCount}
                            </TableCell>
                            <TableCell align="center">
                              <Chip
                                label={item.retestCount}
                                size="small"
                                color={item.retestRate >= 20 ? 'error' : item.retestRate >= 10 ? 'warning' : 'success'}
                                variant="outlined"
                              />
                            </TableCell>
                            <TableCell align="center">
                              <Typography
                                variant="body2"
                                color={item.retestRate >= 20 ? 'error.main' : item.retestRate >= 10 ? 'warning.main' : 'success.main'}
                                sx={{ fontWeight: 600 }}
                              >
                                {item.retestRate}%
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              {item.finalPassCount}
                            </TableCell>
                            <TableCell align="center">
                              <Typography
                                variant="body2"
                                color={item.retestPassRate >= 80 ? 'success.main' : item.retestPassRate >= 60 ? 'warning.main' : 'error.main'}
                                sx={{ fontWeight: 600 }}
                              >
                                {item.retestPassRate}%
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Box display="flex" alignItems="center" justifyContent="center" height="100%">
                    <Typography variant="body2" color="text.secondary">
                      {t('no.retest.data')}
                    </Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
            {/* 拖拽手柄 */}
            <Box
              className="resize-handle"
              onMouseDown={(e) => handleResizeStart(e, 'retestStats')}
              sx={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                width: 20,
                height: 20,
                cursor: 'se-resize',
                opacity: 0,
                transition: 'opacity 0.2s',
                background: 'linear-gradient(-45deg, transparent 30%, #ccc 30%, #ccc 40%, transparent 40%, transparent 60%, #ccc 60%, #ccc 70%, transparent 70%)',
                '&:hover': { opacity: 1 }
              }}
            />
          </Card>
        </Grid>
      </Grid>

      {/* 第三行 - 復測統計和最近測試記錄 */}
      <Grid container spacing={3} sx={{ mb: 3 }}>

        {/* 最近測試記錄 */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{
            border: 1,
            borderColor: 'divider',
            boxShadow: 1,
            height: cardSizes.recentRecords.height,
            position: 'relative',
            transition: dragState?.cardId === 'recentRecords' ? 'none' : 'all 0.2s ease',
            '&:hover .resize-handle': { opacity: 1 }
          }}>
            <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <VisibilityIcon color="primary" />
                  {t('recent.test.records')}
                </Typography>
                <Box display="flex" alignItems="center" gap={2}>
                  <Typography variant="body2" color="text.secondary">
                    {t('showing')} {Math.min(10, filteredData.length)} / {filteredData.length} {t('records')}
                  </Typography>
                  <Button
                    variant="text"
                    size="small"
                    endIcon={<NavigateNextIcon />}
                    onClick={() => setCurrentView('table')}
                    sx={{
                      color: 'primary.main',
                      textTransform: 'none',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      '&:hover': {
                        backgroundColor: 'transparent',
                        color: 'primary.dark'
                      }
                    }}
                  >
                    View All
                  </Button>
                </Box>
              </Box>
              <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>{t('serial.number')}</TableCell>
                        <TableCell>{t('station')}</TableCell>
                        <TableCell>{t('model')}</TableCell>
                        <TableCell>{t('result')}</TableCell>
                        <TableCell>{t('time')}</TableCell>
                        <TableCell>{t('tester')}</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredData.slice(0, 10).map((record, index) => (
                        <TableRow key={index}>
                          <TableCell>{record.serialNumber}</TableCell>
                          <TableCell>{record.station}</TableCell>
                          <TableCell>{record.model}</TableCell>
                          <TableCell>
                            <Chip
                              label={record.result}
                              size="small"
                              variant="outlined"
                              sx={{
                                fontWeight: 600,
                                borderWidth: 1.5,
                                ...(record.result === 'PASS' ? {
                                  color: 'success.main',
                                  borderColor: 'success.main',
                                } : {
                                  color: 'error.main',
                                  borderColor: 'error.main',
                                })
                              }}
                            />
                          </TableCell>
                          <TableCell>{record.testTime}</TableCell>
                          <TableCell>{record.tester}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            </CardContent>
            {/* 拖拽手柄 */}
            <Box
              className="resize-handle"
              onMouseDown={(e) => handleResizeStart(e, 'recentRecords')}
              sx={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                width: 20,
                height: 20,
                cursor: 'se-resize',
                opacity: 0,
                transition: 'opacity 0.2s',
                background: 'linear-gradient(-45deg, transparent 30%, #ccc 30%, #ccc 40%, transparent 40%, transparent 60%, #ccc 60%, #ccc 70%, transparent 70%)',
                '&:hover': { opacity: 1 }
              }}
            />
          </Card>
        </Grid>

        {/* 複測詳情清單 */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{
            border: 1,
            borderColor: 'divider',
            boxShadow: 1,
            height: cardSizes.recentRecords.height,
            position: 'relative',
            transition: 'all 0.2s ease',
            '&:hover .resize-handle': { opacity: 1 }
          }}>
            <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AssessmentIcon color="warning" />
                  {t('retest.details')}
                </Typography>
                <Box display="flex" alignItems="center" gap={2}>
                  <Typography variant="body2" color="text.secondary">
                    {t('show.records')} {Math.min(10, retestRecords.length)} / {retestRecords.length} {t('records')}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>{t('column.serial.number')}</TableCell>
                        <TableCell>{t('column.station')}</TableCell>
                        <TableCell>{t('column.model')}</TableCell>
                        <TableCell>{t('column.retest.count')}</TableCell>
                        <TableCell>{t('column.failed.items')}</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {retestRecords.slice(0, 10).map((record, index) => (
                          <TableRow key={index} sx={{ '&:hover': { backgroundColor: 'action.hover' } }}>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Tooltip title={record.serialNumber}>
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      maxWidth: 120,
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      whiteSpace: 'nowrap',
                                      cursor: 'pointer',
                                      color: 'primary.main',
                                      '&:hover': {
                                        textDecoration: 'underline'
                                      }
                                    }}
                                    onClick={() => {
                                      setSelectedRetestRecord(record);
                                      setDetailDialogOpen(true);
                                    }}
                                  >
                                    {record.serialNumber}
                                  </Typography>
                                </Tooltip>
                                <IconButton
                                  size="small"
                                  onClick={() => {
                                    setSelectedRetestRecord(record);
                                    setDetailDialogOpen(true);
                                  }}
                                  sx={{ padding: '2px' }}
                                >
                                  <InfoIcon fontSize="small" color="action" />
                                </IconButton>
                              </Box>
                            </TableCell>
                            <TableCell>{record.station}</TableCell>
                            <TableCell>{record.model}</TableCell>
                            <TableCell>
                              <Chip
                                label={`${record.retestCount} ${t('times')}`}
                                size="small"
                                color={record.retestCount >= 3 ? 'error' : record.retestCount === 2 ? 'warning' : 'info'}
                                variant="outlined"
                                sx={{ fontWeight: 600 }}
                              />
                            </TableCell>
                            <TableCell>
                              <Tooltip title={record.failureReason}>
                                <Typography variant="body2" sx={{
                                  maxWidth: 200,
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                  color: 'error.main'
                                }}>
                                  {record.failureReason}
                                </Typography>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        ))}
                      {retestRecords.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                            <Typography variant="body2" color="text.secondary">
                              {t('no.retest.records')}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 複測詳細資訊彈窗 */}
      <Dialog
        open={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <InfoIcon color="primary" />
            <Typography variant="h6">{t('retest.detail.info')}</Typography>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {selectedRetestRecord && (
            <Box>
              {/* 基本資訊 */}
              <Box sx={{ mb: 3 }}>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="body2" color="text.secondary">{t('column.serial.number')}</Typography>
                    <Typography variant="body1" fontWeight={600}>{selectedRetestRecord.serialNumber}</Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="body2" color="text.secondary">{t('column.model')}</Typography>
                    <Typography variant="body1" fontWeight={600}>{selectedRetestRecord.model}</Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="body2" color="text.secondary">{t('column.station')}</Typography>
                    <Typography variant="body1" fontWeight={600}>{selectedRetestRecord.station}</Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="body2" color="text.secondary">{t('column.retest.count')}</Typography>
                    <Chip
                      label={`${selectedRetestRecord.retestCount} ${t('times')}`}
                      size="small"
                      color={selectedRetestRecord.retestCount >= 3 ? 'error' : selectedRetestRecord.retestCount === 2 ? 'warning' : 'info'}
                      variant="outlined"
                      sx={{ fontWeight: 600 }}
                    />
                  </Grid>
                </Grid>
              </Box>

              {/* 失敗測項 */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>{t('failed.items')}</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {selectedRetestRecord.failedItems && selectedRetestRecord.failedItems.length > 0 ? (
                    selectedRetestRecord.failedItems.map((item: string, idx: number) => (
                      <Chip key={idx} label={item} size="small" color="error" variant="outlined" />
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary">{t('no.failed.items')}</Typography>
                  )}
                </Box>
              </Box>

              {/* 測試歷史 */}
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>{t('test.history')}</Typography>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>{t('column.test.time')}</TableCell>
                        <TableCell>{t('column.station')}</TableCell>
                        <TableCell>{t('column.result')}</TableCell>
                        <TableCell>{t('failed.items')}</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedRetestRecord.allRecords && selectedRetestRecord.allRecords.map((record: any, idx: number) => {
                        const failedItems = record.items && Array.isArray(record.items)
                          ? record.items.filter((item: any) => item.result === 'FAIL').map((item: any) => item.name)
                          : [];

                        return (
                          <TableRow key={idx}>
                            <TableCell>
                              <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                                {record.testTime}
                              </Typography>
                            </TableCell>
                            <TableCell>{record.station}</TableCell>
                            <TableCell>
                              <Chip
                                label={record.result}
                                size="small"
                                variant="outlined"
                                sx={{
                                  fontWeight: 600,
                                  borderWidth: 1.5,
                                  ...(record.result === 'PASS' ? {
                                    color: 'success.main',
                                    borderColor: 'success.main',
                                  } : {
                                    color: 'error.main',
                                    borderColor: 'error.main',
                                  })
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              {failedItems.length > 0 ? (
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                  {failedItems.map((item: string, itemIdx: number) => (
                                    <Chip key={itemIdx} label={item} size="small" color="error" variant="outlined" sx={{ fontSize: '0.7rem', height: 20 }} />
                                  ))}
                                </Box>
                              ) : (
                                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                                  -
                                </Typography>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailDialogOpen(false)} color="primary">
            {t('close')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}