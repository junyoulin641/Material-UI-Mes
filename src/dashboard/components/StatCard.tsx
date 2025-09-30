import * as React from "react";
import { useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import { SparkLineChart } from "@mui/x-charts/SparkLineChart";
import { areaElementClasses } from "@mui/x-charts/LineChart";
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  TrendingFlat as TrendingFlatIcon,
} from '@mui/icons-material';

export type StatCardProps = {
  title: string;
  value: string;
  interval: string;
  trend: "up" | "down" | "neutral";
  data: number[];
  subtitle?: string;
  icon?: React.ReactNode;
  color?: 'primary' | 'success' | 'info' | 'warning' | 'error';
  chip?: {
    label: string;
    color?: 'primary' | 'success' | 'info' | 'warning' | 'error' | 'default';
    variant?: 'filled' | 'outlined';
  };
  trendValue?: string;
  dateRange?: {
    startDate: Date;
    endDate: Date;
  };
};

function getDaysInMonth(month: number, year: number) {
  const date = new Date(year, month, 0);
  const monthName = date.toLocaleDateString("en-US", {
    month: "short",
  });
  const daysInMonth = date.getDate();
  const days = [];
  let i = 1;
  while (days.length < daysInMonth) {
    days.push(`${monthName} ${i}`);
    i += 1;
  }
  return days;
}

function getDaysInRange(startDate: Date, endDate: Date) {
  const days = [];
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    const monthName = currentDate.toLocaleDateString("en-US", {
      month: "short",
    });
    const day = currentDate.getDate();
    days.push(`${monthName} ${day}`);
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return days;
}

function AreaGradient({ color, id }: { color: string; id: string }) {
  return (
    <defs>
      <linearGradient id={id} x1="50%" y1="0%" x2="50%" y2="100%">
        <stop offset="0%" stopColor={color} stopOpacity={0.3} />
        <stop offset="100%" stopColor={color} stopOpacity={0} />
      </linearGradient>
    </defs>
  );
}

export default function StatCard({
  title,
  value,
  interval,
  trend,
  data,
  subtitle,
  icon,
  color = 'primary',
  chip,
  trendValue,
  dateRange,
}: StatCardProps) {
  const theme = useTheme();

  // 如果有傳入日期範圍則使用動態計算，否則使用預設值
  const daysInWeek = dateRange
    ? getDaysInRange(dateRange.startDate, dateRange.endDate)
    : getDaysInMonth(4, 2024);

  const trendColors = {
    up:
      theme.palette.mode === "light"
        ? theme.palette.success.main
        : theme.palette.success.dark,
    down:
      theme.palette.mode === "light"
        ? theme.palette.error.main
        : theme.palette.error.dark,
    neutral:
      theme.palette.mode === "light"
        ? theme.palette.grey[400]
        : theme.palette.grey[700],
  };

  const labelColors = {
    up: "success" as const,
    down: "error" as const,
    neutral: "default" as const,
  };

  const trendLabelColor = labelColors[trend];
  const chartColor = trendColors[trend];
  const defaultTrendValues = { up: "+25%", down: "-25%", neutral: "+5%" };
  const finalTrendValue = trendValue || defaultTrendValues[trend];

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUpIcon fontSize="small" color="success" />;
      case 'down':
        return <TrendingDownIcon fontSize="small" color="error" />;
      case 'neutral':
        return <TrendingFlatIcon fontSize="small" color="action" />;
      default:
        return null;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return theme.palette.success.main;
      case 'down':
        return theme.palette.error.main;
      case 'neutral':
        return theme.palette.text.secondary;
      default:
        return theme.palette.text.secondary;
    }
  };

  return (
    <Card variant="outlined" sx={{ height: "100%", flexGrow: 1, cursor: 'pointer', transition: 'all 0.2s', '&:hover': { transform: 'translateY(-2px)', boxShadow: theme.shadows[4] } }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Typography variant="body2" color="text.secondary">
            {title}
          </Typography>
          {icon && (
            <Avatar
              sx={{
                bgcolor: theme.palette[color].main,
                width: 40,
                height: 40,
              }}
            >
              {icon}
            </Avatar>
          )}
        </Box>

        <Box mb={1}>
          <Typography variant="h4" component="div" fontWeight="bold">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </Typography>
        </Box>

        {subtitle && (
          <Typography variant="body2" color="text.secondary" mb={1}>
            {subtitle}
          </Typography>
        )}

        {chip && (
          <Box mb={2}>
            <Chip
              label={chip.label}
              size="small"
              color={chip.color || 'default'}
              variant={chip.variant || 'filled'}
            />
          </Box>
        )}

        <Typography variant="caption" sx={{ color: "text.secondary", mb: 1 }}>
          {interval}
        </Typography>

        <Box sx={{ width: "100%", height: 50 }}>
          <SparkLineChart
            color={chartColor}
            data={data}
            area
            showHighlight
            showTooltip
            xAxis={{
              scaleType: "band",
              data: daysInWeek,
            }}
            sx={{
              [`& .${areaElementClasses.root}`]: {
                fill: `url(#area-gradient-${value})`,
              },
            }}
          >
            <AreaGradient color={chartColor} id={`area-gradient-${value}`} />
          </SparkLineChart>
        </Box>
      </CardContent>
    </Card>
  );
}
