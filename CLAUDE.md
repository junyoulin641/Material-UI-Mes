# MES 系統開發記錄

## 專案概述
製造執行系統 (MES) - 基於 Material-UI v7 和 TypeScript 的現代化 Web 應用程式

## 最新更新記錄 (2025-10-13)

### JSON 資料匯入修復與 IndexedDB 優化

#### 🐛 測試結果判定邏輯修復
- **問題描述**: 當 JSON 中 `Items` 欄位為空陣列時，即使 `"Test Result": "FAIL"`，系統仍錯誤判定為 PASS
- **根本原因**:
  - 舊邏輯只檢查 `Items` 陣列中是否有 FAIL 測項
  - 忽略了 JSON 頂層的 `Test Result` 欄位
- **修復方案** (SettingsView.tsx:116-125):
  ```typescript
  // 優先順序判定邏輯：
  // 1. 優先使用 JSON 中的 "Test Result" 欄位
  let testResult = rec['Test Result'] || rec['TestResult'] || rec['result'] || '';
  if (testResult) {
    out.result = String(testResult).toUpperCase() === 'FAIL' ? 'FAIL' : 'PASS';
  } else {
    // 2. 如果沒有 Test Result，才檢查 Items 陣列
    out.result = items.some((it: any) => String(it.result).toUpperCase() === 'FAIL') ? 'FAIL' : 'PASS';
  }
  ```
- **支援變體**: `Test Result`, `TestResult`, `result`（向後兼容）

#### 🗄️ IndexedDB 儲存可靠性提升
- **問題描述**: 儲存 LOG 檔案時發生重複鍵錯誤
  ```
  IndexedDB儲存失敗: WA3-FixtureNumber[1]-20251009-100327-CH570653100028002[1].log
  Error: Failed to save log file
  ```
- **根本原因**:
  - 使用 `store.add()` 當重複 ID 存在時會失敗
  - ID 生成只用 `serial_timestamp` 容易產生碰撞
- **修復方案** (MESDatabase.ts:84-104):
  ```typescript
  // 1. 更唯一的 ID 生成（加入隨機字串）
  const id = `${logFile.serial}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // 2. 使用 put 取代 add（允許覆蓋）
  const request = store.put(fullLogFile);

  // 3. 詳細錯誤日誌
  request.onerror = (event) => {
    const error = (event.target as IDBRequest).error;
    console.error('IndexedDB saveLogFile 錯誤:', error);
    reject(new Error(`Failed to save log file: ${error?.message || 'Unknown error'}`));
  };
  ```

#### 🌐 翻譯系統完善
- **問題描述**: `import.result.summary` 翻譯鍵缺失，導入結果顯示原始鍵值
- **修復內容**:
  - 新增 `import.result.summary` 中英文翻譯
  - 支援參數替換：`{json}`, `{log}`, `{paired}`, `{total}`
  - 中文: `'匯入完成！JSON 檔案：{json}，LOG 檔案：{log}，成功配對：{paired}，總記錄數：{total}'`
  - 英文: `'Import completed! JSON files: {json}, LOG files: {log}, Successfully paired: {paired}, Total records: {total}'`
- **相關檔案**: LanguageContext.tsx (648行, 1222行)

#### 📊 欄位映射完善（先前更新）
- **fixtureNumber 映射**: `FN:` / `FN` / `fn` → `fixtureNumber`
- **partNumber 映射**: `Part Number` / `PartNumber` / `part_number` → `partNumber`
- **Table 顯示**: 治具號和料號列已加入測試記錄表格

#### 🔧 修改檔案清單
1. **SettingsView.tsx** (116-125行)
   - 修復測試結果判定邏輯
   - 優先讀取 `Test Result` 欄位

2. **MESDatabase.ts** (84-104行)
   - IndexedDB `saveLogFile` 方法優化
   - 改用 `put()` 並增強 ID 唯一性

3. **LanguageContext.tsx** (648行, 1222行)
   - 新增 `import.result.summary` 翻譯鍵
   - 支援動態參數替換

4. **TableView.tsx** (之前更新)
   - 新增 fixtureNumber 和 partNumber 列顯示

#### ✅ 測試案例驗證
**測試 JSON**:
```json
{
  "Items": [],                          // ← 空陣列不影響判定
  "Test Result": "FAIL",                // ← 正確讀取此欄位 ✅
  "FN:": "M406C041",                    // ← 正確映射 ✅
  "Part Number": "WA3-001",             // ← 正確映射 ✅
  "Serial Number": "CH570653100032B06",
  "Station": "PCBA_FT1_PB",
  "Test Time": "2025-10-09 09:26:29"
}
```

**預期結果**:
- ✅ 測試結果：**FAIL**（正確判定）
- ✅ 治具號：**M406C041**（正確顯示）
- ✅ 料號：**WA3-001**（正確顯示）
- ✅ LOG 檔案：**成功儲存到 IndexedDB**
- ✅ 匯入通知：**完整顯示中英文訊息**

#### 📈 改善效益
- **資料準確性**: 測試結果判定不再因 Items 為空而錯誤
- **系統穩定性**: IndexedDB 儲存不再因重複鍵而失敗
- **用戶體驗**: 匯入結果訊息清晰完整
- **向後兼容**: 支援多種欄位命名變體

---

## 之前更新記錄 (2025-10-13)

### 登入頁面設計與主題色彩統一

#### 登入頁面多版本設計系統
- **版本管理**: 建立完整的登入頁面設計版本系統
  - `LoginPage_Version1.tsx`: 左右分欄商務版（保留）
  - `LoginPage_Version2.tsx`: Netflix 極簡深色版（紅黑配色）
  - `LoginPage_Version3.tsx`: Duolingo 趣味友善版（綠色系）
  - `LoginPage_Version4.tsx`: 全螢幕背景圖案版（保留）
  - `LoginPage_Version5.tsx`: 極簡優雅版 - 深青色 (#4a6670)
  - `LoginPage_Version6.tsx`: 極簡優雅版 - 深藍紫 (#2d3561)
  - `LoginPage_Version7.tsx`: 極簡優雅版 - 深灰藍 (#37474f)
  - `LoginPage_Version8.tsx`: 極簡優雅版 - 夢幻藍紫漸層 (#4a5fd6 to #6b46c1)

#### 登入頁面預覽系統
- **LoginPreview.tsx**: 設計切換預覽組件
  - 支援即時切換所有設計版本
  - 顯示每個版本的特色標籤（設計風格、配色方案、特殊功能）
  - 頂部控制區提供版本選擇按鈕
  - 當前版本資訊卡片展示設計描述

#### V5 極簡優雅設計確立
- **設計理念**: 基於用戶提供的參考圖片 (1.webp)
- **關鍵設計元素**:
  - 深色背景搭配純白 UI 元素
  - SVG Logo 搭配 glow 濾鏡效果 (`feGaussianBlur`)
  - 無邊框輸入框 (`variant="standard"`)，僅保留底線
  - 半透明按鈕配毛玻璃效果 (`backdropFilter: blur(10px)`)
  - 入場動畫 (`fadeInDown`, `fadeIn`)
  - 微妙的背景紋理 (徑向漸層疊加)
- **移除的元素**: 頂部導航列（Back to store, Sign Up）
- **新增的元素**:
  - 系統標題 "MES SYSTEM" 和副標題 "Manufacturing Execution"
  - 裝飾性分隔線
  - 測試帳號提示
  - 版權資訊

#### 色彩變體系統 (基於 V5)
- **設計模式**: 保持 V5 的佈局和 UI 元素，僅變更背景顏色
- **色彩方案**:
  - V5: `#4a6670` (深青色/深藍灰)
  - V6: `#2d3561` (深藍紫色)
  - V7: `#37474f` (深灰藍色)
  - V8: `linear-gradient(135deg, #4a5fd6 0%, #6b46c1 100%)` (夢幻藍紫漸層)
- **細節優化**: V8 使用更強的 glow 效果和更高的透明度營造夢幻氛圍

#### 主題色彩系統統一
- **問題**: 登入頁面使用 `#B5C3B2`（淺綠灰色），但主畫面為白色，視覺斷層
- **解決方案**: 統一主畫面背景色為登入頁面相同色調
- **修改檔案**: `src/shared/theme/themePrimitives.ts`
  - Light mode `background.default`: `#B5C3B2` (與登入頁相同)
  - Light mode `background.paper`: `#FFFFFF` (純白卡片保持對比)
  - 同時更新 `getDesignTokens()` 和 `colorSchemes.light` 兩處配置
- **視覺效果**: 登入頁到主畫面無縫過渡，白色卡片在綠灰背景上形成清晰層次

#### 技術實作細節
```typescript
// SVG Logo with Glow Effect
<svg width="70" height="70" viewBox="0 0 70 70">
  <defs>
    <filter id="glow8">
      <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  <path d="M18 52V18L35 30L52 18V52"
        stroke="white" strokeWidth="3.5"
        filter="url(#glow8)" opacity="0.95"/>
</svg>

// Material-UI Standard TextField (Borderless with Underline)
<TextField
  variant="standard"
  sx={{
    '& .MuiInput-root': {
      color: 'white',
      '&:before': { borderColor: 'rgba(255,255,255,0.4)' },
      '&:hover:not(.Mui-disabled):before': { borderColor: 'rgba(255,255,255,0.6)' },
      '&:after': { borderColor: 'white' }
    }
  }}
/>

// Glassmorphism Button
<Button
  sx={{
    bgcolor: 'rgba(255,255,255,0.2)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255,255,255,0.3)',
    '&:hover': {
      bgcolor: 'rgba(255,255,255,0.3)',
      boxShadow: '0 4px 20px rgba(255,255,255,0.2)',
      transform: 'translateY(-1px)'
    }
  }}
/>

// Theme Configuration
background: {
  default: "#B5C3B2", // 與登入頁相同的綠灰色
  paper: "#FFFFFF",   // 純白卡片，保持乾淨對比
}
```

#### 相關檔案
- `src/features/auth/components/LoginPage_Version1-8.tsx` - 8 個登入頁面設計版本
- `src/features/auth/components/LoginPreview.tsx` - 設計預覽切換系統
- `src/shared/theme/themePrimitives.ts` - 主題配置（背景色統一）

---

## 之前更新記錄 (2025-10-02)

### KPI 計算修復與熱力圖優化

#### KPI 卡片計算邏輯修復
- **修復「全站別模式」錯誤**: 原本邏輯會檢查設備是否通過資料集中的所有站別，導致錯誤的 0.0% 良率
- **正確邏輯**: 只檢查設備實際測試過的站別，每個站別取最後一筆測試結果
- **修復結果**: 測試良率和生產良率現在正確顯示實際數值
- **相關檔案**: `src/features/dashboard/utils/calculations.ts` (lines 51-85)

#### 儀表板多語言支援完善
- **修復翻譯問題**: 所有硬編碼的中文字串改用 `t()` 翻譯函數
- **涵蓋範圍**:
  - KPI 卡片標題和副標題（總測試數、測試良率、生產良率、復測次數）
  - 站別表現統計表格標題
  - 復測統計表格標題和欄位
- **新增翻譯鍵**:
  - `passed.devices`, `total.devices`, `pass.rate`, `passed.count`
  - `retest.pass.rate`, `daily.station.pass.rate.heatmap`, `no.data`
- **相關檔案**:
  - `src/features/dashboard/components/DashboardView.tsx` (lines 100-161, 924, 936-941)
  - `src/contexts/LanguageContext.tsx`

#### 每日站別良率熱力圖
- **新增視覺化圖表**: 取代原本的折線圖，使用熱力圖展示每日各站別良率
- **色彩編碼系統**:
  - 紅色 (#ef4444): 0-60% 良率
  - 橙色 (#f59e0b): 61-80% 良率
  - 淺綠 (#84cc16): 81-90% 良率
  - 深綠 (#10b981): 91-100% 良率
  - 灰色 (#e5e7eb): 無測試數據
- **數據處理優化**:
  - 無測試日期顯示為 `null` 而非 `0%`，避免誤導
  - 灰色格子顯示 "-" 表示該日無數據
  - 滑鼠懸停顯示完整資訊（站別 + 良率%）
- **UI 優化**:
  - 緊湊型設計：格子 40px 寬、2px 內距、0.6rem 字體
  - 懸停放大效果和過渡動畫
  - 全寬顯示（占整行）
  - 響應式水平滾動支援
- **相關檔案**:
  - `src/features/dashboard/utils/calculations.ts` (lines 451-497) - 計算函數
  - `src/features/dashboard/hooks/useDashboardData.ts` (line 141) - Hook 整合
  - `src/features/dashboard/components/DashboardView.tsx` (lines 701-824) - UI 實作

#### StatCard 組件簡化
- **移除趨勢 Chip**: 移除卡片右上角的百分比趨勢標籤，簡化視覺呈現
- **相關檔案**: `src/features/dashboard/components/StatCard.tsx` (lines 227-234)

#### 佈局優化
- **熱力圖位置調整**: 從「站別表現統計」後移至「機種測試統計」後
- **卡片寬度調整**: 從 50% 改為 100% 全寬顯示
- **移除拖曳功能**: 固定熱力圖佈局，避免顯示問題

---

### Dashboard UI/邏輯分離重構完成

#### 重構內容
- **完成 DashboardView.tsx 重構**: 移除所有業務邏輯（約700行），僅保留 UI 渲染程式碼
- **使用 useDashboardData Hook**: 一次性取得所有儀表板需要的資料
- **新增計算函數**:
  - `calculateFailureReasons()` - 失敗原因分析
  - `calculateRetestStats()` - 復測統計數據
- **移除重複程式碼**: 刪除 DashboardView.tsx 中的 chartData useMemo，改用 Hook 提供的 chartData
- **型別定義優化**: StatCardProps 移至 types/index.ts，遵循架構原則

#### 重構前後對比
**重構前 DashboardView.tsx (約1500行)**:
```typescript
// ❌ 業務邏輯全部混在組件中
const loadRealTestData = async () => { ... }  // 50行
const generateMockData = () => { ... }        // 25行
useEffect(() => { loadData() }, [])           // 30行
useEffect(() => { handleDataUpdate() }, [])   // 30行
const filteredData = useMemo(() => { ... })   // 50行
const retestRecords = useMemo(() => { ... })  // 60行
const detailedStationStats = useMemo(() => { ... })  // 25行
const modelStats = useMemo(() => { ... })     // 35行
const failureReasons = useMemo(() => { ... }) // 30行
const retestStats = useMemo(() => { ... })    // 60行
const stats = useMemo(() => { ... })          // 35行
const dailySeriesData = useMemo(() => { ... }) // 50行
const chartData = useMemo(() => { ... })      // 75行
```

**重構後 DashboardView.tsx (約1265行)**:
```typescript
// ✅ 一行程式碼取代所有業務邏輯
const {
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
} = useDashboardData(dashboardFilters);
```

#### 架構優勢
1. **關注點分離**: UI 組件只負責渲染，業務邏輯集中在 Hook
2. **可測試性**: 計算函數都是純函數，易於單元測試
3. **可重用性**: useDashboardData 可在其他組件中重用
4. **可維護性**: 邏輯修改只需改 Hook 或 Utils，不影響 UI
5. **型別安全**: TypeScript 介面定義清晰，IDE 提示完整

#### 檔案結構
```
dashboard/
├── components/
│   └── DashboardView.tsx        # 純 UI 組件 (1265行)
├── hooks/
│   └── useDashboardData.ts      # 業務邏輯 Hook (158行)
├── utils/
│   └── calculations.ts          # 計算函數 (280行)
└── types/
    └── index.ts                 # 型別定義 (93行)
```

#### 技術實作細節
**calculations.ts 新增函數**:
```typescript
// 失敗原因分析 - 統計測項失敗率
export function calculateFailureReasons(records: TestRecord[]) {
  const testItemStats = new Map<string, { total: number, failed: number }>();
  // ... 統計邏輯
  return Array.from(testItemStats.entries())
    .map(([testName, stats]) => ({ reason, count, total, failureRate }))
    .filter(item => item.count > 0)
    .sort((a, b) => b.failureRate - a.failureRate)
    .slice(0, 10);
}

// 復測統計 - 分析序號多次測試情況
export function calculateRetestStats(records: TestRecord[]) {
  const retestData = new Map<string, { originalCount, retestCount, finalPassCount }>();
  // ... 分組和統計邏輯
  return Array.from(retestData.entries())
    .map(([station, data]) => ({ station, retestRate, retestPassRate, ... }))
    .filter(item => item.retestCount > 0)
    .sort((a, b) => b.retestRate - a.retestRate);
}
```

**useDashboardData.ts 資料流程**:
```typescript
export function useDashboardData(filters: SimpleFilterOptions) {
  // 1. 載入原始資料
  useEffect(() => {
    const db = await getMESDatabase();
    const records = await db.getAllTestRecords();
    setAllRecords(records);
  }, []);

  // 2. 根據篩選條件過濾
  const filteredData = useMemo(() => { ... }, [allRecords, filters]);

  // 3. 計算所有統計資料
  const stats = useMemo(() => calculateKPI(filteredData), [filteredData]);
  const detailedStationStats = useMemo(() => calculateStationStats(...), [...]);
  const modelStats = useMemo(() => calculateModelStats(...), [...]);
  const failureReasons = useMemo(() => calculateFailureReasons(filteredData), [filteredData]);
  const retestStats = useMemo(() => calculateRetestStats(filteredData), [filteredData]);
  const retestRecords = useMemo(() => calculateRetestRecords(filteredData), [filteredData]);
  const dailySeriesData = useMemo(() => calculateDailyStats(...), [...]);

  // 4. 返回所有計算結果
  return { filteredData, stats, chartData, ... };
}
```

#### 效能優化
- **useMemo 快取**: 所有計算結果都使用 useMemo 快取，避免重複計算
- **精確依賴**: 每個 useMemo 只依賴真正需要的資料，減少不必要的重新計算
- **一次性載入**: 資料從 IndexedDB 載入一次，後續只做記憶體過濾和計算

#### 未來擴展
基於此架構可輕鬆擴展：
- 新增更多統計維度：只需在 calculations.ts 加入新函數
- 新增篩選條件：只需修改 useDashboardData 的過濾邏輯
- 新增 KPI 卡片：只需在 DashboardView.tsx 的 data 陣列加入新項目
- 建立其他 Dashboard：直接重用 useDashboardData Hook

---

## 技術棧
- **前端**: React 18 + TypeScript
- **建構工具**: Vite
- **UI 框架**: Material-UI (MUI) v7.1.0 - Google Material Design 3.0
- **狀態管理**: React Hooks (useState, useEffect, useMemo, useContext)
- **資料儲存**: IndexedDB + localStorage (混合儲存策略)
- **圖表組件**: @mui/x-charts v8.3.1 - MUI 原生圖表庫
- **表格組件**: @mui/x-data-grid + @mui/x-data-grid-pro v8.3.1 - 企業級資料表格
- **日期選擇器**: @mui/x-date-pickers v8.3.1
- **路由**: React Router DOM v7.6.0
- **樣式**: Emotion + Tailwind CSS
- **主題系統**: MUI Theme Provider + 自訂主題配置

## 專案結構 (Feature-based 架構 + UI/邏輯分離)
```
Material-UI-Mes/
├── src/
│   ├── features/                    # 功能模組 (Feature-based)
│   │   ├── dashboard/              # 儀表板功能
│   │   │   ├── components/         # UI 組件層
│   │   │   │   ├── DashboardView.tsx        # 主儀表板頁面
│   │   │   │   ├── DetailedStatsCard.tsx    # 詳細統計卡片
│   │   │   │   ├── QuickFilters.tsx         # 快速篩選組件
│   │   │   │   ├── SimpleQuickFilters.tsx   # 簡化篩選組件
│   │   │   │   ├── StatCard.tsx             # KPI 統計卡片
│   │   │   │   └── index.ts                 # 統一匯出
│   │   │   ├── hooks/              # 業務邏輯層
│   │   │   │   ├── useDashboardData.ts      # 資料管理 Hook
│   │   │   │   └── index.ts
│   │   │   ├── utils/              # 工具函數
│   │   │   │   ├── calculations.ts          # 統計計算函數
│   │   │   │   ├── dateFilters.ts           # 日期篩選函數
│   │   │   │   └── index.ts
│   │   │   └── types/              # 型別定義
│   │   │       └── index.ts                 # Dashboard 介面定義
│   │   │
│   │   ├── table/                  # 表格檢視功能
│   │   │   ├── components/
│   │   │   │   ├── TableView.tsx            # MUI DataGrid 表格
│   │   │   │   └── index.ts
│   │   │   ├── hooks/
│   │   │   │   └── useTableData.ts          # 表格資料管理 Hook
│   │   │   ├── utils/
│   │   │   └── types/
│   │   │       └── index.ts                 # Table 介面定義
│   │   │
│   │   ├── logs/                   # LOG 查詢功能
│   │   │   ├── components/
│   │   │   │   ├── LogQueryView.tsx         # LOG 查詢頁面
│   │   │   │   └── index.ts
│   │   │   ├── hooks/
│   │   │   ├── utils/
│   │   │   └── types/
│   │   │       └── index.ts                 # Logs 介面定義
│   │   │
│   │   ├── mtcct/                  # MTCCT 資料夾管理
│   │   │   ├── components/
│   │   │   │   ├── MTCCTView.tsx
│   │   │   │   └── index.ts
│   │   │   ├── hooks/
│   │   │   ├── utils/
│   │   │   └── types/
│   │   │       └── index.ts                 # MTCCT 介面定義
│   │   │
│   │   ├── ai-analysis/            # AI 分析功能
│   │   │   ├── components/
│   │   │   │   ├── AIAnalysisView.tsx
│   │   │   │   └── index.ts
│   │   │   ├── hooks/
│   │   │   ├── utils/
│   │   │   └── types/
│   │   │
│   │   ├── settings/               # 系統設定功能
│   │   │   ├── components/
│   │   │   │   ├── SettingsView.tsx         # 系統設定頁面
│   │   │   │   ├── UserPreferences.tsx      # 用戶偏好設定
│   │   │   │   └── index.ts
│   │   │   ├── utils/
│   │   │   └── types/
│   │   │
│   │   ├── ai-analysis/            # AI 分析功能
│   │   │   ├── components/
│   │   │   │   ├── AIAnalysisView.tsx       # AI 失敗原因分析
│   │   │   │   └── index.ts
│   │   │   ├── utils/
│   │   │   └── types/
│   │   │
│   │   ├── mtcct/                  # MTCCT 管理功能
│   │   │   ├── components/
│   │   │   │   ├── MTCCTView.tsx            # MTCCT 資料夾管理
│   │   │   │   └── index.ts
│   │   │   ├── utils/
│   │   │   └── types/
│   │   │
│   │   └── common/                 # 共用功能組件
│   │       ├── components/
│   │       │   ├── AppRouter.tsx            # 主路由和導航系統
│   │       │   ├── ToastSystem.tsx          # MUI 通知系統
│   │       │   └── index.ts
│   │       └── hooks/              # 共用 Hooks
│   │
│   ├── shared/                     # 共用資源層
│   │   ├── hooks/                  # 共用自定義 Hooks
│   │   │   ├── useLocalStorage.ts           # LocalStorage Hook
│   │   │   └── index.ts
│   │   │
│   │   ├── utils/                  # 共用工具函數
│   │   │   ├── formatters.ts                # 格式化函數（數字、日期、檔案大小）
│   │   │   ├── validators.ts                # 驗證函數（序號、工單、Email）
│   │   │   └── index.ts
│   │   │
│   │   ├── types/                  # 共用型別定義
│   │   │
│   │   └── theme/                  # MUI 主題配置
│   │       ├── AppTheme.tsx
│   │   │   ├── ColorModeIconDropdown.tsx
│   │   │   ├── ColorModeSelect.tsx
│   │   │   ├── customizations/     # 組件自訂樣式
│   │   │   │   ├── dataDisplay.tsx
│   │   │   │   ├── feedback.tsx
│   │   │   │   ├── inputs.tsx
│   │   │   │   ├── navigation.tsx
│   │   │   │   └── surfaces.ts
│   │   │   └── themePrimitives.ts  # 主題基礎變數
│   │   └── constants/              # 全域常數
│   │
│   ├── contexts/                   # React Context
│   │   └── LanguageContext.tsx     # 多語言支援 Context
│   │
│   ├── utils/                      # 工具函數
│   │   └── MESDatabase.ts          # IndexedDB 封裝
│   │
│   ├── types/                      # TypeScript 類型定義
│   │   └── mes.ts                  # MES 系統類型
│   │
│   ├── assets/                     # 靜態資源
│   ├── App.tsx                     # 根組件
│   ├── main.tsx                    # 應用入口
│   └── vite-env.d.ts              # Vite 環境類型
│
├── public/                         # 公開靜態資源
├── package.json                    # 專案依賴配置
├── tsconfig.json                   # TypeScript 配置
├── vite.config.ts                  # Vite 配置
├── README.md                       # 專案說明文件
└── CLAUDE.md                       # 開發記錄 (本文件)
```

## 架構設計原則

### 1. 關注點分離 (Separation of Concerns)
- **UI 組件層** (`components/`): 純展示邏輯，接收 props 並渲染 UI
- **業務邏輯層** (`hooks/`): 資料處理、狀態管理、副作用處理
- **工具函數層** (`utils/`): 純函數，可重用的計算邏輯
- **型別定義層** (`types/`): TypeScript 介面和型別定義

### 2. Feature-based 模組化
每個功能模組都包含完整的四層結構：
```
feature/
├── components/    # UI 組件
├── hooks/         # 業務邏輯 Hooks
├── utils/         # 工具函數
└── types/         # 型別定義
```

### 3. 共用資源層 (Shared Layer)
- **hooks/**: 跨模組使用的自定義 Hooks（如 `useLocalStorage`）
- **utils/**: 通用工具函數（格式化、驗證）
- **types/**: 共用型別定義
- **theme/**: MUI 主題配置

### 4. 資料流向
```
localStorage/API → Hooks → Components → UI
                     ↓
                   Utils (純函數處理)
```

### 5. 檔案命名規範
- **組件**: PascalCase (例: `DashboardView.tsx`)
- **Hooks**: camelCase with `use` prefix (例: `useDashboardData.ts`)
- **Utils**: camelCase (例: `calculations.ts`, `formatters.ts`)
- **Types**: index.ts 統一匯出

### 6. 優點
- ✅ **可維護性**: 邏輯和 UI 分離，易於修改和測試
- ✅ **可重用性**: Utils 和 Hooks 可在多個組件間共用
- ✅ **型別安全**: TypeScript 完整覆蓋，減少執行時錯誤
- ✅ **可擴展性**: 新功能只需新增對應的 feature 模組
- ✅ **團隊協作**: 清晰的結構降低溝通成本

## 已完成功能

### 1. 核心功能
- ✅ **儀表板檢視**: KPI 卡片、測試結果分析圖表、趨勢分析
- ✅ **資料表格檢視**: 測試資料瀏覽、分頁、搜尋、篩選
- ✅ **系統設定**: 站點管理、資料匯入、用戶偏好
- ✅ **響應式佈局**: 支援桌面、平板和行動裝置

### 2. 圖表與分析 (MUI X-Charts)
- ✅ **圓餅圖**: PASS/FAIL 比例顯示 (PieChart)
- ✅ **長條圖**: 各站點測試數量統計 (BarChart)
- ✅ **趨勢線圖**: 測試數量和良率隨時間變化 (LineChart)
- ✅ **互動式圖表**:
  - 鼠標懸停數據提示
  - 圖例切換顯示/隱藏
  - 響應式圖表尺寸調整
  - 雙 Y 軸支援（數量 + 百分比）

### 3. 搜尋與篩選
- ✅ **基本篩選**: 站點、日期範圍、序號關鍵字
- ✅ **進階搜尋**: 多條件組合搜尋 (序號+站點+結果+工單)
- ✅ **快速篩選**: 日期範圍快選（昨天、上週、上月等）
- ✅ **即時搜尋**: 實時更新搜尋結果

### 4. 個人化功能
- ✅ **用戶偏好設定**:
  - 儀表板顯示設定（KPI 卡片、圖表佈局）
  - 資料顯示設定（分頁數量、自動刷新）
  - 外觀設定（緊湊模式、動畫效果）
  - 通知設定（Toast 類型、自動隱藏時間）

### 5. 額外功能
- ✅ **MTCCT 資料夾管理**: 資料夾掃描、顯示、批量下載
- ✅ **Toast 通知系統**: MUI Snackbar + Alert 實作
- ✅ **資料匯出**: CSV 格式匯出（支援站別分離）
- ✅ **主題系統**: 淺色/深色主題切換

### 6. LOG 查詢系統
- ✅ **多條件搜尋**: 工單號碼、序號、機種、站別、日期範圍篩選
- ✅ **預覽功能**: 可調整大小的 LOG 內容預覽視窗
- ✅ **動態選單**: 機種和站別選單與 settings 頁面同步
- ✅ **響應式設計**: 手機版垂直排列
- ✅ **用戶體驗**: 滑鼠懸停顯示完整內容、一鍵下載

### 7. AI 失敗原因分析系統
- ✅ **智慧預標註**: 根據 LOG 內容自動預測失敗原因
- ✅ **訓練資料管理**: 支援快速標註、批量預測、資料集管理
- ✅ **模型訓練模擬**: 準確率監控、分類統計、版本管理
- ✅ **9 大失敗分類**: 電池、通訊、硬體、軟體、校正、溫度、電源、感測器、其他

### 8. IndexedDB 大容量儲存系統
- ✅ **企業級資料庫**: 使用 IndexedDB 儲存 LOG 檔案內容
- ✅ **混合儲存策略**: IndexedDB (大容量) + localStorage (備援)
- ✅ **容量提升**: 從 5-10MB 提升到 250MB-1GB+
- ✅ **高效查詢**: 索引優化、按需載入、異步操作

## 最近更新記錄 (2025-09-30)

### 🏗️ 專案架構完全重構 - Feature-based Architecture

#### 🎯 架構說明

本專案採用 **Feature-based Architecture**（功能導向架構），而非傳統的 MVVM 架構。

**Feature-based vs MVVM 對比**：

| 特性 | MVVM | Feature-based (本專案) |
|------|------|----------------------|
| 組織方式 | 按技術層級（Model/View/ViewModel） | 按業務功能（Dashboard/Table/Settings） |
| 檔案位置 | 所有 Model 集中、所有 View 集中 | 每個功能的 Model/View/Logic 放一起 |
| 優勢 | 技術層級清晰 | 高內聚、低耦合、易維護 |
| 適用場景 | 小型專案、單一功能 | 大型專案、多功能模組 |

**為什麼選擇 Feature-based？**
- ✅ **高內聚**: Dashboard 的所有相關檔案（組件、邏輯、類型）集中在一起
- ✅ **低耦合**: 功能模組之間互不干擾，修改 Dashboard 不影響 Table
- ✅ **易擴展**: 新增功能只需新增一個資料夾
- ✅ **易維護**: 找檔案更直覺，開發效率更高
- ✅ **團隊協作**: 多人可同時開發不同功能模組，減少衝突

#### 📁 新資料夾結構
```
src/features/
├── dashboard/       # 儀表板功能模組（內含 View、Logic、Types）
├── table/          # 表格檢視功能模組
├── logs/           # LOG 查詢功能模組
├── settings/       # 系統設定功能模組
├── ai-analysis/    # AI 分析功能模組
├── mtcct/          # MTCCT 管理功能模組
└── common/         # 共用組件模組（AppRouter、ToastSystem）
```

#### 🗑️ 清理工作
- **移除未使用範例**: blog, checkout, crm, marketing-page, sign-in, sign-up, dashboard 範例
- **統一主題目錄**: shared-theme/ → shared/theme/
- **移除舊組件**: src/components/ 整個目錄已遷移到 features/ 結構

#### 🔄 組件遷移對應表

| 原始檔案 (src/components/) | 新位置 (src/features/) | 狀態 |
|---------------------------|----------------------|------|
| CompleteMesDashboard.tsx | dashboard/components/DashboardView.tsx | ✅ 已遷移 |
| DetailedStatsCard.tsx | dashboard/components/DetailedStatsCard.tsx | ✅ 已遷移 |
| QuickFilters.tsx | dashboard/components/QuickFilters.tsx | ✅ 已遷移 |
| SimpleQuickFilters.tsx | dashboard/components/SimpleQuickFilters.tsx | ✅ 已遷移 |
| StatCard.tsx | dashboard/components/StatCard.tsx | ✅ 已遷移 |
| EnhancedTableView.tsx | table/components/TableView.tsx | ✅ 已遷移 |
| SystemSettings.tsx | settings/components/SettingsView.tsx | ✅ 已遷移 |
| UserPreferences.tsx | settings/components/UserPreferences.tsx | ✅ 已遷移 |
| EnhancedLogQuery.tsx | logs/components/LogQueryView.tsx | ✅ 已遷移 |
| AIAnalysisSystem.tsx | ai-analysis/components/AIAnalysisView.tsx | ✅ 已遷移 |
| MTCCTManagement.tsx | mtcct/components/MTCCTView.tsx | ✅ 已遷移 |
| AppRouter.tsx | common/components/AppRouter.tsx | ✅ 已遷移 |
| ToastSystem.tsx | common/components/ToastSystem.tsx | ✅ 已遷移 |

#### 🔧 Import 路徑更新規則

所有 import 路徑已按照新架構更新：

```typescript
// ✅ 正確的 import 路徑範例

// 1. 從 feature 組件 import Context
import { useLanguage } from '../../../contexts/LanguageContext';

// 2. 從 feature 組件 import Utils
import { getMESDatabase } from '../../../utils/MESDatabase';

// 3. 從 feature 組件 import 共用組件
import { useToast } from '../../common/components/ToastSystem';
import { useNavigation } from '../../common/components/AppRouter';

// 4. 同功能模組內的組件
import StatCard from './StatCard';
import SimpleQuickFilters from './SimpleQuickFilters';
```

#### 📦 統一匯出機制

每個功能模組都有 `index.ts` 統一匯出：

```typescript
// features/dashboard/components/index.ts
export { default as DashboardView } from './DashboardView';
export { default as StatCard } from './StatCard';
export { default as DetailedStatsCard } from './DetailedStatsCard';
export { default as QuickFilters } from './QuickFilters';
export { default as SimpleQuickFilters } from './SimpleQuickFilters';
```

#### 📚 學習資源建立

為初學 React 的工程師建立完整學習文件：

1. **REACT_LEARNING_GUIDE.md** (738 行)
   - React 核心概念完整解說
   - Hooks 實戰範例（useState、useEffect、useMemo、useCallback）
   - Material-UI 使用指南
   - 常見問題 FAQ
   - 實戰練習題

2. **COMPONENT_GUIDE.md** (458 行)
   - DashboardView 大型組件深度剖析
   - TableView 資料表格詳解
   - SettingsView 表單處理說明
   - 實戰練習建議

3. **LEARNING_ROADMAP.md** (400 行)
   - 4-6 週結構化學習路徑
   - 每週學習目標和檢查點
   - 常見錯誤和解決方案
   - Debug 技巧
   - 學習筆記模板

#### 🎓 程式碼註解增強

為關鍵檔案新增詳細中文註解（超過 2000 行註解）：

1. **App.tsx** - 根組件，解釋 Context Provider 洋蔥式結構
2. **LanguageContext.tsx** - 完整 Context API 實作範例
3. **ToastSystem.tsx** (400+ 行註解) - 全域通知系統詳解
4. **AppRouter.tsx** (622 行註解) - 路由和導航系統完整說明
5. **StatCard.tsx** (427 行註解) - 展示型組件範例
6. **SimpleQuickFilters.tsx** (647 行註解) - 複雜表單處理

#### 🎯 架構優化效益

**開發效率**：
- ✅ 找檔案更快：功能相關檔案集中在一起
- ✅ 減少認知負擔：不需在多個資料夾間跳轉
- ✅ 新增功能簡單：複製資料夾模板即可

**程式碼品質**：
- ✅ 職責清晰：每個功能模組獨立負責
- ✅ 易於測試：功能模組可獨立測試
- ✅ 減少耦合：模組間依賴明確

**團隊協作**：
- ✅ 並行開發：多人同時開發不同功能
- ✅ 減少衝突：修改侷限在單一模組內
- ✅ Code Review 簡單：變更範圍清晰

---

## 之前更新記錄

### 2025-09-30 - 檔案替換和 Import 路徑修復

#### 📥 檔案更新來源
從 `/mnt/c/Users/jim.lin/Desktop/mes/Material UI Mes/src/components/` 複製最新版本組件檔案，替換到新的 feature-based 架構。

#### 🔄 替換的檔案列表（13 個組件）
1. AppRouter.tsx → features/common/components/
2. ToastSystem.tsx → features/common/components/
3. CompleteMesDashboard.tsx → features/dashboard/components/DashboardView.tsx
4. DetailedStatsCard.tsx → features/dashboard/components/
5. QuickFilters.tsx → features/dashboard/components/
6. SimpleQuickFilters.tsx → features/dashboard/components/
7. StatCard.tsx → features/dashboard/components/
8. EnhancedTableView.tsx → features/table/components/TableView.tsx
9. SystemSettings.tsx → features/settings/components/SettingsView.tsx
10. UserPreferences.tsx → features/settings/components/
11. EnhancedLogQuery.tsx → features/logs/components/LogQueryView.tsx
12. AIAnalysisSystem.tsx → features/ai-analysis/components/AIAnalysisView.tsx
13. MTCCTManagement.tsx → features/mtcct/components/MTCCTView.tsx

#### 🔧 批量修復 Import 路徑
修復了 7 個檔案中的所有錯誤 import 路徑：
- ✅ DetailedStatsCard.tsx
- ✅ QuickFilters.tsx
- ✅ SimpleQuickFilters.tsx
- ✅ TableView.tsx
- ✅ LogQueryView.tsx
- ✅ UserPreferences.tsx
- ✅ SettingsView.tsx

**修復規則**：
```typescript
// Context import
from '../contexts/LanguageContext'
  → from '../../../contexts/LanguageContext'

// Utils import
from '../utils/MESDatabase'
  → from '../../../utils/MESDatabase'

// Common components import
from './ToastSystem'
  → from '../../common/components/ToastSystem'

from './AppRouter'
  → from '../../common/components/AppRouter'
```

#### ✅ 驗證結果
- 檔案總數：13 個 .tsx 組件檔案
- Import 路徑：全部修復完成
- 資料夾結構：符合 feature-based 架構
- 準備狀態：可正常編譯執行

---

### 2025-09-23 之前更新記錄

#### 組件遷移 (2025-09-30 第一次)
1. **Dashboard 組件**:
   - 新增 StatCard.tsx (增強型 KPI 卡片)
   - 保留 DetailedStatsCard.tsx, QuickFilters.tsx, SimpleQuickFilters.tsx

2. **Table 組件**:
   - EnhancedTableView.tsx → TableView.tsx

3. **Logs 組件**:
   - EnhancedLogQuery.tsx → LogQueryView.tsx

4. **Settings 組件**:
   - SystemSettings.tsx → SettingsView.tsx
   - 保留 UserPreferences.tsx

5. **AI Analysis 組件**:
   - AIAnalysisSystem.tsx → AIAnalysisView.tsx

6. **MTCCT 組件**:
   - MTCCTManagement.tsx → MTCCTView.tsx

7. **Common 組件**:
   - 保留 AppRouter.tsx, ToastSystem.tsx

#### ✅ Import 路徑更新
- **全面檢查**: 所有功能模組的 import 語句
- **路徑修正**:
  - contexts: `'../../../contexts/[ContextName]'`
  - utils: `'../../../utils/[UtilName]'`
  - common components: `'../../common/components/[ComponentName]'`
  - 同模組組件: `'./[ComponentName]'`
- **統一匯出**: 每個 components 資料夾都有 index.ts

#### 📦 Index 匯出檔案
建立統一匯出機制，簡化 import：
```typescript
// features/dashboard/components/index.ts
export { default as DashboardView } from './DashboardView';
export { default as DetailedStatsCard } from './DetailedStatsCard';
export { default as StatCard } from './StatCard';
// ...
```

#### 📝 文檔更新
- **README.md**: 完整的專案結構說明、功能介紹、使用指南
- **CLAUDE.md**: 詳細的開發記錄、架構變更說明

#### 🛠️ 技術實作亮點
- **TypeScript 類型安全**: 完整的類型定義和類型檢查
- **Feature 模組模式**: 每個功能獨立 components/utils/types 結構
- **統一匯出機制**: index.ts 簡化 import 路徑
- **相對路徑規範**: 明確的 import 路徑層級

### 使用者體驗提升
- **清晰的檔案組織**: 開發者可快速定位組件位置
- **模組化開發**: 獨立開發和測試各功能模組
- **可擴展架構**: 輕鬆新增新功能模組
- **維護性提升**: 降低組件間的耦合度

## 架構設計理念

### Feature-based vs Layer-based
傳統的 Layer-based 架構將組件按類型分類（components/, utils/, types/），而 Feature-based 架構按功能劃分模組。優勢：

1. **高內聚**: 相關功能的代碼集中在一起
2. **低耦合**: 模組之間依賴關係清晰
3. **易擴展**: 新增功能只需新增資料夾
4. **易維護**: 修改功能不會影響其他模組
5. **團隊協作**: 不同團隊可獨立開發不同模組

### Import 路徑策略
- **絕對路徑 vs 相對路徑**: 使用相對路徑保持模組獨立性
- **統一匯出**: index.ts 提供乾淨的 API 介面
- **分層清晰**: 從組件位置可清楚看出依賴層級

### TypeScript 類型管理
- **功能類型**: 放在各功能模組的 types/ 資料夾
- **共用類型**: 放在 src/types/ 資料夾
- **類型匯出**: 通過 index.ts 統一匯出

## 技術特色

### Material-UI v7 整合
- **最新版本**: 使用 MUI v7.1.0 和 Material Design 3.0
- **主題系統**: 完整的主題自訂和顏色模式切換
- **組件庫**: DataGrid Pro, X-Charts, Date Pickers 等企業級組件
- **響應式**: 完美的桌面和行動裝置適配

### TypeScript 支援
- **完整類型**: 所有組件和函數都有類型定義
- **類型安全**: 編譯時期錯誤檢查
- **智能提示**: VSCode 完整的 IntelliSense 支援
- **重構友好**: 重命名和移動檔案自動更新引用

### 效能優化
- **虛擬滾動**: DataGrid 支援大量資料渲染
- **記憶體優化**: useMemo, useCallback 避免不必要的重渲染
- **按需載入**: 動態 import 減少初始載入時間
- **IndexedDB**: 大容量資料儲存不影響效能

### 開發體驗
- **Vite**: 極快的開發伺服器和 HMR
- **ESLint**: 程式碼品質檢查
- **Prettier**: 統一的程式碼格式
- **Feature 模組**: 清晰的組件組織

## 已知問題與待優化項目

### 待開發功能
- [ ] 測試覆蓋率提升（單元測試、整合測試）
- [ ] 國際化完善（更多語言支援）
- [ ] 離線模式支援（PWA）
- [ ] 資料備份與還原功能
- [ ] 進階權限管理系統
- [ ] 自訂報表生成器

### 效能優化
- [ ] 大量資料渲染優化
- [ ] 圖表渲染效能提升
- [ ] IndexedDB 查詢優化
- [ ] Bundle 大小優化

### 用戶體驗
- [ ] 載入狀態優化
- [ ] 錯誤處理完善
- [ ] 無障礙功能增強
- [ ] 行動裝置體驗優化

## 開發注意事項

### 新增功能模組
1. 在 `src/features/` 建立新資料夾
2. 建立 `components/`, `utils/`, `types/` 子資料夾
3. 建立 `components/index.ts` 統一匯出
4. 在 `AppRouter.tsx` 新增路由
5. 更新 README.md 和 CLAUDE.md

### 組件開發規範
- 使用 TypeScript 並提供完整類型
- 使用 MUI 組件而非原生 HTML 元素
- 遵循 React Hooks 最佳實踐
- 提供 PropTypes 或 TypeScript interface
- 使用 useMemo 和 useCallback 優化效能

### Import 規範
- 優先使用相對路徑
- 從 index.ts 匯入組件
- 避免循環依賴
- 按功能分組 import

### 樣式規範
- 使用 MUI sx prop 而非 inline style
- 使用 MUI theme 變數
- 保持響應式設計
- 遵循 Material Design 準則

## API 接口設計 (待實作)

### LOG 查詢 API
```typescript
// POST /api/search-logs
interface SearchLogsRequest {
  workOrder?: string;
  serialNumber?: string;
  station?: string;
  model?: string;
  dateFrom?: string;
  dateTo?: string;
}

interface SearchLogsResponse {
  success: boolean;
  data: LogRecord[];
  total: number;
}
```

### 測試記錄 API
```typescript
// GET /api/test-records
interface GetTestRecordsRequest {
  page: number;
  pageSize: number;
  filters?: TestRecordFilters;
}

interface GetTestRecordsResponse {
  success: boolean;
  data: TestRecord[];
  total: number;
  page: number;
  pageSize: number;
}
```

## 部署指南

### 建構生產版本
```bash
npm run build
```

### 預覽生產版本
```bash
npm run preview
```

### Docker 部署 (待完成)
```dockerfile
# Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 5173
CMD ["npm", "run", "preview"]
```

## 最近更新記錄 (2025-10-02)

### 程式架構重構 - UI/邏輯分離

#### 🏗️ 架構重構完成
- **設計原則**: 關注點分離 (Separation of Concerns)
- **四層架構**:
  1. **components/** - UI 組件層（純展示邏輯）
  2. **hooks/** - 業務邏輯層（資料處理、狀態管理）
  3. **utils/** - 工具函數層（純函數、可重用邏輯）
  4. **types/** - 型別定義層（TypeScript 介面）

#### 📦 新建檔案結構

**Dashboard 模組**:
- `types/index.ts` - 完整型別定義（TestRecord, KPIData, StationStats, ModelStats, DailyStats, RetestRecord 等）
- `hooks/useDashboardData.ts` - 資料管理 Hook（載入、篩選、統計計算）
- `utils/calculations.ts` - 統計計算函數（KPI、站別、機種、日期、複測統計）
- `utils/dateFilters.ts` - 日期篩選工具（快速篩選、日期範圍）

**Table 模組**:
- `types/index.ts` - Table 型別定義（TableFilters, ColumnVisibility, SortConfig）
- `hooks/useTableData.ts` - 表格資料管理（篩選、排序、分頁）

**Logs 模組**:
- `types/index.ts` - LOG 查詢型別定義（LogQueryFilters, LogRecord）

**MTCCT 模組**:
- `types/index.ts` - MTCCT 型別定義（MTCCTFolder, MTCCTFile）

**共用資源層 (Shared)**:
- `shared/hooks/useLocalStorage.ts` - LocalStorage 管理 Hook
- `shared/utils/formatters.ts` - 格式化工具（數字、百分比、檔案大小、日期）
- `shared/utils/validators.ts` - 驗證工具（序號、工單、Email、日期範圍）

#### 🔄 資料流向設計
```
localStorage/API → Hooks (業務邏輯) → Utils (純函數) → Components (UI) → 使用者
```

#### ✨ 架構優勢
- **可維護性**: 邏輯和 UI 完全分離，修改容易且不互相影響
- **可重用性**: Utils 和 Hooks 可在多個組件間共用
- **型別安全**: TypeScript 完整覆蓋所有層級
- **可測試性**: 純函數易於單元測試
- **可擴展性**: 新增功能只需遵循相同結構

#### 📋 檔案命名規範
- 組件: `PascalCase.tsx` (DashboardView.tsx)
- Hooks: `useCamelCase.ts` (useDashboardData.ts)
- Utils: `camelCase.ts` (calculations.ts, formatters.ts)
- Types: `index.ts` 統一匯出

---

### 多語言系統完善與預設資料清理

#### 🌍 多語言鍵值標準化
- **英文鍵值轉換**: 將所有翻譯鍵從中文改為英文，符合 i18n 最佳實踐
  - 原本: `'首頁': '首頁'`, `'儀表板': '儀表板'`
  - 改為: `'home': '首頁'`, `'dashboard': '儀表板'`
- **重複鍵值清理**: 移除 23 個重複的翻譯鍵
- **遺漏鍵值補全**: 新增 128 個缺失的翻譯鍵
- **完整覆蓋**: 確保所有組件使用的 `t()` 函數都有對應的翻譯定義

#### 🗑️ 模擬資料移除
- **LOG 查詢系統**:
  - 移除 `generateLogData()` 函數（原產生 200 筆模擬資料）
  - 移除 `generateLogContent()` 函數（模擬 LOG 內容）
  - `logs` state 初始值改為空陣列 `[]`
- **MTCCT 資料夾管理**:
  - `MOCK_FOLDERS` 和 `MOCK_FILES` 已設為空陣列
  - 移除 `handleScanFolders()` 中的模擬資料夾生成邏輯
  - 等待後端 API 整合實際掃描功能

#### 🎨 UI 預覽功能移除
- **LOG Query System**:
  - 移除預覽對話框 (Dialog) 組件
  - 移除 `previewOpen`, `selectedLog`, `previewSize` state
  - 移除 `handleViewLog` 函數和預覽按鈕
  - 保留下載功能
- **MTCCT Management**:
  - 移除資料夾詳情對話框
  - 移除 `selectedFolder`, `files`, `detailsOpen` state
  - 移除 `handleFolderClick` 和 `handleDownloadFile` 函數
  - 移除「查看」按鈕，只保留「下載」功能
  - 清理未使用的 imports（Dialog, ListItem, Tooltip, IconButton 等）

#### 🔔 通知系統優化
- **Toast 重疊問題修復**:
  - 從個別 Snackbar 定位改為 Flexbox 容器佈局
  - 添加 `gap: '12px'` 實現垂直堆疊
  - Alert variant 從 `outlined` 改為 `filled` 提升視覺效果
  - 設定 `pointerEvents: 'none'` 在容器，`'auto'` 在項目上

#### 🐛 MUI X-Charts 警告修復
- **BarChart Legend Props**:
  - 移除不支援的 props: `itemMarkWidth`, `itemMarkHeight`, `markGap`, `itemGap`
  - 保留有效 props: `direction`, `position`, `padding`
  - 解決 React DOM 元素屬性警告

#### 📋 翻譯鍵值統計
- **zh-TW**: 471 個唯一鍵值
- **en-US**: 469 個唯一鍵值
- **無重複鍵值**
- **所有使用的鍵值都已定義**

#### 🔧 技術改進
- **localStorage 依賴降低**: 準備遷移到後端 API
- **型別安全**: 所有翻譯鍵使用 TypeScript 型別檢查
- **程式碼清理**: 移除所有未使用的模擬資料函數
- **效能優化**: 減少不必要的 state 和計算

---

## 更新記錄 (2025-10-01)

### 儀表板複測詳情功能優化

#### 🎯 複測詳情清單卡片
- **新增功能**: 在儀表板添加「複測詳情清單」卡片，與「最近測試記錄」並排顯示
- **智能分析**: 自動識別相同序號的多次 FAIL 測試記錄
- **失敗測項顯示**: 從 `record.items` 陣列提取並顯示所有失敗測項名稱
- **複測次數統計**:
  - 藍色標籤：1次複測
  - 橘色標籤：2次複測
  - 紅色標籤：3次以上複測
- **互動功能**:
  - 點擊序號或資訊圖示按鈕開啟詳細彈窗
  - 序號文字可點擊，滑鼠懸停顯示底線
  - Tooltip 顯示完整序號和失敗測項

#### 📋 複測詳細資訊彈窗
- **基本資訊區塊**:
  - 序號、機種、站別
  - 複測次數（帶顏色的 Chip 標籤）
- **失敗測項區塊**:
  - 以 Chip 標籤顯示所有唯一的失敗測項
  - 紅色 outlined 樣式突顯失敗項目
- **測試歷史記錄表格**:
  - 完整的時間序列測試記錄
  - 顯示每次測試的站別、結果、失敗測項
  - 失敗測項以小型 Chip 標籤顯示

#### 🗑️ 功能簡化
- **移除複測記錄頁面**: 移除側邊欄的「複測記錄」導航項目
- **原因**: 儀表板的複測詳情清單已提供完整功能，獨立頁面變得冗餘
- **ViewType 更新**: 從 `'dashboard' | 'table' | 'logs' | 'mtcct' | 'ai' | 'retest' | 'settings' | 'help'` 簡化為 `'dashboard' | 'table' | 'logs' | 'mtcct' | 'ai' | 'settings' | 'help'`

#### 🎨 UI 樣式統一 - Chip 組件標準化
- **變更原則**: 將所有彩色底白字改為白底彩色字（outlined 樣式）
- **影響範圍**:
  - ✅ DashboardView.tsx - 儀表板所有 Chip 組件
  - ✅ TableView.tsx - 表格檢視結果 Chip
  - ✅ DetailedStatsCard.tsx - 詳細統計卡片
  - ✅ LogQueryView.tsx - LOG 查詢結果
  - ✅ ToastSystem.tsx - 通知系統 Alert
- **樣式變更**: `variant="filled"` → `variant="outlined"`
- **優點**:
  - 更符合 Material Design 3.0 規範
  - 視覺上更簡潔清晰
  - 減少視覺疲勞
  - 提升整體一致性

#### 📊 資料處理邏輯
- **複測記錄計算**:
  ```typescript
  // 1. 篩選 FAIL 記錄
  const failedRecords = filteredData.filter(record => record.result === 'FAIL');

  // 2. 按序號分組
  const serialNumberGroups = new Map<string, any[]>();

  // 3. 收集失敗測項
  sortedRecords.forEach(record => {
    if (record.items && Array.isArray(record.items)) {
      const failedItems = record.items.filter(item => item.result === 'FAIL');
      allFailedItems.push(...failedItems.map(item => item.name));
    }
  });

  // 4. 去重並排序
  const uniqueFailedItems = [...new Set(allFailedItems)].sort();
  ```

#### 🔧 技術實作
- **狀態管理**:
  - `detailDialogOpen` - 控制彈窗開關
  - `selectedRetestRecord` - 儲存選中的複測記錄
- **組件引入**: Dialog, DialogTitle, DialogContent, DialogActions, InfoIcon
- **效能優化**: 使用 useMemo 緩存複測記錄計算結果

## 版本歷史

### v2.1.0 (2025-10-01)
- 🎯 新增儀表板複測詳情清單功能
- 📋 實作複測詳細資訊彈窗
- 🗑️ 移除冗餘的複測記錄獨立頁面
- 🎨 統一所有 Chip 組件為 outlined 樣式
- 🧹 優化 UI 一致性和視覺設計

### v2.0.0 (2025-09-30)
- 🎉 專案架構完全重構為 Feature-based Architecture
- 🗑️ 移除所有未使用的範例程式碼
- 📦 建立統一的 index.ts 匯出機制
- 📝 更新完整的專案文檔

### v1.x (2025-09-25)
- 🎨 完成 Material-UI v7 遷移
- 📊 整合 MUI X-Charts 圖表系統
- 📋 整合 MUI X-DataGrid Pro 表格
- 🎯 實作完整的 MES 系統功能

---

*最後更新: 2025-10-01 - 複測詳情功能優化與 UI 樣式統一*