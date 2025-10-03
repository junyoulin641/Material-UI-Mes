import * as React from 'react';
import { useState, useEffect } from 'react';
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
import StatCard from './StatCard';
import type { StatCardProps } from '../types';
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
import { useFilters } from '../../../contexts/FilterContext';
import { useNavigation } from '../../common/components/AppRouter';
import { useDashboardData } from '../hooks/useDashboardData';

interface CompleteMesDashboardProps {
  showAdvanced?: boolean;
}

export default function CompleteMesDashboard({ showAdvanced = true }: CompleteMesDashboardProps) {
  const { t } = useLanguage();
  const { filters: globalFilters, setFilters: setGlobalFilters } = useFilters();
  const { setCurrentView } = useNavigation();
  const [exportAnchorEl, setExportAnchorEl] = useState<null | HTMLElement>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedRetestRecord, setSelectedRetestRecord] = useState<any>(null);

  // 拖拽縮放狀態管理
  const [cardSizes, setCardSizes] = useState<Record<string, { width: number; height: number }>>({
    stationPerformance: { width: 50, height: 400 },
    stationTestCount: { width: 50, height: 400 },
    stationStats: { width: 50, height: 400 },
    stationPassRateTrend: { width: 50, height: 400 },
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

  // 使用 Dashboard 資料 Hook - 一次性取得所有需要的資料
  const {
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
    configuredStations,
    configuredModels,
  } = useDashboardData(globalFilters as SimpleFilterOptions);

  // MES 統計卡片數據
  const data: StatCardProps[] = [
    {
      title: t('total.tests'),
      value: stats.total.toLocaleString(),
      subtitle: `${t('device.count')}: ${stats.deviceCount.toLocaleString()}`,
      interval: dateRangeInfo.intervalText,
      trend: stats.total > 0 ? "up" : "neutral",
      trendValue: stats.total > 0 ? `${stats.total}` : "0",
      icon: <AssessmentIcon />,
      color: 'primary',
      data: dailySeriesData.totalTests,
      dateRange: {
        startDate: dateRangeInfo.startDate,
        endDate: dateRangeInfo.endDate
      },
    },
    {
      title: t('test.yield'),
      value: stats.passRateText,
      subtitle: `${t('passed')}: ${stats.passed.toLocaleString()} / ${t('failed')}: ${stats.failed.toLocaleString()}`,
      interval: dateRangeInfo.intervalText,
      trend: stats.trend as "up" | "down" | "neutral",
      trendValue: stats.passRateText,
      icon: <CheckCircleIcon />,
      color: 'success',
      data: dailySeriesData.passRates,
      dateRange: {
        startDate: dateRangeInfo.startDate,
        endDate: dateRangeInfo.endDate
      },
    },
    {
      title: t('production.yield'),
      value: stats.productionYieldRateText,
      subtitle: `${t('passed.devices')}: ${stats.passedDeviceCount.toLocaleString()} / ${t('total.devices')}: ${stats.deviceCount.toLocaleString()}`,
      interval: dateRangeInfo.intervalText,
      trend: stats.productionYieldRate >= stats.passRate ? "up" : "down",
      trendValue: stats.productionYieldRateText,
      icon: <MemoryIcon />,
      color: 'info',
      data: dailySeriesData.productionYieldRates,
      dateRange: {
        startDate: dateRangeInfo.startDate,
        endDate: dateRangeInfo.endDate
      },
    },
    {
      title: t('retest.count.alt'),
      value: stats.retestCount.toLocaleString(),
      interval: dateRangeInfo.intervalText,
      subtitle: `${t('retest.count')}: ${stats.retestCount.toLocaleString()}`,
      trend: stats.retestCount > 0 ? "down" : "neutral",
      trendValue: stats.retestCount > 0 ? `${stats.retestCount}` : "0",
      icon: <ErrorIcon />,
      color: 'warning',
      data: dailySeriesData.retestCounts,
      dateRange: {
        startDate: dateRangeInfo.startDate,
        endDate: dateRangeInfo.endDate
      },
    },
  ];

  const handleDashboardFilterChange = (filters: SimpleFilterOptions) => {
    setGlobalFilters(filters);
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


      {/* 快速篩選 */}
      <Box sx={{ mb: 3 }}>
        <SimpleQuickFilters
          onFilterChange={handleDashboardFilterChange}
          stations={configuredStations}
          models={configuredModels}
        />
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

              {/* 站別顏色圖例 */}
              <Box sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 1.5,
                mb: 2,
                pb: 1,
                borderBottom: 1,
                borderColor: 'divider'
              }}>
                {Object.entries(dailyStationData).map(([station, _], index) => {
                  const colors = ['#6366f1', '#ec4899', '#10b981', '#8b5cf6', '#f59e0b', '#06b6d4', '#ef4444', '#84cc16'];
                  const color = colors[index % colors.length];
                  return (
                    <Box key={station} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Box sx={{
                        width: 12,
                        height: 12,
                        backgroundColor: color,
                        borderRadius: 0.5
                      }} />
                      <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                        {station}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>

              <Box sx={{ flex: 1, minHeight: 0 }}>
                <BarChart
                  xAxis={[{
                    scaleType: 'band',
                    data: Array.from({ length: dateRangeInfo.diffDays }, (_, i) => {
                      const date = new Date(dateRangeInfo.startDate);
                      date.setDate(date.getDate() + i);
                      return date.toLocaleDateString('zh-TW', { month: '2-digit', day: '2-digit' });
                    })
                  }]}
                  yAxis={[{
                    label: t('test.count'),
                  }]}
                  series={Object.entries(dailyStationData).map(([station, data], index) => {
                    const colors = ['#6366f1', '#ec4899', '#10b981', '#8b5cf6', '#f59e0b', '#06b6d4', '#ef4444', '#84cc16'];
                    return {
                      data: data,
                      label: station,
                      color: colors[index % colors.length],
                      stack: 'total'
                    };
                  })}
                  height={300}
                  margin={{ left: 50, right: 20, top: 20, bottom: 60 }}
                  slotProps={{
                    legend: {
                      direction: 'row',
                      position: { vertical: 'bottom', horizontal: 'left' },
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
                        <TableCell>{t('column.station')}</TableCell>
                        <TableCell align="center">{t('total')}</TableCell>
                        <TableCell align="center">{t('pass.rate')}</TableCell>
                        <TableCell align="center">{t('status')}</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {detailedStationStats.map((stationData) => {
                        const passRate = stationData.total > 0 ?
                          ((stationData.total - stationData.failed) / stationData.total * 100) : 0;
                        const status = passRate >= 95 ? 'excellent' : passRate >= 85 ? 'good' : passRate >= 70 ? 'warning' : 'critical';
                        const statusText = status === 'excellent' ? t('excellent') : status === 'good' ? t('good') : status === 'warning' ? t('warning') : t('critical');
                        const statusColor = status === 'excellent' ? 'success' : status === 'good' ? 'info' : status === 'warning' ? 'warning' : 'error';

                        return (
                          <TableRow key={stationData.station} hover>
                            <TableCell sx={{ fontFamily: 'monospace' }}>
                              {stationData.station}
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
                  {t('model.test.stats')}
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
                        <TableCell>{t('column.model')}</TableCell>
                        <TableCell align="center">{t('test.count')}</TableCell>
                        <TableCell align="center">{t('passed.count')}</TableCell>
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

        {/* 每日站別良率熱力圖 */}
        <Grid size={{ xs: 12 }}>
          <Card sx={{
            border: 1,
            borderColor: 'divider',
            boxShadow: 1,
            position: 'relative',
          }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {t('daily.station.pass.rate.heatmap')}
                </Typography>
                <IconButton size="small" sx={{ opacity: 0.5 }}>
                  <TrendingUpIcon fontSize="small" />
                </IconButton>
              </Box>

              {/* 圖例說明 */}
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                mb: 2,
                pb: 2,
                borderBottom: 1,
                borderColor: 'divider'
              }}>
                <Typography variant="body2" color="text.secondary">
                  {t('pass.rate')}:
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 20, height: 20, bgcolor: '#ef4444', borderRadius: 0.5 }} />
                  <Typography variant="caption">0-60%</Typography>
                  <Box sx={{ width: 20, height: 20, bgcolor: '#f59e0b', borderRadius: 0.5 }} />
                  <Typography variant="caption">61-80%</Typography>
                  <Box sx={{ width: 20, height: 20, bgcolor: '#84cc16', borderRadius: 0.5 }} />
                  <Typography variant="caption">81-90%</Typography>
                  <Box sx={{ width: 20, height: 20, bgcolor: '#10b981', borderRadius: 0.5 }} />
                  <Typography variant="caption">91-100%</Typography>
                  <Box sx={{ width: 20, height: 20, bgcolor: '#e5e7eb', border: '1px solid #d1d5db', borderRadius: 0.5 }} />
                  <Typography variant="caption">{t('no.data')}</Typography>
                </Box>
              </Box>

              {/* 熱力圖表格 */}
              <Box sx={{ overflowX: 'auto' }}>
                <Table size="small" sx={{ minWidth: 600 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, minWidth: 80, p: 0.5, fontSize: '0.75rem' }}>{t('column.station')}</TableCell>
                      {Array.from({ length: dateRangeInfo.diffDays }, (_, i) => {
                        const date = new Date(dateRangeInfo.startDate);
                        date.setDate(date.getDate() + i);
                        return (
                          <TableCell key={i} align="center" sx={{ minWidth: 40, p: 0.25, fontSize: '0.65rem' }}>
                            {date.toLocaleDateString('zh-TW', { month: '2-digit', day: '2-digit' }).replace('/', '/')}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Object.entries(dailyStationPassRates).map(([station, rates]) => (
                      <TableRow key={station}>
                        <TableCell sx={{ fontWeight: 500, p: 0.5 }}>
                          <Chip label={station} size="small" variant="outlined" sx={{ height: 20, fontSize: '0.7rem' }} />
                        </TableCell>
                        {rates.map((rate, index) => {
                          let bgcolor = '#e5e7eb'; // 無數據（灰色）
                          let textColor = '#6b7280';

                          if (rate !== null) {
                            if (rate >= 91) {
                              bgcolor = '#10b981'; // 深綠
                              textColor = 'white';
                            } else if (rate >= 81) {
                              bgcolor = '#84cc16'; // 淺綠
                              textColor = 'white';
                            } else if (rate >= 61) {
                              bgcolor = '#f59e0b'; // 橙色
                              textColor = 'white';
                            } else {
                              bgcolor = '#ef4444'; // 紅色
                              textColor = 'white';
                            }
                          }

                          return (
                            <TableCell
                              key={index}
                              align="center"
                              sx={{
                                p: '2px',
                                bgcolor,
                                color: textColor,
                                fontWeight: 600,
                                fontSize: '0.65rem',
                                border: '1px solid #fff',
                                minWidth: 40,
                                maxWidth: 40,
                                cursor: rate !== null ? 'pointer' : 'default',
                                '&:hover': rate !== null ? {
                                  opacity: 0.8,
                                  transform: 'scale(1.1)',
                                  transition: 'all 0.2s',
                                  zIndex: 1,
                                  position: 'relative'
                                } : {}
                              }}
                              title={rate !== null ? `${station} - ${rate}%` : t('no.data')}
                            >
                              {rate !== null ? `${rate}%` : '-'}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            </CardContent>
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
                  {t('failure.reason.analysis')}
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
                          <TableCell>{t('column.station')}</TableCell>
                          <TableCell align="center">{t('original.test')}</TableCell>
                          <TableCell align="center">{t('retest.count')}</TableCell>
                          <TableCell align="center">{t('retest.rate')}</TableCell>
                          <TableCell align="center">{t('retest.passed')}</TableCell>
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
                      目前沒有復測資料
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
                    {t('show.records')} {Math.min(10, filteredData.length)} / {filteredData.length} {t('records')}
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
                    {t('view.all')}
                  </Button>
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
                        <TableCell>{t('column.result')}</TableCell>
                        <TableCell>{t('column.test.time')}</TableCell>
                        <TableCell>{t('column.tester')}</TableCell>
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
                  <Button
                    variant="text"
                    size="small"
                    endIcon={<NavigateNextIcon />}
                    onClick={() => setCurrentView('retest')}
                    sx={{
                      color: 'primary.main',
                      textTransform: 'none',
                      fontWeight: 500,
                      '&:hover': {
                        backgroundColor: 'action.hover'
                      }
                    }}
                  >
                    {t('view.all')}
                  </Button>
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