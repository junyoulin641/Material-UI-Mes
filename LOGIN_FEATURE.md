# 登入功能實作說明

## 📋 功能概述

成功為 MES 系統新增了完整的登入功能，包含：
- 玻璃擬態設計的現代化登入頁面
- 使用者身份驗證系統
- 登入狀態持久化
- 角色權限管理
- 登出功能

---

## 🏗️ 檔案結構

### 新增的檔案

```
src/features/auth/
├── components/
│   └── LoginPage.tsx          # 登入頁面 UI 組件
└── contexts/
    └── AuthContext.tsx        # 身份驗證 Context（狀態管理）
```

### 修改的檔案

1. **src/App.tsx**
   - 加入 `AuthProvider` 到 Context 洋蔥結構
   - 提供全域身份驗證狀態

2. **src/features/common/components/AppRouter.tsx**
   - 整合登入邏輯
   - 未登入時顯示登入頁面
   - 側邊欄顯示使用者資訊和登出按鈕

3. **src/contexts/LanguageContext.tsx**
   - 新增登入相關的中英文翻譯鍵值

---

## 🎨 UI 設計特色

### 登入頁面設計（玻璃擬態風格）

```typescript
// 主要視覺元素
- 紫色漸層背景：linear-gradient(135deg, #667eea 0%, #764ba2 100%)
- 玻璃擬態卡片：半透明白色背景 + backdrop-filter: blur(20px)
- 動態漸層頂線：3秒循環動畫
- 工廠圖示盒子：80x80px 圓角漸層背景
```

### 視覺效果

- **背景**：紫色漸層 + 旋轉的放射狀光暈動畫
- **卡片**：玻璃擬態效果，半透明白色
- **頂部線條**：流動的漸層動畫（3秒循環）
- **按鈕**：紫色漸層 + 懸停上移效果

---

## 🔐 身份驗證架構

### AuthContext 說明

```typescript
// 提供的功能
interface AuthContextType {
  isAuthenticated: boolean;           // 是否已登入
  user: User | null;                  // 使用者資訊
  login: (username, password) => boolean;  // 登入函數
  logout: () => void;                 // 登出函數
}

// 使用者資料結構
interface User {
  username: string;      // 帳號
  displayName: string;   // 顯示名稱
  role: 'admin' | 'user'; // 角色
}
```

### 測試帳號

目前系統內建兩組測試帳號：

| 帳號 | 密碼 | 角色 | 顯示名稱 |
|------|------|------|----------|
| admin | admin123 | 管理員 | Administrator |
| user | user123 | 一般使用者 | Test User |

---

## 💾 資料持久化

### localStorage 儲存

```javascript
// 登入成功後儲存
localStorage.setItem('authUser', JSON.stringify(userData));
localStorage.setItem('isAuthenticated', 'true');

// 記住我功能
if (rememberMe) {
  localStorage.setItem('rememberedUsername', username);
}

// 登出時清除
localStorage.removeItem('authUser');
localStorage.removeItem('isAuthenticated');
```

### 自動恢復登入狀態

系統啟動時會自動檢查 localStorage：
- 如果有有效的登入資訊，自動恢復登入狀態
- 如果沒有或資料無效，顯示登入頁面

---

## 🌐 多語言支援

### 新增的翻譯鍵值

#### 中文（zh-TW）
```javascript
'login.title': 'MES 系統登入'
'login.subtitle': '製造執行系統 - Manufacturing Execution System'
'login.username': '使用者名稱'
'login.password': '密碼'
'login.remember.me': '記住我'
'login.button': '登入'
'login.logging.in': '登入中...'
'login.demo.hint': '📌 測試帳號：'
'login.demo.credentials': 'admin / admin123 或 user / user123'
'login.error.username.required': '請輸入使用者名稱'
'login.error.password.required': '請輸入密碼'
'login.error.invalid.credentials': '帳號或密碼錯誤'
'logout': '登出'
'role.admin': '管理員'
'role.user': '一般使用者'
'user.preferences': '使用者偏好'
```

#### 英文（en-US）
```javascript
'login.title': 'MES System Login'
'login.subtitle': 'Manufacturing Execution System'
'login.username': 'Username'
'login.password': 'Password'
'login.remember.me': 'Remember Me'
'login.button': 'Login'
'login.logging.in': 'Logging in...'
'login.demo.hint': '📌 Demo Account:'
'login.demo.credentials': 'admin / admin123 or user / user123'
'login.error.username.required': 'Please enter username'
'login.error.password.required': 'Please enter password'
'login.error.invalid.credentials': 'Invalid username or password'
'logout': 'Logout'
'role.admin': 'Administrator'
'role.user': 'User'
'user.preferences': 'User Preferences'
```

---

## 🔄 使用流程

### 1. 登入流程

```
使用者訪問系統
    ↓
檢查 isAuthenticated
    ↓
否 → 顯示登入頁面
    ↓
輸入帳號密碼
    ↓
呼叫 login() 函數驗證
    ↓
成功 → 儲存到 localStorage → 進入系統
失敗 → 顯示錯誤訊息
```

### 2. 登出流程

```
點擊登出按鈕
    ↓
呼叫 logout() 函數
    ↓
清除 localStorage
    ↓
清除 state
    ↓
返回登入頁面
```

---

## 🎯 側邊欄使用者資訊

### 顯示內容

```typescript
// 頭像
<Avatar sx={{ bgcolor: 'primary.main' }}>
  {user?.displayName.charAt(0).toUpperCase()}
</Avatar>

// 使用者資訊
<Typography>{user?.displayName}</Typography>
<Typography>{user?.role === 'admin' ? '管理員' : '一般使用者'}</Typography>

// 操作按鈕
<IconButton onClick={openPreferences}>設定</IconButton>
<IconButton onClick={logout}>登出</IconButton>
```

---

## 🛠️ 如何使用 AuthContext

### 在組件中使用

```typescript
import { useAuth } from '../features/auth/contexts/AuthContext';

function MyComponent() {
  const { isAuthenticated, user, login, logout } = useAuth();

  // 檢查是否登入
  if (!isAuthenticated) {
    return <div>請先登入</div>;
  }

  // 顯示使用者資訊
  return (
    <div>
      <p>歡迎，{user?.displayName}！</p>
      <button onClick={logout}>登出</button>
    </div>
  );
}
```

### 角色檢查

```typescript
// 檢查是否為管理員
if (user?.role === 'admin') {
  // 顯示管理員功能
}

// 檢查是否為一般使用者
if (user?.role === 'user') {
  // 顯示一般使用者功能
}
```

---

## 🔧 技術實作細節

### Context Provider 層級結構

```typescript
<LanguageProvider>
  <AuthProvider>          {/* 新增：提供身份驗證 */}
    <FilterProvider>
      <ToastProvider>
        <AppRouter />      {/* 檢查登入狀態 */}
      </ToastProvider>
    </FilterProvider>
  </AuthProvider>
</LanguageProvider>
```

### 登入頁面保護邏輯

```typescript
// AppRouter.tsx
export function AppRouter() {
  const { isAuthenticated, login } = useAuth();

  // 未登入時顯示登入頁面
  if (!isAuthenticated) {
    return <LoginPage onLogin={login} />;
  }

  // 已登入時顯示主系統
  return (
    <Box sx={{ display: 'flex' }}>
      {/* 側邊欄 */}
      <Drawer>...</Drawer>

      {/* 主內容 */}
      <Box component="main">
        {renderCurrentView()}
      </Box>
    </Box>
  );
}
```

---

## 🚀 未來擴展方向

### 1. 後端整合

目前使用模擬資料（MOCK_USERS），未來可以：

```typescript
// 改為呼叫後端 API
const login = async (username: string, password: string) => {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const data = await response.json();

    if (data.success) {
      setUser(data.user);
      setIsAuthenticated(true);
      localStorage.setItem('authToken', data.token); // JWT Token
      return true;
    }

    return false;
  } catch (error) {
    console.error('Login failed:', error);
    return false;
  }
};
```

### 2. JWT Token 管理

```typescript
// 在每個 API 請求加入 Token
const fetchWithAuth = async (url: string, options?: RequestInit) => {
  const token = localStorage.getItem('authToken');

  return fetch(url, {
    ...options,
    headers: {
      ...options?.headers,
      'Authorization': `Bearer ${token}`
    }
  });
};
```

### 3. 自動登出機制

```typescript
// Token 過期自動登出
useEffect(() => {
  const checkTokenExpiry = () => {
    const token = localStorage.getItem('authToken');
    if (token) {
      const decoded = jwtDecode(token);
      if (decoded.exp * 1000 < Date.now()) {
        logout(); // Token 過期，自動登出
      }
    }
  };

  const interval = setInterval(checkTokenExpiry, 60000); // 每分鐘檢查
  return () => clearInterval(interval);
}, []);
```

### 4. 更多角色類型

```typescript
type UserRole = 'admin' | 'operator' | 'viewer' | 'engineer';

// 權限控制
const permissions = {
  admin: ['read', 'write', 'delete', 'manage'],
  operator: ['read', 'write'],
  viewer: ['read'],
  engineer: ['read', 'write', 'analyze']
};
```

### 5. 忘記密碼功能

```typescript
// 新增忘記密碼頁面
- 輸入 Email
- 發送重設連結
- 驗證 Token
- 設定新密碼
```

---

## 🐛 故障排除

### 問題 1：npm 模組錯誤

如果遇到 `Cannot find module @rollup/rollup-linux-x64-gnu` 錯誤：

```bash
# 解決方案
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### 問題 2：登入狀態不保存

檢查瀏覽器是否啟用了 localStorage：

```javascript
// 測試 localStorage
try {
  localStorage.setItem('test', 'test');
  localStorage.removeItem('test');
  console.log('localStorage 可用');
} catch (e) {
  console.error('localStorage 不可用');
}
```

### 問題 3：翻譯鍵值找不到

確認 LanguageContext.tsx 中已加入所有翻譯：

```javascript
// 檢查是否有以下鍵值
'login.title'
'login.subtitle'
'login.username'
// ... 等等
```

---

## 📚 學習重點

### React Concept

1. **Context API**：全域狀態管理
   ```typescript
   createContext → Provider → useContext
   ```

2. **Custom Hook**：封裝邏輯重用
   ```typescript
   export function useAuth() {
     const context = useContext(AuthContext);
     return context;
   }
   ```

3. **Conditional Rendering**：條件渲染
   ```typescript
   if (!isAuthenticated) return <LoginPage />;
   return <MainApp />;
   ```

### TypeScript Concept

1. **Interface 定義**：型別安全
   ```typescript
   interface User {
     username: string;
     displayName: string;
     role: 'admin' | 'user';
   }
   ```

2. **聯合類型**：限制值的範圍
   ```typescript
   type UserRole = 'admin' | 'user';
   ```

3. **可選屬性**：使用 `?`
   ```typescript
   user?: User | null
   ```

### Material-UI Concept

1. **玻璃擬態效果**
   ```typescript
   background: 'linear-gradient(...)',
   backdropFilter: 'blur(20px)'
   ```

2. **動畫實作**
   ```typescript
   '@keyframes gradient': {
     '0%, 100%': { backgroundPosition: '0% 50%' },
     '50%': { backgroundPosition: '100% 50%' }
   }
   ```

---

*最後更新: 2025-10-09*
*功能狀態: ✅ 完成並測試*
