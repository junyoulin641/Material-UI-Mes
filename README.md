# Material UI MES System

製造執行系統 (Manufacturing Execution System) - 基於 Material-UI v7 和 TypeScript 的現代化 Web 應用程式

## 技術棧

- **框架**: React 18 + TypeScript
- **建構工具**: Vite
- **UI 庫**: Material-UI (MUI) v7.1.0
- **路由**: React Router DOM v7.6.0
- **圖表**: @mui/x-charts v8.3.1
- **表格**: @mui/x-data-grid + @mui/x-data-grid-pro v8.3.1
- **日期選擇器**: @mui/x-date-pickers v8.3.1
- **樣式**: Emotion + Tailwind CSS
- **資料儲存**: IndexedDB + localStorage

## 專案結構

```
src/
├── features/                    # 功能模組 (Feature-based)
│   ├── dashboard/              # 儀表板功能
│   │   ├── components/         # Dashboard 組件
│   │   │   ├── DashboardView.tsx
│   │   │   ├── DetailedStatsCard.tsx
│   │   │   ├── QuickFilters.tsx
│   │   │   ├── SimpleQuickFilters.tsx
│   │   │   ├── StatCard.tsx
│   │   │   └── index.ts        # 統一匯出
│   │   ├── utils/              # Dashboard 工具函數
│   │   └── types/              # Dashboard 類型定義
│   │
│   ├── table/                  # 表格檢視功能
│   │   ├── components/
│   │   │   ├── TableView.tsx
│   │   │   └── index.ts
│   │   ├── utils/
│   │   └── types/
│   │
│   ├── logs/                   # LOG 查詢功能
│   │   ├── components/
│   │   │   ├── LogQueryView.tsx
│   │   │   └── index.ts
│   │   ├── utils/
│   │   └── types/
│   │
│   ├── settings/               # 系統設定功能
│   │   ├── components/
│   │   │   ├── SettingsView.tsx
│   │   │   ├── UserPreferences.tsx
│   │   │   └── index.ts
│   │   ├── utils/
│   │   └── types/
│   │
│   ├── ai-analysis/            # AI 分析功能
│   │   ├── components/
│   │   │   ├── AIAnalysisView.tsx
│   │   │   └── index.ts
│   │   ├── utils/
│   │   └── types/
│   │
│   ├── mtcct/                  # MTCCT 管理功能
│   │   ├── components/
│   │   │   ├── MTCCTView.tsx
│   │   │   └── index.ts
│   │   ├── utils/
│   │   └── types/
│   │
│   └── common/                 # 共用功能組件
│       ├── components/
│       │   ├── AppRouter.tsx   # 主路由系統
│       │   ├── ToastSystem.tsx # 通知系統
│       │   └── index.ts
│       └── hooks/              # 共用 Hooks
│
├── shared/                     # 共用資源
│   ├── theme/                  # MUI 主題配置
│   │   ├── AppTheme.tsx
│   │   ├── ColorModeIconDropdown.tsx
│   │   ├── ColorModeSelect.tsx
│   │   ├── customizations/     # 組件自訂樣式
│   │   └── themePrimitives.ts  # 主題基礎變數
│   └── constants/              # 全域常數
│
├── contexts/                   # React Context
│   └── LanguageContext.tsx     # 多語言支援
│
├── utils/                      # 工具函數
│   └── MESDatabase.ts          # IndexedDB 封裝
│
├── types/                      # TypeScript 類型定義
│   └── mes.ts
│
├── assets/                     # 靜態資源
├── App.tsx                     # 根組件
├── main.tsx                    # 應用入口
└── vite-env.d.ts              # Vite 環境類型
```

## 核心功能

### 1. 儀表板 (Dashboard)
- **KPI 統計卡片**: 總測試數、測試良率、生產良率、復測數量
- **實時數據**: 從 IndexedDB 載入測試記錄
- **互動式圖表**:
  - 測試趨勢折線圖
  - 測試結果圓餅圖
  - 站點表現長條圖
- **快速篩選**: 日期範圍、站別、機種、序號等多條件篩選

### 2. 測試記錄 (Table View)
- **DataGrid Pro**: 企業級表格功能
- **進階功能**: 排序、篩選、分頁、欄位調整
- **批量操作**: CSV 匯出、LOG 下載
- **響應式設計**: 適配桌面和行動裝置

### 3. LOG 查詢 (Logs)
- **多條件搜尋**: 工單號碼、序號、機種、站別、日期範圍
- **LOG 預覽**: 可調整大小的內容預覽視窗
- **快速下載**: 一鍵下載完整 LOG 檔案

### 4. AI 分析 (AI Analysis)
- **失敗原因預測**: 基於 LOG 內容的智能分類
- **訓練資料管理**: 支援標註、批量預測
- **模型管理**: 版本控制、準確率監控

### 5. MTCCT 管理 (MTCCT)
- **資料夾管理**: 掃描、顯示、批量下載
- **檔案操作**: 支援多種檔案格式

### 6. 系統設定 (Settings)
- **站別/機種管理**: 動態配置測試站點和機種
- **資料匯入**: 支援 JSON 和 LOG 檔案批量上傳
- **用戶偏好**: 個人化設定介面

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

## 資料儲存

### IndexedDB
- **主要儲存**: 測試記錄、LOG 檔案內容
- **容量**: 250MB - 1GB+
- **優勢**: 高效能索引查詢、支援大容量資料

### localStorage
- **備援儲存**: 設定值、用戶偏好
- **容量**: 5-10MB
- **用途**: 相容性備援、快速存取設定

## 主題系統

支援淺色/深色主題切換，使用 MUI Theme Provider 管理：
- **主題配置**: `src/shared/theme/`
- **自訂樣式**: `src/shared/theme/customizations/`
- **顏色模式**: 自動跟隨系統或手動切換

## 多語言支援

使用 `LanguageContext` 提供多語言功能：
- **支援語言**: 繁體中文、英文
- **擴展方式**: 修改 `src/contexts/LanguageContext.tsx`

## 架構特色

### Feature-based 架構
- **模組化**: 每個功能獨立資料夾
- **可維護**: 清晰的職責劃分
- **可擴展**: 輕鬆新增功能模組

### TypeScript 支援
- **類型安全**: 完整的類型定義
- **智能提示**: 更好的開發體驗
- **錯誤預防**: 編譯時期錯誤檢查

### 效能優化
- **虛擬滾動**: DataGrid 支援大量資料
- **按需載入**: 動態 import 組件
- **記憶體優化**: useMemo、useCallback 最佳化

## 貢獻指南

1. Fork 專案
2. 建立功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交變更 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 開啟 Pull Request

## License

本專案採用 MIT License

## 聯絡方式

如有問題或建議，請開啟 Issue 或聯絡開發團隊。