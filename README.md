# Material UI MES System

製造執行系統 (Manufacturing Execution System) - 基於 Material-UI v7 和 TypeScript 的現代化 Web 應用程式

## 技術棧

- **框架**: React 18 + TypeScript
- **建構工具**: Vite
- **UI 庫**: Material-UI (MUI) v7.1.0 - Google Material Design 3.0
- **路由**: React Router DOM v7.6.0
- **圖表**: @mui/x-charts v8.3.1 - MUI 原生圖表庫
- **表格**: @mui/x-data-grid + @mui/x-data-grid-pro v8.3.1
- **日期選擇器**: @mui/x-date-pickers v8.3.1
- **樣式**: Emotion + Tailwind CSS
- **資料儲存**: IndexedDB + localStorage (混合儲存策略)
- **狀態管理**: React Hooks (useState, useEffect, useMemo, useContext)

## 架構設計原則

### 關注點分離 (Separation of Concerns)
- **UI 組件層** (`components/`): 純展示邏輯，接收 props 並渲染 UI
- **業務邏輯層** (`hooks/`): 資料處理、狀態管理、副作用處理
- **工具函數層** (`utils/`): 純函數，可重用的計算邏輯
- **型別定義層** (`types/`): TypeScript 介面和型別定義

### Feature-based 模組化
每個功能模組都包含完整的四層結構：
```
feature/
├── components/    # UI 組件
├── hooks/         # 業務邏輯 Hooks
├── utils/         # 工具函數
└── types/         # 型別定義
```

### 資料流向
```
localStorage/API → Hooks (業務邏輯) → Utils (純函數) → Components (UI) → 使用者
```

## 專案結構

```
Material-UI-Mes/
├── src/
│   ├── features/                    # 功能模組 (Feature-based)
│   │   │
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
│   │   │   ├── hooks/
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
│   │       ├── ColorModeIconDropdown.tsx
│   │       ├── ColorModeSelect.tsx
│   │       ├── customizations/     # 組件自訂樣式
│   │       │   ├── dataDisplay.tsx
│   │       │   ├── feedback.tsx
│   │       │   ├── inputs.tsx
│   │       │   ├── navigation.tsx
│   │       │   └── surfaces.ts
│   │       └── themePrimitives.ts  # 主題基礎變數
│   │
│   ├── contexts/                   # React Context
│   │   └── LanguageContext.tsx     # 多語言支援
│   │
│   ├── utils/                      # 工具函數
│   │   └── MESDatabase.ts          # IndexedDB 封裝
│   │
│   ├── types/                      # TypeScript 類型定義
│   │   └── mes.ts
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
├── README.md                       # 專案說明文件 (本文件)
└── CLAUDE.md                       # 開發記錄
```

## 核心功能模組

### 1. Dashboard (儀表板) 📊

**UI 組件**:
- DashboardView - 主儀表板頁面
- StatCard - KPI 統計卡片
- DetailedStatsCard - 詳細統計卡片
- QuickFilters - 快速篩選組件

**業務邏輯 Hook**:
- `useDashboardData()` - 資料管理、日期篩選、統計計算

**工具函數**:
- `calculations.ts` - KPI、站別、機種、日期、複測統計
- `dateFilters.ts` - 快速篩選（今天、昨天、最近7天等）

**功能**:
- ✅ KPI 統計卡片：總測試數、測試良率、生產良率、復測數量
- ✅ 實時數據：從 IndexedDB 載入測試記錄
- ✅ 互動式圖表：測試趨勢折線圖、測試結果圓餅圖、站點表現長條圖
- ✅ 快速篩選：日期範圍、站別、機種、序號等多條件篩選
- ✅ 複測詳情清單：智能分析相同序號的多次 FAIL 測試記錄

### 2. Table (測試記錄檢視) 📋

**UI 組件**:
- TableView - MUI DataGrid Pro 表格

**業務邏輯 Hook**:
- `useTableData()` - 篩選、排序、分頁管理

**功能**:
- ✅ DataGrid Pro：企業級表格功能
- ✅ 進階功能：排序、篩選、分頁、欄位調整、欄寬拖拽
- ✅ 批量操作：CSV 匯出、LOG 下載
- ✅ 欄位顯示控制：勾選式介面控制各欄位顯示/隱藏
- ✅ 智能文字顯示：根據欄寬動態截斷文字，Tooltip 顯示完整內容
- ✅ 響應式設計：適配桌面和行動裝置

### 3. Logs (LOG 查詢系統) 🔍

**UI 組件**:
- LogQueryView - LOG 查詢頁面

**功能**:
- ✅ 多條件搜尋：工單號碼、序號、機種、站別、日期範圍
- ✅ 動態選單：機種和站別選單與 settings 頁面同步
- ✅ 快速下載：一鍵下載完整 LOG 檔案
- ✅ 響應式設計：標題列整合檔案資訊

### 4. AI Analysis (AI 分析系統) 🤖

**UI 組件**:
- AIAnalysisView - AI 失敗原因分析頁面

**功能**:
- ✅ 失敗原因預測：基於 LOG 內容的智能分類（9 大類）
- ✅ 智慧預標註：根據關鍵字規則預測分類
- ✅ 訓練資料管理：支援標註、批量預測
- ✅ 模型管理：版本控制、準確率監控
- ✅ 快速標註彈窗：AI 推薦項目特殊高亮

### 5. MTCCT (資料夾管理) 📁

**UI 組件**:
- MTCCTView - MTCCT 資料夾管理頁面

**功能**:
- ✅ 資料夾管理：掃描、顯示、批量下載
- ✅ 檔案操作：支援多種檔案格式
- ✅ 下載進度顯示：實時顯示下載進度

### 6. Settings (系統設定) ⚙️

**UI 組件**:
- SettingsView - 系統設定頁面
- UserPreferences - 用戶偏好設定

**功能**:
- ✅ 站別/機種管理：動態配置測試站點和機種
- ✅ 資料匯入：支援 JSON 和 LOG 檔案批量上傳、資料夾批量匯入
- ✅ 用戶偏好：儀表板佈局、外觀設定、通知設定
- ✅ JSON/LOG 自動配對：根據序號和時間戳自動配對檔案

## 共用資源層

### Hooks
- **useLocalStorage** - 統一管理 localStorage 讀寫

### Utils - Formatters
- `formatNumber()` - 千分位格式
- `formatPercentage()` - 百分比格式
- `formatFileSize()` - 檔案大小（B/KB/MB/GB）
- `formatDate()` - 日期/時間格式化
- `formatRelativeTime()` - 相對時間（幾秒前、幾分鐘前）
- `truncateText()` - 文字截斷

### Utils - Validators
- `isValidSerialNumber()` - 序號驗證
- `isValidWorkOrder()` - 工單格式驗證（XXXXXXXXXX-XXXXX）
- `isValidDateRange()` - 日期範圍驗證
- `isValidEmail()` - Email 驗證
- `isRequired()` - 必填欄位驗證

## 開始使用

### 安裝依賴

```bash
npm install
```

### 開發模式

```bash
npm run dev
```

應用將在 `http://localhost:5173` 啟動

### 建構生產版本

```bash
npm run build
```

### 預覽生產版本

```bash
npm run preview
```

### 類型檢查

```bash
tsc -b
```

## 資料儲存策略

### IndexedDB (主要儲存)
- **用途**: 測試記錄、LOG 檔案內容
- **容量**: 250MB - 1GB+
- **優勢**:
  - 高效能索引查詢
  - 支援大容量資料
  - 異步操作不阻塞 UI
  - 支援複雜查詢

**資料表設計**:
```javascript
// logFiles 表：儲存 LOG 檔案內容
{
  id: "序號_時間戳",
  serial: "CH510339000056304",
  fileName: "WA3-FixtureNumber[1]-20250911-153758-CH510339000056304[2].log",
  content: "完整LOG內容...",
  timestamp: Date,
  size: 檔案大小
}

// logMappings 表：儲存配對關係
{
  recordKey: "序號-時間-站別",
  serial: "CH510339000056304",
  fileName: "LOG檔案名稱",
  logId: "對應的logFiles.id"
}
```

### localStorage (備援儲存)
- **用途**: 設定值、用戶偏好、檔案名稱
- **容量**: 5-10MB
- **優勢**:
  - 相容性好
  - 快速存取
  - 同步操作

## 主題系統

支援淺色/深色主題切換，使用 MUI Theme Provider 管理：

- **主題配置**: `src/shared/theme/AppTheme.tsx`
- **自訂樣式**: `src/shared/theme/customizations/`
- **顏色模式**: 自動跟隨系統或手動切換
- **Material Design 3.0**: 完整支援最新設計規範

## 多語言支援

使用 `LanguageContext` 提供完整的多語言功能：

- **支援語言**: 繁體中文 (zh-TW)、英文 (en-US)
- **翻譯鍵值**: 471 個唯一鍵值（英文鍵值）
- **擴展方式**: 修改 `src/contexts/LanguageContext.tsx`
- **使用方式**: `const { t } = useLanguage(); t('home'); // "首頁"`

## 架構優勢

### ✅ 可維護性
- UI 和邏輯完全分離
- 修改邏輯不影響 UI，反之亦然
- 清晰的模組邊界

### ✅ 可重用性
- Utils 和 Hooks 可跨組件使用
- 減少重複程式碼
- 共用資源層統一管理

### ✅ 型別安全
- TypeScript 完整覆蓋所有層級
- 編譯時檢查錯誤
- 智能提示和自動補全

### ✅ 可測試性
- 純函數易於單元測試
- Hooks 可獨立測試
- 業務邏輯與 UI 分離便於測試

### ✅ 可擴展性
- 新功能遵循相同結構即可
- Feature-based 模組化設計
- 清晰的職責劃分

### ✅ 效能優化
- **虛擬滾動**: DataGrid 支援大量資料
- **按需載入**: 動態 import 組件
- **記憶體優化**: useMemo、useCallback 最佳化
- **IndexedDB 索引**: 快速查詢大量資料

## 檔案命名規範

| 類型 | 格式 | 範例 |
|------|------|------|
| 組件 | PascalCase.tsx | `DashboardView.tsx` |
| Hooks | useCamelCase.ts | `useDashboardData.ts` |
| Utils | camelCase.ts | `calculations.ts` |
| Types | index.ts | 統一匯出介面 |

## 開發指南

### 新增功能模組

1. 在 `src/features/` 建立新資料夾
2. 建立四層結構：`components/`, `hooks/`, `utils/`, `types/`
3. 在各層建立對應檔案和 `index.ts`
4. 在 `AppRouter.tsx` 新增路由

範例：
```bash
mkdir -p src/features/new-feature/{components,hooks,utils,types}
```

### 新增共用工具

1. 在 `src/shared/utils/` 新增工具函數
2. 在 `src/shared/utils/index.ts` 匯出
3. 在組件中使用：`import { formatNumber } from '@/shared/utils'`

### 新增型別定義

1. 在功能模組的 `types/index.ts` 定義
2. 或在 `src/shared/types/` 定義共用型別
3. 確保所有介面都有完整的 JSDoc 註解

## 貢獻指南

1. Fork 專案
2. 建立功能分支 (`git checkout -b feature/AmazingFeature`)
3. 遵循架構設計原則（UI/邏輯分離）
4. 確保 TypeScript 無錯誤（`tsc -b`）
5. 提交變更 (`git commit -m 'Add some AmazingFeature'`)
6. 推送到分支 (`git push origin feature/AmazingFeature`)
7. 開啟 Pull Request

## 版本歷史

### v2.2.0 (2025-10-02)
- ✅ 架構重構：UI/邏輯完全分離
- ✅ 建立完整的四層架構（components/hooks/utils/types）
- ✅ 新增共用資源層（shared/hooks, shared/utils）
- ✅ 多語言系統完善：英文鍵值、471 個翻譯
- ✅ 移除模擬資料、預覽功能
- ✅ Toast 通知系統優化

### v2.1.0 (2025-10-01)
- ✅ 儀表板複測詳情功能
- ✅ UI 樣式統一（Chip 組件標準化）
- ✅ 移除複測記錄獨立頁面

### v2.0.0 (2025-09-30)
- ✅ 完整 MUI v7 遷移
- ✅ Feature-based 架構重構
- ✅ TypeScript 完整支援

## License

本專案採用 MIT License

## 聯絡方式

如有問題或建議，請開啟 Issue 或聯絡開發團隊。

---

**Built with ❤️ using Material-UI and TypeScript**
