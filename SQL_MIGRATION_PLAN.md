# MES 系統 SQL 資料庫遷移計劃

## 📋 目標
將現有的前端 IndexedDB + localStorage 儲存方案遷移至完整的 **前後端分離架構**：
```
[React 前端] <---> [後端 API 伺服器] <---> [SQL 資料庫]
```

---

## 🏗️ 架構設計

### 1. 技術棧選擇

#### 後端技術
- **Runtime**: Node.js 18+ (或 Bun 1.0+)
- **框架**: Express.js 或 Fastify
- **語言**: TypeScript
- **ORM**: Prisma (推薦) 或 TypeORM
- **資料庫**: PostgreSQL (推薦) 或 MySQL 8.0+

#### 前端調整
- **HTTP Client**: axios
- **狀態管理**: React Query (TanStack Query) 用於 API 快取和狀態管理
- **環境變數**: Vite 的 `import.meta.env`

---

## 📊 資料庫架構設計

### Schema 設計

```sql
-- 測試記錄主表
CREATE TABLE test_records (
    id BIGSERIAL PRIMARY KEY,
    serial_number VARCHAR(100) NOT NULL,
    work_order VARCHAR(100),
    station VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    test_time TIMESTAMP NOT NULL,
    result VARCHAR(20) NOT NULL, -- PASS/FAIL
    tester VARCHAR(100),
    fixture_number VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_serial (serial_number),
    INDEX idx_station (station),
    INDEX idx_model (model),
    INDEX idx_test_time (test_time),
    INDEX idx_result (result),
    INDEX idx_work_order (work_order)
);

-- 測試項目明細表
CREATE TABLE test_items (
    id BIGSERIAL PRIMARY KEY,
    record_id BIGINT NOT NULL,
    item_name VARCHAR(200) NOT NULL,
    item_value TEXT,
    result VARCHAR(20), -- PASS/FAIL/SKIP
    unit VARCHAR(50),
    spec_lower DECIMAL(20,6),
    spec_upper DECIMAL(20,6),

    FOREIGN KEY (record_id) REFERENCES test_records(id) ON DELETE CASCADE,
    INDEX idx_record_id (record_id),
    INDEX idx_item_name (item_name)
);

-- LOG 檔案表
CREATE TABLE log_files (
    id BIGSERIAL PRIMARY KEY,
    serial_number VARCHAR(100) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    content TEXT NOT NULL, -- 完整 LOG 內容
    file_size BIGINT,
    upload_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_serial (serial_number),
    INDEX idx_file_name (file_name)
);

-- LOG 配對關係表
CREATE TABLE log_mappings (
    id BIGSERIAL PRIMARY KEY,
    record_id BIGINT NOT NULL,
    log_id BIGINT NOT NULL,

    FOREIGN KEY (record_id) REFERENCES test_records(id) ON DELETE CASCADE,
    FOREIGN KEY (log_id) REFERENCES log_files(id) ON DELETE CASCADE,
    UNIQUE(record_id, log_id),
    INDEX idx_record_id (record_id),
    INDEX idx_log_id (log_id)
);

-- 站別設定表
CREATE TABLE stations (
    id SERIAL PRIMARY KEY,
    station_name VARCHAR(100) UNIQUE NOT NULL,
    display_order INT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 機種設定表
CREATE TABLE models (
    id SERIAL PRIMARY KEY,
    model_name VARCHAR(100) UNIQUE NOT NULL,
    display_order INT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 用戶表（未來擴充）
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user', -- admin/user
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- AI 標註資料表
CREATE TABLE ai_annotations (
    id BIGSERIAL PRIMARY KEY,
    record_id BIGINT NOT NULL,
    failure_category VARCHAR(100), -- electrical/battery/communication/etc.
    confidence DECIMAL(5,2), -- 0.00-1.00
    annotation_type VARCHAR(20), -- auto/manual
    annotated_by VARCHAR(50),
    annotated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (record_id) REFERENCES test_records(id) ON DELETE CASCADE,
    INDEX idx_record_id (record_id),
    INDEX idx_category (failure_category)
);
```

---

## 🔌 API 設計

### 基礎 URL
```
開發環境: http://localhost:3001/api
生產環境: https://mes-api.your-domain.com/api
```

### API 端點規劃

#### 1. 測試記錄 API
```typescript
// 取得測試記錄列表（支援篩選、分頁）
GET /api/test-records
Query Parameters:
  - page: number (預設 1)
  - limit: number (預設 100)
  - station?: string
  - model?: string
  - result?: 'PASS' | 'FAIL' | 'all'
  - dateFrom?: string (YYYY-MM-DD)
  - dateTo?: string (YYYY-MM-DD)
  - serialNumber?: string
  - workOrder?: string

Response:
{
  success: true,
  data: TestRecord[],
  pagination: {
    page: 1,
    limit: 100,
    total: 5000,
    totalPages: 50
  }
}

// 取得單筆測試記錄（包含測試項目）
GET /api/test-records/:id
Response:
{
  success: true,
  data: {
    ...record,
    items: TestItem[]
  }
}

// 批量上傳測試記錄
POST /api/test-records/batch
Body: {
  records: TestRecord[]
}

// 刪除測試記錄
DELETE /api/test-records/:id
```

#### 2. 統計 API
```typescript
// 取得 KPI 統計
GET /api/statistics/kpi
Query: dateFrom, dateTo, station?
Response:
{
  success: true,
  data: {
    total: number,
    passed: number,
    failed: number,
    passRate: number,
    deviceCount: number,
    passedDevices: number,
    productionYield: number
  }
}

// 取得站別統計
GET /api/statistics/stations
Query: dateFrom, dateTo
Response:
{
  success: true,
  data: StationStats[]
}

// 取得機種統計
GET /api/statistics/models
Query: dateFrom, dateTo
Response:
{
  success: true,
  data: ModelStats[]
}

// 取得每日趨勢
GET /api/statistics/daily-trend
Query: dateFrom, dateTo, station?
Response:
{
  success: true,
  data: {
    dates: string[],
    total: number[],
    passed: number[],
    failed: number[]
  }
}

// 取得每日站別良率熱力圖
GET /api/statistics/daily-station-heatmap
Query: dateFrom, dateTo
Response:
{
  success: true,
  data: {
    [station: string]: (number | null)[]
  }
}

// 取得失敗原因分析
GET /api/statistics/failure-reasons
Query: dateFrom, dateTo, station?
Response:
{
  success: true,
  data: FailureReason[]
}

// 取得復測統計
GET /api/statistics/retest
Query: dateFrom, dateTo
Response:
{
  success: true,
  data: RetestStats[]
}
```

#### 3. LOG 檔案 API
```typescript
// 上傳 LOG 檔案
POST /api/logs/upload
Body: FormData (multipart/form-data)
  - files: File[]
  - autoMatch: boolean (自動配對)

// 搜尋 LOG
GET /api/logs/search
Query: serialNumber?, station?, dateFrom?, dateTo?
Response:
{
  success: true,
  data: LogFile[]
}

// 下載 LOG
GET /api/logs/:id/download
Response: text/plain (LOG 檔案內容)

// 取得配對關係
GET /api/logs/mappings/:recordId
Response:
{
  success: true,
  data: LogFile[]
}
```

#### 4. 設定 API
```typescript
// 站別管理
GET /api/settings/stations
POST /api/settings/stations
PUT /api/settings/stations/:id
DELETE /api/settings/stations/:id

// 機種管理
GET /api/settings/models
POST /api/settings/models
PUT /api/settings/models/:id
DELETE /api/settings/models/:id
```

#### 5. 檔案匯入 API
```typescript
// 批量匯入 JSON + LOG
POST /api/import/batch
Body: FormData
  - jsonFiles: File[]
  - logFiles: File[]

Response:
{
  success: true,
  data: {
    importedRecords: number,
    pairedLogs: number,
    errors: string[]
  }
}
```

---

## 📁 後端專案結構

```
mes-backend/
├── src/
│   ├── config/
│   │   ├── database.ts          # 資料庫連接設定
│   │   └── env.ts               # 環境變數
│   ├── models/                  # Prisma Schema 或 TypeORM Models
│   │   └── schema.prisma
│   ├── routes/
│   │   ├── testRecords.ts       # 測試記錄路由
│   │   ├── statistics.ts        # 統計路由
│   │   ├── logs.ts              # LOG 路由
│   │   └── settings.ts          # 設定路由
│   ├── controllers/
│   │   ├── testRecordController.ts
│   │   ├── statisticsController.ts
│   │   ├── logController.ts
│   │   └── settingsController.ts
│   ├── services/
│   │   ├── testRecordService.ts # 業務邏輯層
│   │   ├── statisticsService.ts
│   │   ├── logService.ts
│   │   └── importService.ts
│   ├── repositories/            # 資料存取層
│   │   ├── testRecordRepo.ts
│   │   ├── logRepo.ts
│   │   └── settingsRepo.ts
│   ├── middlewares/
│   │   ├── auth.ts              # JWT 驗證
│   │   ├── errorHandler.ts      # 錯誤處理
│   │   └── validation.ts        # 請求驗證
│   ├── utils/
│   │   ├── logger.ts            # 日誌工具
│   │   ├── fileParser.ts        # JSON/LOG 解析
│   │   └── calculations.ts      # 統計計算（可重用前端邏輯）
│   ├── types/
│   │   └── index.ts             # TypeScript 型別定義
│   └── app.ts                   # Express App 入口
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── tests/                       # 單元測試和整合測試
├── .env.example
├── package.json
└── tsconfig.json
```

---

## 🔄 前端改造計劃

### 1. 移除 IndexedDB 相關程式碼
```typescript
// ❌ 移除
src/utils/MESDatabase.ts

// ❌ 移除 localStorage 直接存取
localStorage.getItem('mesTestRecords')
localStorage.setItem('mesStations', ...)
```

### 2. 建立 API Service 層
```typescript
// src/services/api/client.ts
import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 請求攔截器（添加 Token）
apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 回應攔截器（錯誤處理）
apiClient.interceptors.response.use(
  response => response.data,
  error => {
    // 統一錯誤處理
    return Promise.reject(error);
  }
);

export default apiClient;
```

```typescript
// src/services/api/testRecordService.ts
import apiClient from './client';
import type { TestRecord, TestRecordFilters } from '@/types';

export const testRecordService = {
  // 取得列表
  async getRecords(filters: TestRecordFilters) {
    return apiClient.get('/test-records', { params: filters });
  },

  // 取得單筆
  async getRecord(id: number) {
    return apiClient.get(`/test-records/${id}`);
  },

  // 批量上傳
  async batchUpload(records: TestRecord[]) {
    return apiClient.post('/test-records/batch', { records });
  },

  // 刪除
  async deleteRecord(id: number) {
    return apiClient.delete(`/test-records/${id}`);
  }
};
```

```typescript
// src/services/api/statisticsService.ts
export const statisticsService = {
  async getKPI(filters: DateFilters) {
    return apiClient.get('/statistics/kpi', { params: filters });
  },

  async getStationStats(filters: DateFilters) {
    return apiClient.get('/statistics/stations', { params: filters });
  },

  async getDailyHeatmap(filters: DateFilters) {
    return apiClient.get('/statistics/daily-station-heatmap', { params: filters });
  }
};
```

### 3. 使用 React Query 管理 API 狀態
```typescript
// src/hooks/useTestRecords.ts
import { useQuery } from '@tanstack/react-query';
import { testRecordService } from '@/services/api/testRecordService';

export function useTestRecords(filters: TestRecordFilters) {
  return useQuery({
    queryKey: ['testRecords', filters],
    queryFn: () => testRecordService.getRecords(filters),
    staleTime: 5 * 60 * 1000, // 5分鐘快取
  });
}
```

```typescript
// src/hooks/useStatistics.ts
import { useQuery } from '@tanstack/react-query';
import { statisticsService } from '@/services/api/statisticsService';

export function useKPI(filters: DateFilters) {
  return useQuery({
    queryKey: ['kpi', filters],
    queryFn: () => statisticsService.getKPI(filters),
  });
}

export function useDailyHeatmap(filters: DateFilters) {
  return useQuery({
    queryKey: ['dailyHeatmap', filters],
    queryFn: () => statisticsService.getDailyHeatmap(filters),
  });
}
```

### 4. 改造 Dashboard Hook
```typescript
// src/features/dashboard/hooks/useDashboardData.ts
import { useKPI, useStationStats, useDailyHeatmap } from '@/hooks/useStatistics';

export function useDashboardData(filters: SimpleFilterOptions) {
  // ✅ 使用 React Query hooks
  const { data: kpiData, isLoading: kpiLoading } = useKPI({
    dateFrom: filters.dateFrom,
    dateTo: filters.dateTo,
    station: filters.station
  });

  const { data: stationStats, isLoading: stationLoading } = useStationStats({
    dateFrom: filters.dateFrom,
    dateTo: filters.dateTo
  });

  const { data: heatmapData, isLoading: heatmapLoading } = useDailyHeatmap({
    dateFrom: filters.dateFrom,
    dateTo: filters.dateTo
  });

  const isLoading = kpiLoading || stationLoading || heatmapLoading;

  return {
    stats: kpiData || defaultKPI,
    detailedStationStats: stationStats || [],
    dailyStationPassRates: heatmapData || {},
    isLoading,
    // ... 其他資料
  };
}
```

---

## 🚀 實施步驟

### Phase 1: 後端建置（1-2週）
1. ✅ 初始化 Node.js + TypeScript 專案
2. ✅ 設定 Prisma 並建立 Schema
3. ✅ 執行資料庫 Migration
4. ✅ 實作基礎 CRUD API
5. ✅ 實作統計 API
6. ✅ 實作檔案上傳和 LOG 處理
7. ✅ 加入錯誤處理和驗證

### Phase 2: 前端改造（1週）
1. ✅ 安裝 axios 和 React Query
2. ✅ 建立 API Service 層
3. ✅ 建立 React Query Hooks
4. ✅ 移除 IndexedDB 相關程式碼
5. ✅ 改造 Dashboard 和其他頁面使用新的 Hooks
6. ✅ 更新檔案上傳功能

### Phase 3: 資料遷移（2-3天）
1. ✅ 撰寫資料遷移腳本
2. ✅ 從 IndexedDB 匯出 JSON 資料
3. ✅ 批量匯入到 SQL 資料庫
4. ✅ 驗證資料完整性

### Phase 4: 測試與優化（3-5天）
1. ✅ 整合測試
2. ✅ 效能測試和優化
3. ✅ 錯誤處理測試
4. ✅ UI/UX 調整

### Phase 5: 部署（2-3天）
1. ✅ 設定生產環境資料庫
2. ✅ 部署後端 API
3. ✅ 更新前端環境變數
4. ✅ 部署前端應用

---

## 🔒 安全考量

### 1. API 安全
- 使用 JWT Token 進行身份驗證
- 實作 Rate Limiting 防止 DDoS
- 使用 Helmet.js 保護 Express
- CORS 設定僅允許特定來源

### 2. 資料安全
- 敏感欄位加密儲存
- SQL Injection 防護（使用 ORM）
- 檔案上傳驗證（檔案類型、大小限制）

### 3. 傳輸安全
- HTTPS 加密
- API Key 不寫在前端程式碼
- 環境變數管理敏感資訊

---

## 📊 效能優化

### 1. 資料庫層
- 建立適當的索引（serial_number, station, test_time 等）
- 使用資料庫連接池
- 複雜查詢使用 Materialized View

### 2. API 層
- 實作 Redis 快取熱門查詢
- 分頁查詢避免一次載入大量資料
- 壓縮回應資料（Gzip）

### 3. 前端層
- React Query 自動快取
- 虛擬滾動處理大量資料
- 圖表資料抽樣顯示

---

## 📝 開發檢查清單

### 後端開發
- [ ] 資料庫 Schema 設計完成
- [ ] Prisma Migration 執行成功
- [ ] 測試記錄 CRUD API 完成
- [ ] 統計 API 完成
- [ ] LOG 檔案處理 API 完成
- [ ] 檔案上傳功能完成
- [ ] 錯誤處理和驗證完成
- [ ] JWT 認證實作完成
- [ ] API 文件撰寫完成

### 前端改造
- [ ] axios 和 React Query 設定完成
- [ ] API Service 層建立完成
- [ ] 所有頁面改用 API 呼叫
- [ ] IndexedDB 程式碼移除
- [ ] 錯誤處理 UI 實作
- [ ] Loading 狀態處理
- [ ] 檔案上傳 UI 更新

### 測試
- [ ] 單元測試覆蓋率 > 80%
- [ ] 整合測試通過
- [ ] 效能測試通過（QPS > 100）
- [ ] 資料遷移驗證完成

### 部署
- [ ] 環境變數配置完成
- [ ] 生產資料庫設定完成
- [ ] API 伺服器部署完成
- [ ] 前端部署完成
- [ ] 監控和日誌系統建立

---

## 🛠️ 技術選型理由

### 為什麼選 PostgreSQL？
- ✅ 完整的 ACID 支援
- ✅ 強大的 JSON 支援（儲存複雜測試項目）
- ✅ 高效的全文檢索
- ✅ 成熟的生態系統

### 為什麼選 Prisma？
- ✅ Type-safe 的 ORM，與 TypeScript 完美整合
- ✅ 自動生成 Migration
- ✅ 直觀的查詢語法
- ✅ 優秀的開發體驗

### 為什麼選 React Query？
- ✅ 自動快取管理
- ✅ 背景自動更新
- ✅ 樂觀更新支援
- ✅ 減少狀態管理複雜度

---

## 📞 聯絡與支援

如有問題請參考：
- 後端 API 文件: `http://localhost:3001/api-docs`
- Prisma Studio: `npx prisma studio`
- 資料庫監控: Adminer / pgAdmin

---

*文件版本: 1.0*
*最後更新: 2025-10-02*
