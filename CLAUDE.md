# MES 系統開發記錄

## 專案概述
製造執行系統 (MES) - 基於 Material-UI v7 和 TypeScript 的現代化 Web 應用程式

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

## 專案結構 (Feature-based 架構)
```
Material-UI-Mes/
├── src/
│   ├── features/                    # 功能模組 (Feature-based)
│   │   ├── dashboard/              # 儀表板功能
│   │   │   ├── components/
│   │   │   │   ├── DashboardView.tsx        # 主儀表板頁面
│   │   │   │   ├── DetailedStatsCard.tsx    # 詳細統計卡片
│   │   │   │   ├── QuickFilters.tsx         # 快速篩選組件
│   │   │   │   ├── SimpleQuickFilters.tsx   # 簡化篩選組件
│   │   │   │   ├── StatCard.tsx             # KPI 統計卡片
│   │   │   │   └── index.ts                 # 統一匯出
│   │   │   ├── utils/              # Dashboard 工具函數
│   │   │   └── types/              # Dashboard 類型定義
│   │   │
│   │   ├── table/                  # 表格檢視功能
│   │   │   ├── components/
│   │   │   │   ├── TableView.tsx            # MUI DataGrid 表格
│   │   │   │   └── index.ts
│   │   │   ├── utils/
│   │   │   └── types/
│   │   │
│   │   ├── logs/                   # LOG 查詢功能
│   │   │   ├── components/
│   │   │   │   ├── LogQueryView.tsx         # LOG 查詢頁面
│   │   │   │   └── index.ts
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
│   ├── shared/                     # 共用資源
│   │   ├── theme/                  # MUI 主題配置
│   │   │   ├── AppTheme.tsx
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

## 最近更新記錄 (2025-10-01)

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