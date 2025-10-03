/**
 * StatCard.tsx - 統計數據卡片組件
 *
 * 這個檔案展示：
 * 1. MUI Card 組件的使用（卡片式佈局）
 * 2. MUI X-Charts 的 SparkLineChart（迷你趨勢圖）
 * 3. SVG 漸層效果的實作
 * 4. useTheme Hook 存取主題配色
 * 5. TypeScript Props 的詳細定義
 *
 * StatCard 用途：
 * - 顯示關鍵績效指標（KPI）
 * - 展示數據趨勢（上升/下降/持平）
 * - 視覺化歷史數據（迷你圖表）
 *
 * 學習概念：MUI Card, MUI X-Charts, SVG Gradient, Theme, Props Design
 */

// ===== Import 區塊 =====

// React 核心
import * as React from "react";

// MUI 主題系統
import { useTheme } from "@mui/material/styles";  // 取得當前主題（包含顏色、間距等）

// MUI 組件
import Box from "@mui/material/Box";                    // 萬用容器
import Card from "@mui/material/Card";                  // 卡片容器
import CardContent from "@mui/material/CardContent";    // 卡片內容區域
import Chip from "@mui/material/Chip";                  // 標籤組件（顯示趨勢百分比）
import Stack from "@mui/material/Stack";                // 堆疊佈局（簡化 Flexbox）
import Typography from "@mui/material/Typography";      // 文字顯示組件

// MUI X-Charts：圖表庫
import { SparkLineChart } from "@mui/x-charts/SparkLineChart";  // 迷你折線圖
import { areaElementClasses } from "@mui/x-charts/LineChart";   // 圖表樣式類別

// ===== TypeScript 類型定義 =====

// 從 types 匯入型別定義
import type { StatCardProps } from '../types';

// ===== 輔助函數 =====

/**
 * getDaysInMonth - 生成月份的日期標籤
 *
 * @param {number} month - 月份（1-12）
 * @param {number} year - 年份
 * @returns {string[]} - 日期標籤陣列（例如：['Apr 1', 'Apr 2', ...]）
 *
 * 這個函數用於生成圖表的 X 軸標籤
 * 例如：getDaysInMonth(4, 2024) 返回 ['Apr 1', 'Apr 2', ..., 'Apr 30']
 *
 * 實作細節：
 * - new Date(year, month, 0) 會取得上個月的最後一天
 * - date.getDate() 取得該月份的天數
 * - 使用 while 迴圈生成所有日期標籤
 */
function getDaysInMonth(month: number, year: number) {
  const date = new Date(year, month, 0);
  const monthName = date.toLocaleDateString("en-US", {
    month: "short",  // 簡短月份名稱（Jan, Feb, Mar...）
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

// ===== SVG 漸層組件 =====

/**
 * AreaGradient - 建立 SVG 線性漸層定義
 *
 * @param {string} color - 漸層顏色
 * @param {string} id - 唯一 ID（供圖表引用）
 *
 * 這個組件建立一個從上到下漸層消失的填充效果
 * - 頂部：30% 不透明度
 * - 底部：完全透明
 *
 * SVG linearGradient 說明：
 * - x1, y1, x2, y2: 定義漸層方向（50%, 0% 到 50%, 100% 表示垂直漸層）
 * - stop: 漸層的顏色停止點
 * - stopOpacity: 該停止點的不透明度
 *
 * 使用方式：
 * <AreaGradient color="#ff0000" id="my-gradient" />
 * 然後在 CSS 中引用：fill: url(#my-gradient)
 */
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

// ===== 主要組件 =====

/**
 * StatCard - 統計卡片組件
 *
 * 這個組件展示單一 KPI 指標，包含：
 * - 標題和數值
 * - 趨勢指示（Chip 標籤）
 * - 迷你趨勢圖（SparkLineChart）
 * - 可選的圖示
 *
 * 使用範例：
 * ```tsx
 * <StatCard
 *   title="總測試數"
 *   value="1,234"
 *   interval="最近 7 天"
 *   trend="up"
 *   trendValue="+12%"
 *   data={[100, 120, 115, 134, 168, 132, 200]}
 * />
 * ```
 */
export default function StatCard({
  title,
  value,
  subtitle,
  interval,
  trend,
  trendValue,
  data,
  icon,
  color = 'primary',  // 預設顏色為主題主色
  chip,
  dateRange,
}: StatCardProps) {
  // ===== Hooks =====

  /**
   * useTheme - 取得當前主題物件
   *
   * theme 物件包含：
   * - palette: 顏色配置（primary, secondary, success, error 等）
   * - spacing: 間距函數（例如 theme.spacing(2) = 16px）
   * - breakpoints: 響應式斷點
   * - typography: 字型設定
   */
  const theme = useTheme();

  // 生成日期標籤（用於圖表 X 軸）
  const daysInWeek = getDaysInMonth(4, 2024);

  // ===== 顏色計算 =====

  /**
   * trendColors - 根據趨勢方向和主題模式選擇圖表顏色
   *
   * 為什麼需要區分 light/dark 模式？
   * - 淺色主題使用 .main 色（較鮮明）
   * - 深色主題使用 .dark 色（較柔和，避免刺眼）
   *
   * palette.success: 成功色（通常是綠色）
   * palette.error: 錯誤色（通常是紅色）
   * palette.grey: 灰階色
   */
  const trendColors = {
    up:
      theme.palette.mode === "light"
        ? theme.palette.success.main     // 淺色模式：鮮明綠色
        : theme.palette.success.dark,    // 深色模式：柔和綠色
    down:
      theme.palette.mode === "light"
        ? theme.palette.error.main       // 淺色模式：鮮明紅色
        : theme.palette.error.dark,      // 深色模式：柔和紅色
    neutral:
      theme.palette.mode === "light"
        ? theme.palette.grey[400]        // 淺色模式：中灰色
        : theme.palette.grey[700],       // 深色模式：深灰色
  };

  /**
   * labelColors - Chip 標籤的顏色
   *
   * 'as const' 的作用：
   * - 告訴 TypeScript 這是字面值類型，不是一般的 string
   * - 確保類型為 "success" | "error" | "default"
   * - 符合 MUI Chip 的 color prop 要求
   */
  const labelColors = {
    up: "success" as const,
    down: "error" as const,
    neutral: "default" as const,
  };

  // ===== 顯示值計算 =====

  const chipColor = labelColors[trend];        // Chip 的顏色
  const chartColor = trendColors[trend];       // 圖表的顏色
  const defaultTrendValues = { up: "0%", down: "0%", neutral: "0%" };  // 預設趨勢值（無資料時顯示 0%）
  const displayTrendValue = trendValue || defaultTrendValues[trend];  // 顯示的趨勢值（優先使用傳入的值）

  return (
    <Card variant="outlined" sx={{ height: "100%", flexGrow: 1 }}>
      <CardContent>
        <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "flex-start", mb: 1 }}>
          <Typography component="h2" variant="subtitle2" gutterBottom>
            {title}
          </Typography>
          {icon && (
            <Box sx={{ color: `${color}.main` }}>
              {icon}
            </Box>
          )}
        </Stack>
        <Stack
          direction="column"
          sx={{ justifyContent: "space-between", flexGrow: "1", gap: 1 }}
        >
          <Stack sx={{ justifyContent: "space-between" }}>
            <Stack
              direction="row"
              sx={{ justifyContent: "space-between", alignItems: "center" }}
            >
              <Typography variant="h4" component="p">
                {value}
              </Typography>
            </Stack>
            {subtitle && (
              <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
                {subtitle}
              </Typography>
            )}
            <Typography variant="caption" sx={{ color: "text.secondary", mt: 0.5 }}>
              {interval}
            </Typography>
          </Stack>
          <Box sx={{ width: "100%", height: 50 }}>
            <SparkLineChart
              color={[chartColor]}
              data={data}
              area
              showHighlight
              showTooltip
              xAxis={{
                scaleType: "band",
                data: Array.from(
                  { length: data.length },
                  (_, i) => `Day ${i + 1}`,
                ),
              }}
              sx={{
                [`& .${areaElementClasses.root}`]: {
                  fill: `url(#area-gradient-${title.replace(/\s+/g, "-").toLowerCase()})`,
                },
              }}
            >
              <AreaGradient color={chartColor} id={`area-gradient-${value}`} />
            </SparkLineChart>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

/**
 * ========================================
 * 學習重點總結
 * ========================================
 *
 * 1. MUI Card 組件
 *    - Card: 卡片容器（有陰影、圓角）
 *    - variant="outlined": 使用邊框樣式而非陰影
 *    - CardContent: 卡片的內容區域（有內距）
 *
 * 2. MUI Stack 組件
 *    - Stack: Flexbox 的簡化版
 *    - direction="row": 水平排列
 *    - direction="column": 垂直排列（預設）
 *    - justifyContent: 主軸對齊
 *    - alignItems: 交叉軸對齊
 *    - gap: 子元素間距
 *
 * 3. MUI Chip 組件
 *    - 用於顯示標籤或狀態
 *    - size="small": 小尺寸
 *    - color: 主題顏色（success, error, info 等）
 *    - label: 顯示的文字
 *
 * 4. MUI X-Charts SparkLineChart
 *    - 迷你折線圖（用於趨勢展示）
 *    - area: 顯示面積填充
 *    - showHighlight: 顯示游標高亮
 *    - showTooltip: 顯示數據提示
 *    - colors: 圖表顏色陣列
 *    - xAxis: X 軸配置
 *
 * 5. useTheme Hook
 *    - 存取當前主題物件
 *    - theme.palette: 顏色配置
 *    - theme.palette.mode: 'light' 或 'dark'
 *    - 根據主題模式調整顏色
 *
 * 6. SVG 漸層
 *    - <defs>: SVG 定義區塊
 *    - <linearGradient>: 線性漸層
 *    - <stop>: 漸層停止點
 *    - stopOpacity: 不透明度
 *    - 使用 url(#id) 引用漸層
 *
 * 7. TypeScript 'as const'
 *    - 將類型縮窄為字面值
 *    - "success" as const → 類型為 "success"
 *    - 而不是 string
 *    - 確保類型安全
 *
 * 8. Props 設計模式
 *    - 必填 vs 可選屬性（?）
 *    - 預設值（= 'primary'）
 *    - 巢狀物件類型（chip, dateRange）
 *    - 聯合類型（'up' | 'down' | 'neutral'）
 *
 * 9. MUI sx prop
 *    - height: "100%": 填滿父容器高度
 *    - flexGrow: 1: 彈性成長
 *    - color: `${color}.main`: 模板字串存取主題色
 *    - mt, mb: margin-top, margin-bottom 簡寫
 *
 * 10. 條件渲染
 *     - {icon && <Box>{icon}</Box>}: 有 icon 才顯示
 *     - {subtitle && <Typography>}: 有 subtitle 才顯示
 *     - chip ? <Chip /> : <Chip />: 三元運算子
 *
 * ========================================
 * 卡片結構說明
 * ========================================
 *
 * ```
 * <Card>
 *   <CardContent>
 *     <Stack> (標題列)
 *       <Typography> 標題
 *       <Box> 圖示（可選）
 *     </Stack>
 *
 *     <Stack> (內容區)
 *       <Stack> (數值和趨勢)
 *         <Typography> 主要數值
 *         <Chip> 趨勢標籤
 *         <Typography> 副標題（可選）
 *         <Typography> 時間區間
 *       </Stack>
 *
 *       <Box> (趨勢圖)
 *         <SparkLineChart>
 *           <AreaGradient> SVG 漸層
 *         </SparkLineChart>
 *       </Box>
 *     </Stack>
 *   </CardContent>
 * </Card>
 * ```
 *
 * ========================================
 * 下一步學習建議
 * ========================================
 *
 * 1. 學習更多 MUI X-Charts
 *    - BarChart: 長條圖
 *    - PieChart: 圓餅圖
 *    - LineChart: 完整折線圖
 *    - ScatterChart: 散點圖
 *
 * 2. 深入 MUI 主題系統
 *    - 建立自訂主題
 *    - 覆寫組件預設樣式
 *    - 使用主題變數
 *    - 響應式主題
 *
 * 3. SVG 進階技巧
 *    - 路徑動畫
 *    - 遮罩效果
 *    - 濾鏡效果
 *    - 互動式 SVG
 *
 * 4. 效能優化
 *    - useMemo 記憶化計算結果
 *    - React.memo 避免不必要渲染
 *    - 延遲載入圖表數據
 *
 * 5. 可重用組件設計
 *    - Props 設計原則
 *    - 預設值策略
 *    - 組件組合模式
 *    - Render Props 模式
 */