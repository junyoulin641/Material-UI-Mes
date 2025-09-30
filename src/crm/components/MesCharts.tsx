import * as React from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import { PieChart } from "@mui/x-charts/PieChart";
import { BarChart } from "@mui/x-charts/BarChart";
import { LineChart } from "@mui/x-charts/LineChart";

// 圓餅圖組件
interface PieChartData {
  pass: number;
  fail: number;
}

interface MesResultPieChartProps {
  data: PieChartData;
  title?: string;
}

export function MesResultPieChart({ data, title = "測試結果分佈" }: MesResultPieChartProps) {
  const safeData = data || { pass: 0, fail: 0 };

  const chartData = [
    {
      id: 0,
      value: safeData.pass || 0,
      label: "PASS",
      color: "#4caf50",
    },
    {
      id: 1,
      value: safeData.fail || 0,
      label: "FAIL",
      color: "#f44336",
    },
  ];

  return (
    <Card sx={{ height: "100%" }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
        <Box height={300}>
          <PieChart
            series={[
              {
                data: chartData,
                highlightScope: { faded: "global", highlighted: "item" },
                faded: { innerRadius: 30, additionalRadius: -30, color: "gray" },
              },
            ]}
            height={280}
            slotProps={{
              legend: {
                direction: "row",
                position: { vertical: "bottom", horizontal: "middle" },
                padding: 0,
              },
            }}
          />
        </Box>
      </CardContent>
    </Card>
  );
}

// 長條圖組件
interface StationData {
  [station: string]: {
    pass: number;
    fail: number;
  };
}

interface MesStationBarChartProps {
  data: StationData;
  title?: string;
}

export function MesStationBarChart({ data, title = "各站點測試統計" }: MesStationBarChartProps) {
  const safeData = data || {};
  const stations = Object.keys(safeData);
  const passData = stations.map(station => safeData[station]?.pass || 0);
  const failData = stations.map(station => safeData[station]?.fail || 0);

  if (stations.length === 0) {
    return (
      <Card sx={{ height: "100%" }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {title}
          </Typography>
          <Box
            height={300}
            display="flex"
            alignItems="center"
            justifyContent="center"
            color="text.secondary"
          >
            <Typography variant="body1">暫無站點數據</Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ height: "100%" }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
        <Box height={300}>
          <BarChart
            xAxis={[{ scaleType: "band", data: stations }]}
            series={[
              {
                data: passData,
                label: "PASS",
                color: "#4caf50",
                stack: "total"
              },
              {
                data: failData,
                label: "FAIL",
                color: "#f44336",
                stack: "total"
              },
            ]}
            height={280}
            margin={{ left: 80, right: 20, top: 20, bottom: 80 }}
            slotProps={{
              legend: {
                direction: "row",
                position: { vertical: "top", horizontal: "right" },
              },
            }}
          />
        </Box>
      </CardContent>
    </Card>
  );
}

// 趨勢線圖組件
interface TrendData {
  date: string;
  count: number;
  passRate: number;
}

interface MesTrendLineChartProps {
  data: TrendData[];
  title?: string;
}

export function MesTrendLineChart({ data, title = "測試數量趨勢" }: MesTrendLineChartProps) {
  const safeData = Array.isArray(data) ? data : [];

  if (safeData.length === 0) {
    return (
      <Card sx={{ height: "100%" }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {title}
          </Typography>
          <Box
            height={300}
            display="flex"
            alignItems="center"
            justifyContent="center"
            color="text.secondary"
          >
            <Typography variant="body1">暫無趨勢數據</Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  const dates = safeData.map(item => item?.date || "");
  const testCounts = safeData.map(item => item?.count || 0);
  const passRates = safeData.map(item => item?.passRate || 0);

  return (
    <Card sx={{ height: "100%" }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
        <Box height={300}>
          <LineChart
            xAxis={[{
              scaleType: "point",
              data: dates,
              tickLabelStyle: {
                angle: -45,
                textAnchor: "end",
              }
            }]}
            yAxis={[
              { id: "count", scaleType: "linear" },
              { id: "rate", scaleType: "linear", min: 0, max: 100 },
            ]}
            series={[
              {
                data: testCounts,
                label: "測試數量",
                color: "#1976d2",
                yAxisKey: "count",
              },
              {
                data: passRates,
                label: "通過率 (%)",
                color: "#4caf50",
                yAxisKey: "rate",
              },
            ]}
            height={280}
            margin={{ left: 80, right: 80, top: 20, bottom: 80 }}
            slotProps={{
              legend: {
                direction: "row",
                position: { vertical: "top", horizontal: "right" },
              },
            }}
          />
        </Box>
      </CardContent>
    </Card>
  );
}

// 熱力圖組件
interface HeatmapData {
  station: string;
  timeSlot: string;
  value: number;
  result: "PASS" | "FAIL";
}

interface MesHeatmapProps {
  data: HeatmapData[];
  title?: string;
}

export function MesHeatmap({ data, title = "站點時間熱力圖" }: MesHeatmapProps) {
  const safeData = Array.isArray(data) ? data : [];

  // 生成模擬的熱力圖數據
  const generateHeatmapData = () => {
    const stations = ["FA_FT01", "FA_FT02", "ICT_01", "ICT_02", "FINAL_01"];
    const timeSlots = ["08:00", "10:00", "12:00", "14:00", "16:00", "18:00"];
    const mockData: HeatmapData[] = [];

    stations.forEach((station, stationIndex) => {
      timeSlots.forEach((time, timeIndex) => {
        const value = Math.floor(Math.random() * 100) + 10; // 10-110
        const result = Math.random() > 0.1 ? "PASS" : "FAIL";
        mockData.push({
          station,
          timeSlot: time,
          value,
          result
        });
      });
    });

    return mockData;
  };

  const heatmapData = safeData.length > 0 ? safeData : generateHeatmapData();
  const stations = Array.from(new Set(heatmapData.map(d => d.station)));
  const timeSlots = Array.from(new Set(heatmapData.map(d => d.timeSlot)));

  const getIntensity = (station: string, timeSlot: string) => {
    const item = heatmapData.find(d => d.station === station && d.timeSlot === timeSlot);
    return item ? item.value : 0;
  };

  const getColor = (intensity: number) => {
    if (intensity === 0) return "#f5f5f5";
    if (intensity < 20) return "#e3f2fd";
    if (intensity < 40) return "#bbdefb";
    if (intensity < 60) return "#90caf9";
    if (intensity < 80) return "#64b5f6";
    return "#2196f3";
  };

  return (
    <Card sx={{ height: "100%" }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
        <Box height={300} sx={{ overflowX: "auto" }}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: `120px repeat(${timeSlots.length}, 1fr)`,
              gap: 1,
              minWidth: 500,
              p: 2,
            }}
          >
            {/* 表頭 */}
            <Box />
            {timeSlots.map(time => (
              <Box
                key={time}
                sx={{
                  textAlign: "center",
                  fontWeight: "bold",
                  fontSize: "0.75rem",
                  p: 1,
                }}
              >
                {time}
              </Box>
            ))}

            {/* 熱力圖格子 */}
            {stations.map(station => [
              <Box
                key={`${station}-label`}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  fontSize: "0.75rem",
                  fontWeight: "bold",
                  px: 1,
                }}
              >
                {station}
              </Box>,
              ...timeSlots.map(time => {
                const intensity = getIntensity(station, time);
                return (
                  <Box
                    key={`${station}-${time}`}
                    sx={{
                      backgroundColor: getColor(intensity),
                      border: "1px solid #e0e0e0",
                      borderRadius: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.7rem",
                      fontWeight: "bold",
                      minHeight: 30,
                      cursor: "pointer",
                      "&:hover": {
                        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                        transform: "scale(1.05)",
                      },
                      transition: "all 0.2s",
                    }}
                    title={`${station} @ ${time}: ${intensity} 測試`}
                  >
                    {intensity}
                  </Box>
                );
              })
            ])}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

export default {
  MesResultPieChart,
  MesStationBarChart,
  MesTrendLineChart,
  MesHeatmap,
};