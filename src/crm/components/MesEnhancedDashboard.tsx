import * as React from "react";
import { useMemo } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Paper from "@mui/material/Paper";
import Chip from "@mui/material/Chip";
import AssessmentIcon from "@mui/icons-material/Assessment";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import MemoryIcon from "@mui/icons-material/Memory";
import RefreshIcon from "@mui/icons-material/Refresh";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import SearchIcon from "@mui/icons-material/Search";
import FilterIcon from "@mui/icons-material/Filter";
import MesStatsCard from "./MesStatsCard";
import {
  MesResultPieChart,
  MesStationBarChart,
  MesTrendLineChart,
  MesHeatmap
} from "./MesCharts";
import CrmRecentDealsTable from "./CrmRecentDealsTable";

// 模擬的 MES 數據
const mockMesData = {
  stats: {
    total: 1247,
    pass: 1156,
    fail: 91,
    yieldRate: 92.7,
    deviceCount: 45,
    passedDeviceCount: 42,
    productionYieldRate: 93.3,
    retestCount: 12,
  },
  stations: ["FA_FT01", "FA_FT02", "ICT_01", "ICT_02", "FINAL_01"],
  models: ["WA3", "WA4", "CH5", "DH6"],
  rows: [], // 實際資料會從 API 載入
};

interface MesFilters {
  serial: string;
  station: string;
  model: string;
  startDate: string;
  endDate: string;
}

export default function MesEnhancedDashboard() {
  const [filters, setFilters] = React.useState<MesFilters>({
    serial: "",
    station: "",
    model: "",
    startDate: "",
    endDate: "",
  });

  // 計算趨勢數據
  const trendData = useMemo(() => {
    const passRate = mockMesData.stats.yieldRate;
    const previousRate = 89.5; // 假設的前期數據
    const trend = passRate > previousRate ? "up" : passRate < previousRate ? "down" : "flat";
    const trendValue = `${Math.abs(passRate - previousRate).toFixed(1)}%`;

    return { trend, trendValue };
  }, []);

  // 準備圖表數據
  const chartData = useMemo(() => {
    // 圓餅圖數據
    const pieData = {
      pass: mockMesData.stats.pass,
      fail: mockMesData.stats.fail
    };

    // 站點長條圖數據
    const stationData: Record<string, { pass: number; fail: number }> = {};
    mockMesData.stations.forEach(station => {
      stationData[station] = {
        pass: Math.floor(Math.random() * 50) + 20,
        fail: Math.floor(Math.random() * 10) + 1
      };
    });

    // 趨勢圖數據（模擬7天數據）
    const trendLineData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const count = Math.floor(Math.random() * 100) + 50;
      const passRate = Math.random() * 20 + 80; // 80-100%

      trendLineData.push({
        date: date.toISOString().slice(5, 10), // MM-DD 格式
        count,
        passRate: parseFloat(passRate.toFixed(1))
      });
    }

    // 熱力圖數據
    const heatmapData = [];
    const timeSlots = ["08:00", "10:00", "12:00", "14:00", "16:00", "18:00"];
    mockMesData.stations.forEach(station => {
      timeSlots.forEach(time => {
        heatmapData.push({
          station,
          timeSlot: time,
          value: Math.floor(Math.random() * 80) + 20,
          result: Math.random() > 0.1 ? "PASS" : "FAIL"
        });
      });
    });

    return { pieData, stationData, trendLineData, heatmapData };
  }, []);

  // 日期範圍快捷選項
  const handleDateRangeSelect = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days);

    setFilters(prev => ({
      ...prev,
      startDate: start.toISOString().slice(0, 10),
      endDate: end.toISOString().slice(0, 10)
    }));
  };

  const dateRangeOptions = [
    { label: "今天", days: 0 },
    { label: "近7天", days: 6 },
    { label: "近30天", days: 29 },
    { label: "近90天", days: 89 },
  ];

  const handleExport = () => {
    // TODO: 實作匯出功能
    console.log("匯出數據");
  };

  const handleOpenAdvancedSearch = () => {
    // TODO: 實作進階搜尋
    console.log("開啟進階搜尋");
  };

  const handleOpenUserPreferences = () => {
    // TODO: 實作用戶偏好設定
    console.log("開啟用戶偏好設定");
  };

  return (
    <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
      {/* 頁面標題 */}
      <Box mb={4}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
          MES 數據監控儀表板
        </Typography>
      </Box>

      {/* 篩選控制區 */}
      <Paper elevation={1} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Box mb={2}>
          <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <FilterIcon />
            數據篩選
          </Typography>
        </Box>

        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <TextField
              fullWidth
              size="small"
              label="序號關鍵字"
              placeholder="輸入序號..."
              value={filters.serial}
              onChange={(e) => setFilters(prev => ({ ...prev, serial: e.target.value }))}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel>站別</InputLabel>
              <Select
                value={filters.station}
                label="站別"
                onChange={(e) => setFilters(prev => ({ ...prev, station: e.target.value as string }))}
              >
                <MenuItem value="">全部站別</MenuItem>
                {mockMesData.stations.map(station => (
                  <MenuItem key={station} value={station}>{station}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel>機種</InputLabel>
              <Select
                value={filters.model}
                label="機種"
                onChange={(e) => setFilters(prev => ({ ...prev, model: e.target.value as string }))}
              >
                <MenuItem value="">全部機種</MenuItem>
                {mockMesData.models.map(model => (
                  <MenuItem key={model} value={model}>{model}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <TextField
              fullWidth
              size="small"
              type="date"
              label="開始日期"
              InputLabelProps={{ shrink: true }}
              value={filters.startDate}
              onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <TextField
              fullWidth
              size="small"
              type="date"
              label="結束日期"
              InputLabelProps={{ shrink: true }}
              value={filters.endDate}
              onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<SearchIcon />}
              onClick={handleOpenAdvancedSearch}
            >
              進階搜尋
            </Button>
          </Grid>
        </Grid>

        {/* 快速日期選擇 */}
        <Box mt={2} display="flex" gap={1} flexWrap="wrap">
          {dateRangeOptions.map((option) => (
            <Chip
              key={option.label}
              label={option.label}
              onClick={() => handleDateRangeSelect(option.days)}
              variant="outlined"
              size="small"
              sx={{ cursor: "pointer" }}
            />
          ))}
        </Box>
      </Paper>

      {/* 統計卡片區 */}
      <Grid container spacing={3} mb={4}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MesStatsCard
            title="總測試數"
            value={mockMesData.stats.total}
            subtitle={`設備數量: ${mockMesData.stats.deviceCount}`}
            icon={<AssessmentIcon />}
            color="primary"
            chip={{ label: "累計數據", color: "primary" }}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MesStatsCard
            title="測試良率"
            value={`${mockMesData.stats.yieldRate}%`}
            subtitle={`通過: ${mockMesData.stats.pass} / 失敗: ${mockMesData.stats.fail}`}
            icon={<CheckCircleIcon />}
            color="success"
            trend={trendData.trend as "up" | "down" | "flat"}
            trendValue={trendData.trendValue}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MesStatsCard
            title="生產良率"
            value={`${mockMesData.stats.productionYieldRate}%`}
            subtitle={`完成: ${mockMesData.stats.passedDeviceCount} / 總數: ${mockMesData.stats.deviceCount}`}
            icon={<MemoryIcon />}
            color="info"
            chip={{ label: "設備統計", color: "info" }}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MesStatsCard
            title="複測統計"
            value={mockMesData.stats.retestCount}
            subtitle="需要複測的項目數量"
            icon={<ErrorIcon />}
            color="warning"
            chip={{ label: "品質監控", color: "warning" }}
          />
        </Grid>
      </Grid>

      {/* 操作按鈕區 */}
      <Box mb={4} display="flex" gap={2} flexWrap="wrap">
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
          onClick={() => window.location.reload()}
        >
          重新整理
        </Button>
        <Button
          variant="outlined"
          onClick={handleOpenUserPreferences}
        >
          個人化設定
        </Button>
      </Box>

      {/* 圖表與數據區域 */}
      <Grid container spacing={3}>
        {/* 第一排：趨勢圖和圓餅圖 */}
        <Grid size={{ xs: 12, md: 8 }}>
          <MesTrendLineChart
            data={chartData.trendLineData}
            title="近7天測試趨勢分析"
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <MesResultPieChart
            data={chartData.pieData}
            title="測試結果分佈"
          />
        </Grid>

        {/* 第二排：站點長條圖 */}
        <Grid size={12}>
          <MesStationBarChart
            data={chartData.stationData}
            title="各站點測試表現統計"
          />
        </Grid>

        {/* 第三排：熱力圖 */}
        <Grid size={12}>
          <MesHeatmap
            data={chartData.heatmapData}
            title="站點時間熱力圖"
          />
        </Grid>

        {/* 第四排：Recent Deals */}
        <Grid size={12}>
          <CrmRecentDealsTable />
        </Grid>
      </Grid>
    </Box>
  );
}