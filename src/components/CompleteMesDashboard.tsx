import * as React from 'react';
import { useState, useMemo, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Button from '@mui/material/Button';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import HomeIcon from '@mui/icons-material/Home';
import StatCard, { StatCardProps } from '../dashboard/components/StatCard';
import SimpleQuickFilters, { SimpleFilterOptions } from './SimpleQuickFilters';
import RefreshIcon from '@mui/icons-material/Refresh';
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
import DetailedStatsCard from './DetailedStatsCard';
import { useLanguage } from '../contexts/LanguageContext';
import { getMESDatabase } from '../utils/MESDatabase';
import { useNavigation } from './AppRouter';

// 從 IndexedDB 載入實際測試數據
const loadRealTestData = async () => {
  try {
    // 優先從 IndexedDB 載入
    const db = await getMESDatabase();
    const records = await db.getAllTestRecords();

    if (records.length > 0) {
      console.log(`✅ 儀表板從 IndexedDB 載入 ${records.length} 筆記錄`);
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
      console.log(`📦 儀表板從 localStorage 載入 ${parsedData.length} 筆記錄`);
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

// 模擬測試數據（備用）
const generateMockData = () => {
  const stations: string[] = [];
  const models: string[] = [];
  const results = ['PASS', 'FAIL'];

  const records = [];
  for (let i = 0; i < 0; i++) {
    const randomDate = new Date();
    randomDate.setDate(randomDate.getDate() - Math.floor(Math.random() * 7));

    records.push({
      id: i + 1,
      serialNumber: `CH${Math.random().toString().substr(2, 12)}`,
      workOrder: `6210018423-000${String(Math.floor(Math.random() * 100)).padStart(2, '0')}`,
      station: stations[Math.floor(Math.random() * stations.length)],
      model: models[Math.floor(Math.random() * models.length)],
      result: Math.random() > 0.2 ? 'PASS' : 'FAIL', // 80% pass rate
      testTime: randomDate.toLocaleString(),
      tester: `2001092${Math.floor(Math.random() * 10)}A`,
    });
  }
  return records;
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

  // 載入測試數據
  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await loadRealTestData();
        setTestData(data);
        console.log(`📈 儀表板資料載入完成: ${data.length} 筆記錄`);
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
      console.log('🔄 儀表板收到資料更新事件...');
      try {
        const data = await loadRealTestData();
        setTestData(data);
        console.log(`📈 儀表板資料已更新: ${data.length} 筆記錄`);
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
        : `${formatDate(startDate)} - ${formatDate(endDate)} (${diffDays}天)`;

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
      title: "總測試數",
      value: stats.total.toLocaleString(),
      subtitle: `設備數量: ${stats.deviceCount}`,
      interval: dateRangeInfo.intervalText,
      trend: "up",
      icon: <AssessmentIcon />,
      color: 'primary',
      chip: { label: '累計數據', color: 'primary' },
      data: dailySeriesData.totalTests,
      dateRange: {
        startDate: dateRangeInfo.startDate,
        endDate: dateRangeInfo.endDate
      },
    },
    {
      title: "測試良率",
      value: stats.passRateText,
      subtitle: `通過: ${stats.passed} / 失敗: ${stats.failed}`,
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
      title: "生產良率",
      value: stats.productionYieldRateText,
      subtitle: `完成: ${stats.passedDeviceCount} / 總數: ${stats.deviceCount}`,
      interval: dateRangeInfo.intervalText,
      trend: "up",
      icon: <MemoryIcon />,
      color: 'info',
      chip: { label: '設備統計', color: 'info' },
      data: dailySeriesData.deviceCounts,
      dateRange: {
        startDate: dateRangeInfo.startDate,
        endDate: dateRangeInfo.endDate
      },
    },
    {
      title: "復測數量",
      value: stats.retestCount.toLocaleString(),
      subtitle: `需要複測的項目數量`,
      interval: dateRangeInfo.intervalText,
      trend: "down",
      icon: <ErrorIcon />,
      color: 'warning',
      chip: { label: '品質監控', color: 'warning' },
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

    // 站別測試數量 (長條圖) - 動態收集站別
    const stationStats = new Map();
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
    }));

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

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleExport = () => {
    // 匯出CSV功能
    const csvContent = [
      ['序號', '工單', '站別', '機種', '結果', '測試時間', '測試員'].join(','),
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

  return (
    <Box sx={{
      width: "100%",
      maxWidth: { sm: "100%", md: "1700px" },
      pl: { xs: 2, sm: 3, md: 4 }, // 增加左側邊距
      pr: { xs: 2, sm: 3 },
      py: 3
    }}>
      {/* 頁面標題卡片 */}
      <Card sx={{ mb: 3, border: 1, borderColor: 'divider', boxShadow: 1 }}>
        <CardContent>
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
              首頁
            </Link>
            <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
              儀表板
            </Typography>
          </Breadcrumbs>

          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600, mb: 0 }}>
            MES 數據監控儀表板
          </Typography>
        </CardContent>
      </Card>

      {/* 操作控制卡片 */}
      <Card sx={{ mb: 3, border: 1, borderColor: 'divider', boxShadow: 1 }}>
        <CardContent>
          <Box display="flex" gap={2} flexWrap="wrap">
        <Button
          variant="contained"
          startIcon={<FileDownloadIcon />}
          onClick={handleExport}
        >
          匯出數據
        </Button>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={handleRefresh}
        >
          重新整理
        </Button>
        <Button
          variant="outlined"
          onClick={() => console.log('Open user preferences')}
        >
          個人化設定
        </Button>
          </Box>
        </CardContent>
      </Card>

      {/* 快速篩選卡片 */}
      <Card sx={{ mb: 3, border: 1, borderColor: 'divider', boxShadow: 1 }}>
        <CardContent>
          <SimpleQuickFilters onFilterChange={handleDashboardFilterChange} />
        </CardContent>
      </Card>

      {/* KPI 統計卡片 */}
      <Card sx={{ mb: 3, border: 1, borderColor: 'divider', boxShadow: 1 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
            關鍵績效指標
          </Typography>
          <Grid container spacing={3}>
        {data.map((card, index) => (
          <Grid key={index} size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard {...card} />
          </Grid>
        ))}
          </Grid>
        </CardContent>
      </Card>

      {/* 圖表區域 */}
      <Card sx={{ mb: 3, border: 1, borderColor: 'divider', boxShadow: 1 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
            數據圖表分析
          </Typography>
          <Grid container spacing={3}>
        {/* 測試趨勢分析 - 8列寬 */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                測試趨勢分析 ({dateRangeInfo.intervalText})
              </Typography>
              <Box sx={{ height: 300 }}>
                <LineChart
                  xAxis={[{
                    data: chartData.line.months,
                    scaleType: 'point',
                  }]}
                  yAxis={[
                    { id: 'count', scaleType: 'linear' },
                    { id: 'rate', scaleType: 'linear', min: 0, max: 100 },
                  ]}
                  series={[
                    {
                      data: chartData.line.actual,
                      label: '測試數量',
                      color: '#1976d2',
                      yAxisKey: 'count',
                    },
                    {
                      data: chartData.line.targets, // 實際通過率
                      label: '通過率 (%)',
                      color: '#4caf50',
                      yAxisKey: 'rate',
                    },
                  ]}
                  height={280}
                  margin={{ left: 80, right: 80, top: 20, bottom: 80 }}
                  slotProps={{
                    legend: {
                      direction: 'row',
                      position: { vertical: 'top', horizontal: 'right' },
                    },
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* 測試結果分佈圓餅圖 - 4列寬 */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                測試結果分佈
              </Typography>
              <Box sx={{ height: 300, display: 'flex', justifyContent: 'center' }}>
                <PieChart
                  series={[{
                    data: chartData.pie,
                    highlightScope: { faded: 'global', highlighted: 'item' },
                    faded: { innerRadius: 30, additionalRadius: -30, color: 'gray' },
                  }]}
                  height={280}
                  slotProps={{
                    legend: {
                      direction: 'row',
                      position: { vertical: 'bottom', horizontal: 'middle' },
                      padding: 0,
                    },
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* 各站點測試表現統計 - 12列寬 */}
        <Grid size={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                各站點測試表現統計
              </Typography>
              <Box sx={{ height: 300 }}>
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
                  height={280}
                  margin={{ left: 80, right: 20, top: 20, bottom: 80 }}
                  slotProps={{
                    legend: {
                      direction: 'row',
                      position: { vertical: 'top', horizontal: 'right' },
                    },
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* 詳細統計分析 */}
      <DetailedStatsCard
          data={filteredData.map(record => ({
            id: record.id,
            serialNumber: record.serialNumber,
            station: record.station,
            model: record.model,
            result: record.result as 'PASS' | 'FAIL',
            testTime: record.testTime,
            items: record.items || [] // 確保包含測項資料
          }))}
          showRetestDetails={true}
        />

      {/* 最近測試記錄表格 */}
      <Card sx={{ border: 1, borderColor: 'divider', boxShadow: 1 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <VisibilityIcon color="primary" />
              {t('recent.test.records')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              顯示 {Math.min(10, filteredData.length)} / {filteredData.length} 筆記錄
            </Typography>
          </Box>

          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>{t('serial.number')}</TableCell>
                  <TableCell>{t('work.order')}</TableCell>
                  <TableCell>{t('station')}</TableCell>
                  <TableCell>{t('model')}</TableCell>
                  <TableCell align="center">結果</TableCell>
                  <TableCell>測試時間</TableCell>
                  <TableCell>測試員</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredData.slice(0, 10).map((record) => (
                  <TableRow key={record.id} hover>
                    <TableCell sx={{ fontFamily: 'monospace' }}>
                      {record.serialNumber}
                    </TableCell>
                    <TableCell sx={{ fontFamily: 'monospace' }}>
                      {record.workOrder}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={record.station}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={record.model}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={record.result}
                        size="small"
                        color={record.result === 'PASS' ? 'success' : 'error'}
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

          <CardActions sx={{ justifyContent: 'center', pt: 2 }}>
            <Button
              variant="outlined"
              startIcon={<VisibilityIcon />}
              onClick={() => setCurrentView('table')}
            >
              VIEW ALL
            </Button>
          </CardActions>
        </CardContent>
      </Card>
    </Box>
  );
}