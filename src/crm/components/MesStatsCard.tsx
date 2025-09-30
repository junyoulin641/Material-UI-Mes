import * as React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Avatar from "@mui/material/Avatar";
import { useTheme } from "@mui/material/styles";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import TrendingFlatIcon from "@mui/icons-material/TrendingFlat";

export interface MesStatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  color?: "primary" | "secondary" | "success" | "error" | "warning" | "info";
  trend?: "up" | "down" | "flat";
  trendValue?: string;
  chip?: {
    label: string;
    color?: "primary" | "secondary" | "success" | "error" | "warning" | "info" | "default";
    variant?: "filled" | "outlined";
  };
  onClick?: () => void;
  sx?: object;
}

export default function MesStatsCard({
  title,
  value,
  subtitle,
  icon,
  color = "primary",
  trend,
  trendValue,
  chip,
  onClick,
  sx = {},
}: MesStatsCardProps) {
  const theme = useTheme();

  const getTrendIcon = () => {
    if (!trend) return null;

    switch (trend) {
      case "up":
        return <TrendingUpIcon fontSize="small" color="success" />;
      case "down":
        return <TrendingDownIcon fontSize="small" color="error" />;
      case "flat":
        return <TrendingFlatIcon fontSize="small" color="action" />;
      default:
        return null;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case "up":
        return theme.palette.success.main;
      case "down":
        return theme.palette.error.main;
      case "flat":
        return theme.palette.text.secondary;
      default:
        return theme.palette.text.secondary;
    }
  };

  return (
    <Card
      sx={{
        cursor: onClick ? "pointer" : "default",
        transition: "all 0.2s",
        "&:hover": onClick ? {
          transform: "translateY(-2px)",
          boxShadow: theme.shadows[4],
        } : {},
        height: "100%",
        ...sx,
      }}
      onClick={onClick}
    >
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
            {typeof value === "number" ? value.toLocaleString() : value}
          </Typography>
        </Box>

        {subtitle && (
          <Typography variant="body2" color="text.secondary" mb={1}>
            {subtitle}
          </Typography>
        )}

        <Box display="flex" justifyContent="space-between" alignItems="center">
          {(trend || trendValue) && (
            <Box display="flex" alignItems="center" gap={0.5}>
              {getTrendIcon()}
              {trendValue && (
                <Typography
                  variant="body2"
                  sx={{ color: getTrendColor(), fontWeight: 500 }}
                >
                  {trendValue}
                </Typography>
              )}
            </Box>
          )}

          {chip && (
            <Chip
              label={chip.label}
              size="small"
              color={chip.color || "default"}
              variant={chip.variant || "filled"}
            />
          )}
        </Box>
      </CardContent>
    </Card>
  );
}