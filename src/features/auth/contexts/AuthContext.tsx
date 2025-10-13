/**
 * AuthContext.tsx - 身份驗證狀態管理
 *
 * 功能：
 * 1. 管理使用者登入/登出狀態
 * 2. 提供使用者資訊
 * 3. 持久化登入狀態（localStorage）
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// 使用者資訊介面
interface User {
  username: string;
  displayName: string;
  role: 'admin' | 'user';
}

// AuthContext 型別定義
interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
}

// 建立 Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 測試帳號資料（實際應用應該連接後端 API）
const MOCK_USERS = [
  { username: 'admin', password: 'admin123', displayName: 'Administrator', role: 'admin' as const },
  { username: 'user', password: 'user123', displayName: 'Test User', role: 'user' as const },
];

/**
 * AuthProvider 組件
 *
 * 提供身份驗證功能給整個應用程式
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  /**
   * 登入函數
   *
   * @param username - 使用者名稱
   * @param password - 密碼
   * @returns 登入是否成功
   */
  const login = (username: string, password: string): boolean => {
    // 尋找匹配的使用者
    const foundUser = MOCK_USERS.find(
      (u) => u.username === username && u.password === password
    );

    if (foundUser) {
      const userData: User = {
        username: foundUser.username,
        displayName: foundUser.displayName,
        role: foundUser.role,
      };

      setUser(userData);
      setIsAuthenticated(true);

      // 儲存到 localStorage（不包含密碼）
      localStorage.setItem('authUser', JSON.stringify(userData));
      localStorage.setItem('isAuthenticated', 'true');

      return true;
    }

    return false;
  };

  /**
   * 登出函數
   */
  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);

    // 清除 localStorage
    localStorage.removeItem('authUser');
    localStorage.removeItem('isAuthenticated');
  };

  /**
   * 初始化：從 localStorage 恢復登入狀態
   */
  useEffect(() => {
    const storedAuth = localStorage.getItem('isAuthenticated');
    const storedUser = localStorage.getItem('authUser');

    if (storedAuth === 'true' && storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Failed to parse stored user data:', error);
        logout();
      }
    }
  }, []);

  const value: AuthContextType = {
    isAuthenticated,
    user,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * useAuth Hook
 *
 * 在組件中使用身份驗證功能
 *
 * @example
 * const { isAuthenticated, user, login, logout } = useAuth();
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
