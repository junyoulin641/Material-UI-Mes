/**
 * App.tsx - MES 系統的根組件 (Root Component)
 *
 * 這是整個應用程式的入口點，負責設定全域的 Context Providers
 *
 * React 基礎概念：
 * 1. Component（組件）: React 的基本建構單元，類似樂高積木
 * 2. JSX: JavaScript + XML 的語法，讓你用類似 HTML 的方式寫 UI
 * 3. Props: 組件之間傳遞資料的方式
 * 4. Context: 跨組件共享資料的機制（避免 Props 層層傳遞）
 */

// ===== Import 區塊 =====
// React 核心庫
import * as React from "react";

// Material-UI 的 CSS 重置組件（統一瀏覽器樣式）
import CssBaseline from "@mui/material/CssBaseline";

// 自訂的 Context Providers（提供全域狀態）
import { LanguageProvider } from "./contexts/LanguageContext";           // 多語言支援
import { FilterProvider } from "./contexts/FilterContext";               // 全域篩選狀態
import { ToastProvider } from "./features/common/components/ToastSystem"; // 通知系統
import AppRouter from "./features/common/components/AppRouter";           // 路由系統

/**
 * App 組件 - 應用程式的根組件
 *
 * export default: 這是 ES6 的模組匯出語法，讓其他檔案可以引入這個組件
 * function: 定義一個 React 函數組件（Function Component）
 *
 * 為什麼用 function 而不是 class？
 * - 函數組件更簡潔、易讀
 * - 可以使用 React Hooks（useState, useEffect 等）
 * - React 官方推薦的現代寫法
 */
export default function App() {
  /**
   * return: 回傳 JSX（React 的 UI 描述語法）
   *
   * JSX 規則：
   * 1. 必須有一個根元素包裹所有內容
   * 2. 使用駝峰式命名（className 而非 class）
   * 3. 可以嵌入 JavaScript 表達式（用 {} 包裹）
   */
  return (
    /**
     * Context Provider 洋蔥式結構（從外到內）
     *
     * 為什麼要這樣層層包裹？
     * - 讓內部的所有組件都能存取這些 Context
     * - 類似「提供環境」給子組件使用
     *
     * 比喻：
     * LanguageProvider = 提供「語言翻譯服務」
     * ToastProvider = 提供「通知系統服務」
     * AppRouter = 實際的應用程式內容
     */
    <LanguageProvider>
      {/* 提供多語言功能給所有子組件 */}
      <FilterProvider>
        {/* 提供全域篩選狀態給所有子組件 */}
        <ToastProvider>
          {/* 提供通知系統功能給所有子組件 */}

          {/*
            CssBaseline: Material-UI 的 CSS 重置組件
            - 移除瀏覽器預設樣式
            - 統一不同瀏覽器的顯示效果
            - enableColorScheme: 支援深淺色主題切換
          */}
          <CssBaseline enableColorScheme />

          {/*
            AppRouter: 主要的路由和導航系統
            - 負責根據 URL 顯示不同的頁面
            - 包含側邊欄導航
            - 管理頁面切換邏輯
          */}
          <AppRouter />
        </ToastProvider>
      </FilterProvider>
    </LanguageProvider>
  );
}

/**
 * 學習重點：
 *
 * 1. 組件組合 (Component Composition)
 *    - App 是由多個小組件組合而成
 *    - 每個組件負責單一職責
 *
 * 2. Context Pattern（上下文模式）
 *    - Provider 提供資料
 *    - Consumer（在子組件中）消費資料
 *    - 避免 Props Drilling（層層傳遞 props）
 *
 * 3. 聲明式 UI (Declarative UI)
 *    - 描述「想要什麼」而非「如何做」
 *    - React 會自動處理 DOM 更新
 *
 * 下一步學習：
 * - 看 LanguageContext.tsx 了解如何建立 Context
 * - 看 AppRouter.tsx 了解路由系統
 * - 看 DashboardView.tsx 了解如何使用 Hooks
 */
