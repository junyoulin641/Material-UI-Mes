# React 學習指南 - 給工程師的快速入門

> 本專案使用 React 18 + TypeScript + Material-UI v7
>
> 這份指南專為有程式基礎但初學 React 的工程師設計

## 📚 目錄

1. [React 核心概念](#react-核心概念)
2. [本專案架構說明](#本專案架構說明)
3. [關鍵檔案導讀](#關鍵檔案導讀)
4. [React Hooks 實戰](#react-hooks-實戰)
5. [Material-UI 使用指南](#material-ui-使用指南)
6. [常見問題 FAQ](#常見問題-faq)

---

## React 核心概念

### 1. 什麼是 React？

React 是一個用於建構使用者介面的 JavaScript 函式庫。

**核心理念**：
- **組件化 (Component-based)**: UI 由小組件組合而成
- **聲明式 (Declarative)**: 描述「想要什麼」而非「如何做」
- **單向資料流 (One-way data flow)**: 資料由上而下傳遞

**類比**：
```
傳統 JavaScript (命令式)：
- 找到 DOM 元素
- 修改它的內容
- 更新它的樣式
- 處理事件監聽...

React (聲明式)：
- 描述 UI 應該長什麼樣子
- React 自動幫你更新 DOM
```

### 2. 組件 (Component)

組件是 React 的基本單元，類似樂高積木。

#### 函數組件 (Function Component) - 現代推薦寫法

```typescript
// 簡單組件
function Welcome() {
  return <h1>Hello, World!</h1>;
}

// 帶 Props 的組件
interface ButtonProps {
  text: string;        // 按鈕文字
  onClick: () => void; // 點擊事件
}

function Button({ text, onClick }: ButtonProps) {
  return <button onClick={onClick}>{text}</button>;
}

// 使用組件
<Button text="點我" onClick={() => alert('clicked')} />
```

**重點**：
- 組件名稱必須**大寫開頭**（React 的規則）
- Props 是組件的輸入參數（唯讀，不可修改）
- 組件必須回傳 JSX

### 3. JSX (JavaScript XML)

JSX 是 JavaScript 的語法擴展，讓你用類似 HTML 的方式寫 UI。

```jsx
// JSX 範例
const element = (
  <div className="container">
    <h1>標題</h1>
    <p>內容：{count}</p>  {/* 用 {} 嵌入 JavaScript */}
  </div>
);

// 實際上會被編譯成：
const element = React.createElement(
  'div',
  { className: 'container' },
  React.createElement('h1', null, '標題'),
  React.createElement('p', null, `內容：${count}`)
);
```

**JSX 規則**：
1. 必須有一個根元素
2. 使用 `className` 而非 `class`
3. 使用 `{expression}` 嵌入 JavaScript
4. 自閉合標籤必須加 `/`（如 `<img />`）

### 4. State（狀態）

State 是組件的記憶，當 State 改變時，React 會重新渲染組件。

```typescript
import { useState } from 'react';

function Counter() {
  // useState Hook: 宣告一個狀態變數
  const [count, setCount] = useState(0);
  //     ↑狀態值  ↑更新函數    ↑初始值

  return (
    <div>
      <p>計數：{count}</p>
      <button onClick={() => setCount(count + 1)}>
        +1
      </button>
    </div>
  );
}
```

**重點**：
- State 改變 → 組件重新渲染
- 永遠使用 `setState` 更新，不要直接修改
- State 更新是**異步**的

### 5. Props（屬性）

Props 是父組件傳給子組件的資料。

```typescript
// 父組件
function Parent() {
  return <Child name="小明" age={10} />;
}

// 子組件
interface ChildProps {
  name: string;
  age: number;
}

function Child({ name, age }: ChildProps) {
  return <p>{name} 今年 {age} 歲</p>;
}
```

**Props vs State**：
| 特性 | Props | State |
|------|-------|-------|
| 由誰控制 | 父組件 | 組件自己 |
| 可否修改 | ❌ 唯讀 | ✅ 可變 |
| 用途 | 傳遞資料 | 儲存資料 |

### 6. Effect（副作用）

Effect 用於處理**副作用**（如 API 請求、訂閱、手動 DOM 操作）。

```typescript
import { useEffect } from 'react';

function DataFetcher() {
  const [data, setData] = useState(null);

  useEffect(() => {
    // 組件掛載時執行
    fetchData().then(setData);

    // cleanup function（組件卸載時執行）
    return () => {
      console.log('清理資源');
    };
  }, []); // 依賴陣列：空陣列 = 只執行一次

  return <div>{data}</div>;
}
```

**useEffect 的三種模式**：
```typescript
// 1. 每次渲染都執行
useEffect(() => {
  console.log('每次都執行');
});

// 2. 只執行一次（掛載時）
useEffect(() => {
  console.log('只執行一次');
}, []);

// 3. 依賴變化時執行
useEffect(() => {
  console.log('count 改變了');
}, [count]);
```

---

## 本專案架構說明

### Feature-based Architecture（按功能劃分）

```
src/
├── features/              # 功能模組
│   ├── dashboard/        # 儀表板功能
│   │   ├── components/   # UI 組件
│   │   ├── utils/        # 工具函數
│   │   └── types/        # TypeScript 類型
│   ├── table/            # 表格功能
│   └── ...
│
├── shared/               # 共用資源
│   ├── theme/           # MUI 主題
│   └── constants/       # 常數
│
├── contexts/            # React Context（全域狀態）
├── utils/               # 通用工具
└── types/               # 通用類型
```

### 資料流向

```
┌─────────────────────────────────────────┐
│  App.tsx (根組件)                        │
│  ├── LanguageProvider (多語言)          │
│  ├── ToastProvider (通知系統)           │
│  └── AppRouter (路由)                   │
│      ├── DashboardView (儀表板)         │
│      ├── TableView (表格)               │
│      └── SettingsView (設定)            │
└─────────────────────────────────────────┘

資料流：
Context → useContext Hook → 子組件
Props  → 子組件 → 孫組件
```

### 與傳統 MVC/MVVM 的對比

```
傳統 MVVM:
├── Models/          (資料模型)
├── Views/           (UI 視圖)
└── ViewModels/      (業務邏輯)

本專案 (Feature-based + Hooks):
├── features/dashboard/
│   ├── components/  (View - UI 組件)
│   ├── utils/       (Logic - 業務邏輯)
│   └── types/       (Model - 資料結構)
└── contexts/        (State - 全域狀態管理)
```

**關鍵差異**：
- MVVM 按**技術層級**分類（所有 Model 放一起）
- Feature-based 按**業務功能**分類（dashboard 的所有東西放一起）

**優勢**：
- ✅ 高內聚：相關功能集中管理
- ✅ 低耦合：功能模組互不干擾
- ✅ 易擴展：新增功能只需新增資料夾
- ✅ 易維護：修改功能不影響其他模組

---

## 關鍵檔案導讀

### 1. App.tsx - 根組件

```typescript
export default function App() {
  return (
    <LanguageProvider>    {/* 提供多語言功能 */}
      <ToastProvider>     {/* 提供通知系統 */}
        <AppRouter />     {/* 主要內容 */}
      </ToastProvider>
    </LanguageProvider>
  );
}
```

**用途**：設定全域環境（Context Providers）

**學習重點**：
- Context Provider 的洋蔥式結構
- 如何為整個應用提供共用功能

### 2. contexts/LanguageContext.tsx - Context 範例

```typescript
// 1. 建立 Context
const LanguageContext = createContext<ContextType>(defaultValue);

// 2. 建立 Provider 組件
export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState('zh-TW');

  const value = {
    language,
    setLanguage,
    t: (key) => translations[language][key]
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

// 3. 建立自訂 Hook 方便使用
export function useLanguage() {
  return useContext(LanguageContext);
}

// 4. 在組件中使用
function MyComponent() {
  const { language, setLanguage, t } = useLanguage();
  return <p>{t('hello')}</p>;
}
```

**學習重點**：
- Context 的三部曲：Create → Provide → Consume
- 自訂 Hook 簡化使用

### 3. features/dashboard/components/StatCard.tsx - 展示型組件

```typescript
interface StatCardProps {
  title: string;
  value: string;
  icon?: React.ReactNode;
  color?: 'primary' | 'success' | 'error';
}

function StatCard({ title, value, icon, color }: StatCardProps) {
  return (
    <Card>
      <CardContent>
        {icon && <Box>{icon}</Box>}
        <Typography variant="h4">{value}</Typography>
        <Typography variant="body2">{title}</Typography>
      </CardContent>
    </Card>
  );
}
```

**學習重點**：
- Props 的類型定義（TypeScript interface）
- 條件渲染（`&&` 運算子）
- Material-UI 組件使用

---

## React Hooks 實戰

### 1. useState - 狀態管理

```typescript
// 基本用法
const [count, setCount] = useState(0);

// 對象狀態
const [user, setUser] = useState({
  name: '小明',
  age: 25
});

// 更新對象狀態（必須建立新對象）
setUser({ ...user, age: 26 });  // ✅ 正確
setUser({ age: 26 });            // ❌ 錯誤：丟失 name
user.age = 26;                   // ❌ 錯誤：直接修改

// 函數式更新（當新值依賴舊值時使用）
setCount(prevCount => prevCount + 1);  // ✅ 安全
setCount(count + 1);                   // ⚠️ 可能有問題
```

### 2. useEffect - 副作用處理

```typescript
// API 請求
useEffect(() => {
  fetch('/api/data')
    .then(res => res.json())
    .then(setData);
}, []); // 空陣列：只執行一次

// 訂閱和清理
useEffect(() => {
  const timer = setInterval(() => {
    console.log('tick');
  }, 1000);

  // cleanup function
  return () => clearInterval(timer);
}, []);

// 依賴追蹤
useEffect(() => {
  console.log('userId changed:', userId);
  loadUserData(userId);
}, [userId]); // userId 改變時執行
```

**常見陷阱**：
```typescript
// ❌ 錯誤：無限循環
useEffect(() => {
  setCount(count + 1);
}); // 沒有依賴陣列

// ❌ 錯誤：忘記依賴
useEffect(() => {
  doSomething(count);
}, []); // count 應該在依賴中

// ✅ 正確
useEffect(() => {
  doSomething(count);
}, [count]);
```

### 3. useMemo - 效能優化

```typescript
// 昂貴的計算
const expensiveValue = useMemo(() => {
  return data.filter(item => item.active)
             .map(item => item.value)
             .reduce((sum, val) => sum + val, 0);
}, [data]); // 只有 data 改變時才重新計算

// 比較：沒有 useMemo
const expensiveValue = data.filter(...)... // 每次渲染都計算
```

**何時使用 useMemo**：
- ✅ 複雜計算（過濾、排序、聚合）
- ✅ 建立大型對象或陣列
- ❌ 簡單計算（加減乘除）
- ❌ 建立小型對象

### 4. useCallback - 函數記憶化

```typescript
// 沒有 useCallback：每次渲染都建立新函數
const handleClick = () => {
  doSomething(id);
};

// 使用 useCallback：只在依賴改變時建立新函數
const handleClick = useCallback(() => {
  doSomething(id);
}, [id]);

// 傳給子組件時特別有用
<ChildComponent onClick={handleClick} />
```

### 5. useContext - 消費 Context

```typescript
// 定義 Context
const ThemeContext = createContext('light');

// 使用 Context
function Button() {
  const theme = useContext(ThemeContext);
  return <button className={theme}>按鈕</button>;
}
```

---

## Material-UI 使用指南

### 1. 基本組件

```typescript
import {
  Button,        // 按鈕
  TextField,     // 輸入框
  Card,          // 卡片
  Typography,    // 文字
  Box,           // 容器
  Grid           // 網格佈局
} from '@mui/material';

// 按鈕
<Button variant="contained" color="primary" onClick={handleClick}>
  點我
</Button>

// 輸入框
<TextField
  label="姓名"
  value={name}
  onChange={(e) => setName(e.target.value)}
/>

// 卡片
<Card>
  <CardContent>
    <Typography variant="h5">標題</Typography>
    <Typography variant="body2">內容</Typography>
  </CardContent>
</Card>
```

### 2. sx prop - 樣式系統

```typescript
// sx prop：Material-UI 的樣式寫法
<Box
  sx={{
    width: 300,
    height: 200,
    backgroundColor: 'primary.main',  // 使用主題顏色
    padding: 2,                       // 8px * 2 = 16px
    margin: { xs: 1, md: 2 },        // 響應式
    '&:hover': {                      // 偽類
      backgroundColor: 'primary.dark'
    }
  }}
>
  內容
</Box>
```

**MUI 間距系統**：
- `1` = 8px
- `2` = 16px
- `3` = 24px
- ...

### 3. Grid 佈局

```typescript
<Grid container spacing={2}>
  <Grid item xs={12} md={6}>  {/* 手機全寬，桌面半寬 */}
    <Card>卡片 1</Card>
  </Grid>
  <Grid item xs={12} md={6}>
    <Card>卡片 2</Card>
  </Grid>
</Grid>
```

**響應式斷點**：
- `xs`: 0px+（手機）
- `sm`: 600px+（平板）
- `md`: 900px+（小筆電）
- `lg`: 1200px+（桌面）
- `xl`: 1536px+（大螢幕）

### 4. 主題系統

```typescript
// 使用主題顏色
<Box sx={{ color: 'primary.main' }}>文字</Box>
<Box sx={{ bgcolor: 'background.paper' }}>背景</Box>

// 主題變數
theme.palette.primary.main    // 主要顏色
theme.palette.error.main      // 錯誤顏色
theme.spacing(2)              // 16px
```

---

## 常見問題 FAQ

### Q1: 為什麼 State 更新後，畫面沒變化？

```typescript
// ❌ 錯誤：直接修改
state.value = newValue;

// ❌ 錯誤：修改陣列
items.push(newItem);

// ✅ 正確：建立新對象
setState({ ...state, value: newValue });
setState([...items, newItem]);
```

**原因**：React 使用**淺比較**檢查狀態是否改變

### Q2: 為什麼 useEffect 執行了兩次？

**原因**：React 18 的 Strict Mode 會在開發模式故意執行兩次，確保你的 Effect 可以正確清理。

```typescript
// 確保有 cleanup
useEffect(() => {
  const timer = setInterval(...);
  return () => clearInterval(timer);  // 清理
}, []);
```

### Q3: Props vs State 什麼時候用？

**使用 Props**：
- 資料來自父組件
- 資料不會在組件內改變
- 多個組件共用同一份資料

**使用 State**：
- 資料由組件自己管理
- 資料會隨用戶互動改變
- 只有這個組件需要這份資料

### Q4: 如何在組件間共享資料？

1. **Props**（父子組件）
2. **Context**（跨多層組件）
3. **狀態提升**（兄弟組件）

```typescript
// 狀態提升範例
function Parent() {
  const [data, setData] = useState('');

  return (
    <>
      <ChildA data={data} onChange={setData} />
      <ChildB data={data} />
    </>
  );
}
```

### Q5: 什麼時候用 useMemo/useCallback？

**需要優化時**：
- 計算量大
- 傳給經過 `React.memo` 優化的子組件
- 依賴陣列中的引用類型（對象、陣列、函數）

**不需要優化時**：
- 簡單計算
- 沒有效能問題
- 過早優化反而增加複雜度

---

## 學習路徑建議

### 第一週：基礎概念
1. ✅ 閱讀本指南
2. ✅ 理解 App.tsx 的結構
3. ✅ 學習 useState 和 useEffect
4. ✅ 看懂 StatCard 組件

### 第二週：進階應用
1. 學習 Context API（LanguageContext）
2. 理解資料流向（Props 傳遞）
3. 學習 useMemo 和 useCallback
4. 看懂 DashboardView 的邏輯

### 第三週：Material-UI
1. 熟悉常用組件（Button, TextField, Card）
2. 學習 Grid 佈局
3. 理解 sx prop 樣式系統
4. 客製化主題

### 第四週：實戰
1. 新增一個簡單功能
2. 修改現有組件
3. 處理表單和資料驗證
4. 串接 API（使用 useEffect）

---

## 推薦學習資源

### 官方文檔
- [React 官方文檔](https://react.dev/)（英文，最權威）
- [Material-UI 文檔](https://mui.com/)（有範例程式碼）

### 教學網站
- [React 官方教學](https://react.dev/learn)
- [TypeScript 手冊](https://www.typescriptlang.org/docs/)

### 建議順序
1. 先看 React 官方的 "Quick Start"
2. 跟著本專案的程式碼學習
3. 動手修改程式碼，看會發生什麼
4. 遇到問題查文檔或 Google

---

## 實戰練習題

### 練習 1：建立簡單組件
建立一個顯示用戶資訊的組件：
```typescript
interface UserCardProps {
  name: string;
  email: string;
  avatar?: string;
}

// TODO: 實作 UserCard 組件
function UserCard({ name, email, avatar }: UserCardProps) {
  // 你的程式碼
}
```

### 練習 2：使用 State
建立一個計數器：
```typescript
function Counter() {
  // TODO: 使用 useState
  // TODO: 實作 +1, -1, 重置按鈕
}
```

### 練習 3：使用 Effect
載入並顯示 API 資料：
```typescript
function UserList() {
  // TODO: 使用 useEffect 載入資料
  // TODO: 顯示載入中狀態
  // TODO: 錯誤處理
}
```

---

**祝你學習順利！有問題隨時查看程式碼中的註解。** 🚀