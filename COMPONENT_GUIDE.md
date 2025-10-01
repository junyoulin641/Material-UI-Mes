# 組件學習指南 - 大型組件解析

> 本文檔針對專案中的大型複雜組件，提供精簡的學習指引

## 📚 目錄

1. [DashboardView.tsx - 儀表板主頁面](#dashboardview)
2. [TableView.tsx - 資料表格](#tableview)
3. [SettingsView.tsx - 系統設定](#settingsview)
4. [其他功能組件](#其他功能組件)

---

## DashboardView.tsx - 儀表板主頁面

### 檔案位置
`src/features/dashboard/components/DashboardView.tsx` (837 行)

### 核心功能
儀表板是整個 MES 系統的數據中心，展示測試數據的統計分析和視覺化圖表。

### 關鍵技術點

#### 1. **複雜的 State 管理**
```typescript
const [dashboardFilters, setDashboardFilters] = useState<SimpleFilterOptions>({});
const [refreshKey, setRefreshKey] = useState(0);
const [testData, setTestData] = useState<any[]>([]);
```
**學習重點**：
- 多個相關的 state 如何協同工作
- refreshKey 模式：用數字觸發資料重新載入
- 複雜物件的 state 管理

#### 2. **useEffect 實戰 - 資料載入**
```typescript
useEffect(() => {
  const loadData = async () => {
    const data = await loadRealTestData();
    setTestData(data);
  };
  loadData();
}, [refreshKey]); // refreshKey 改變時重新載入
```
**學習重點**：
- 異步資料載入模式
- useEffect 的依賴陣列用法
- async/await 在 Effect 中的使用

#### 3. **useMemo 效能優化 - 資料過濾**
```typescript
const filteredData = useMemo(() => {
  let filtered = [...testData];

  // 日期篩選
  if (dashboardFilters.dateFrom && dashboardFilters.dateTo) {
    filtered = filtered.filter(/* ... */);
  }

  // 結果篩選
  if (dashboardFilters.result) {
    filtered = filtered.filter(/* ... */);
  }

  return filtered;
}, [testData, dashboardFilters]);
```
**學習重點**：
- useMemo 避免重複計算
- 複雜的篩選邏輯
- 依賴追蹤（testData 或 dashboardFilters 改變才重算）

#### 4. **useMemo 計算統計數據**
```typescript
const stats = useMemo(() => {
  const total = filteredData.length;
  const passed = filteredData.filter(r => r.result === 'PASS').length;
  const failed = total - passed;
  const passRate = total > 0 ? ((passed / total) * 100) : 0;

  return { total, passed, failed, passRate, /* ... */ };
}, [filteredData]);
```
**學習重點**：
- 從原始資料計算衍生資料
- 避免在 render 時重複計算
- 複雜的業務邏輯計算

#### 5. **MUI X-Charts 圖表整合**
```typescript
// 圓餅圖資料
const pieData = [
  { id: 0, value: stats.passed, label: 'PASS', color: '#4caf50' },
  { id: 1, value: stats.failed, label: 'FAIL', color: '#f44336' },
];

<PieChart
  series={[{
    data: pieData,
    highlightScope: { faded: 'global', highlighted: 'item' },
  }]}
  height={280}
/>
```
**學習重點**：
- MUI X-Charts 的資料格式
- 圖表的互動性配置
- 視覺化最佳實踐

#### 6. **Grid v2 響應式佈局**
```typescript
<Grid container spacing={3}>
  {data.map((card, index) => (
    <Grid key={index} size={{ xs: 12, sm: 6, md: 3 }}>
      <StatCard {...card} />
    </Grid>
  ))}
</Grid>
```
**學習重點**：
- Grid v2 的 size prop
- 響應式斷點（xs, sm, md, lg, xl）
- 自動換行佈局

#### 7. **事件監聽 - 資料更新**
```typescript
useEffect(() => {
  const handleDataUpdate = async () => {
    const data = await loadRealTestData();
    setTestData(data);
  };

  window.addEventListener('mesDataUpdated', handleDataUpdate);

  return () => {
    window.removeEventListener('mesDataUpdated', handleDataUpdate);
  };
}, []);
```
**學習重點**：
- 自訂事件監聽
- cleanup function 移除監聽器
- 跨組件通訊模式

### 組件結構
```
DashboardView
├── 麵包屑導航 (Breadcrumbs)
├── 操作控制卡片 (匯出、重新整理)
├── 快速篩選卡片 (SimpleQuickFilters)
├── KPI 統計卡片 (Grid + StatCard * 4)
├── 圖表區域
│   ├── 趨勢折線圖 (LineChart)
│   ├── 結果圓餅圖 (PieChart)
│   └── 站點長條圖 (BarChart)
├── 詳細統計分析 (DetailedStatsCard)
└── 最近測試記錄表格 (Table)
```

### 學習建議順序
1. **第1天**：理解 state 和 props 的流動
2. **第2天**：看懂 useEffect 的資料載入邏輯
3. **第3天**：理解 useMemo 的過濾和計算邏輯
4. **第4天**：學習圖表資料的準備和渲染
5. **第5天**：研究整體佈局和響應式設計

---

## TableView.tsx - 資料表格

### 檔案位置
`src/features/table/components/TableView.tsx`

### 核心功能
使用 MUI DataGrid Pro 展示大量測試記錄，支援排序、篩選、分頁、匯出等功能。

### 關鍵技術點

#### 1. **MUI DataGrid Pro**
```typescript
<DataGrid
  rows={filteredData}
  columns={columns}
  pageSizeOptions={[25, 50, 100]}
  pagination
  density="compact"
/>
```
**學習重點**：
- DataGrid 的基本配置
- columns 定義（欄位、寬度、格式化）
- 內建功能（排序、篩選、分頁）

#### 2. **欄位定義 (Columns)**
```typescript
const columns: GridColDef[] = [
  {
    field: 'serialNumber',
    headerName: '序號',
    width: 150,
    renderCell: (params) => (
      <Chip label={params.value} size="small" />
    ),
  },
  // ...
];
```
**學習重點**：
- GridColDef 類型定義
- renderCell 自訂欄位渲染
- valueGetter 計算欄位值

#### 3. **CSV 匯出功能**
```typescript
const handleExport = () => {
  const csvContent = [
    ['序號', '站別', '機種', '結果', '時間'].join(','),
    ...filteredData.map(record => [
      record.serialNumber,
      record.station,
      // ...
    ].join(','))
  ].join('\n');

  // 建立下載連結
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `data_${Date.now()}.csv`;
  link.click();
};
```
**學習重點**：
- 資料轉換為 CSV 格式
- Blob API 建立檔案
- 程式化觸發下載

---

## SettingsView.tsx - 系統設定

### 檔案位置
`src/features/settings/components/SettingsView.tsx`

### 核心功能
管理系統設定，包括站別/機種管理、資料匯入、用戶管理等。

### 關鍵技術點

#### 1. **表單狀態管理**
```typescript
const [stations, setStations] = useState<string[]>([]);
const [newStation, setNewStation] = useState('');

const handleAddStation = () => {
  if (newStation.trim()) {
    setStations([...stations, newStation.trim()]);
    setNewStation('');
  }
};
```
**學習重點**：
- 陣列狀態的新增/刪除
- 輸入框的雙向綁定
- 表單驗證邏輯

#### 2. **檔案上傳處理**
```typescript
const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
  const files = event.target.files;
  if (!files) return;

  for (const file of Array.from(files)) {
    const text = await file.text();
    const data = JSON.parse(text);
    // 處理資料...
  }
};
```
**學習重點**：
- File API 讀取檔案
- 異步處理多個檔案
- JSON 解析和錯誤處理

#### 3. **IndexedDB 整合**
```typescript
const db = await getMESDatabase();
await db.addTestRecord(record);
await db.addLogFile(logData);
```
**學習重點**：
- IndexedDB 的異步操作
- 資料持久化
- 錯誤處理和備援機制

---

## 其他功能組件

### LogQueryView.tsx - LOG 查詢
**關鍵功能**：
- 多條件搜尋表單
- MUI Dialog 預覽視窗
- 檔案下載功能

**學習重點**：
- 複雜的搜尋邏輯
- Dialog 的開關控制
- 文字內容的格式化顯示

### AIAnalysisView.tsx - AI 分析
**關鍵功能**：
- Tab 切換介面
- 資料標註系統
- 模型訓練模擬

**學習重點**：
- MUI Tabs 組件
- 複雜的表單互動
- localStorage 資料持久化

### MTCCTView.tsx - 檔案管理
**關鍵功能**：
- 資料夾瀏覽
- 檔案列表展示
- 批量下載

**學習重點**：
- 樹狀結構資料處理
- 檔案系統操作
- 進度條顯示

---

## 通用學習技巧

### 1. 閱讀順序建議
```
1. 先看檔案頂部的 import（了解依賴）
2. 找到主要組件函數（通常是 export default function）
3. 看 useState 和 useEffect（理解狀態和副作用）
4. 看 return 的 JSX（理解 UI 結構）
5. 回頭看事件處理函數（理解互動邏輯）
```

### 2. 如何快速定位功能
```typescript
// 使用 VSCode 的功能：
// 1. Ctrl+F: 搜尋關鍵字（如 "handleClick"）
// 2. Ctrl+Shift+O: 顯示檔案符號列表（所有函數）
// 3. F12: 跳到定義
// 4. Shift+F12: 顯示所有參考
```

### 3. Debug 技巧
```typescript
// 在關鍵位置加上 console.log
console.log('📊 過濾後的資料:', filteredData);
console.log('🔄 當前狀態:', { state1, state2 });

// 使用 useEffect 追蹤狀態變化
useEffect(() => {
  console.log('✨ testData 改變了:', testData.length);
}, [testData]);
```

### 4. 常見模式識別
```typescript
// 模式 1: 資料載入
useEffect(() => {
  loadData().then(setData);
}, []);

// 模式 2: 資料過濾
const filtered = useMemo(() => {
  return data.filter(/* 條件 */);
}, [data, filters]);

// 模式 3: 表單處理
const [value, setValue] = useState('');
<input value={value} onChange={(e) => setValue(e.target.value)} />

// 模式 4: 對話框控制
const [open, setOpen] = useState(false);
<Dialog open={open} onClose={() => setOpen(false)} />
```

---

## 實戰練習建議

### 練習 1：修改 Dashboard
**任務**：在 DashboardView 新增一個顯示「平均測試時間」的 KPI 卡片

**步驟**：
1. 在 `stats` useMemo 中計算平均時間
2. 在 `data` 陣列中新增一個 StatCardProps 物件
3. Grid 會自動調整佈局

### 練習 2：新增篩選條件
**任務**：在 SimpleQuickFilters 新增「測試員」篩選

**步驟**：
1. 在 FilterOptions 類型新增 `tester?: string`
2. 在對話框新增 TextField
3. 在 DashboardView 的過濾邏輯新增測試員判斷

### 練習 3：自訂圖表
**任務**：新增一個顯示「每小時測試數量」的長條圖

**步驟**：
1. 用 useMemo 計算每小時的資料
2. 建立 BarChart 資料格式
3. 在 Grid 中新增圖表組件

---

## 進階主題

### 1. 效能優化
- 使用 React.memo 避免不必要的重渲染
- 使用 useCallback 記憶化函數
- 虛擬滾動處理大量資料

### 2. 錯誤處理
- try-catch 捕捉異步錯誤
- Error Boundary 處理渲染錯誤
- 友善的錯誤訊息顯示

### 3. TypeScript 最佳實踐
- 為所有 Props 定義 interface
- 使用 type 定義聯合類型
- 善用型別推斷減少冗餘

### 4. 測試
- Unit Test: 測試純函數和計算邏輯
- Integration Test: 測試組件互動
- E2E Test: 測試完整使用者流程

---

## 學習資源

### 官方文檔
- [React 文檔](https://react.dev/)
- [MUI 文檔](https://mui.com/)
- [MUI X-Charts](https://mui.com/x/react-charts/)
- [MUI X-DataGrid](https://mui.com/x/react-data-grid/)

### 推薦閱讀
- React Hooks 最佳實踐
- TypeScript 與 React
- 前端效能優化
- 無障礙設計指南

---

**祝學習順利！記住：多看程式碼、多動手實作、多問問題！** 🚀