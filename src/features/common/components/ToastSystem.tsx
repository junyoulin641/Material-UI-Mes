import * as React from 'react';
import { createContext, useContext, useState, useCallback } from 'react';
import {
  Alert,
  AlertTitle,
} from '@mui/material';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastMessage {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  autoHide?: boolean;
  duration?: number;
}

interface ToastContextType {
  showToast: (type: ToastType, message: string, title?: string, options?: { autoHide?: boolean; duration?: number }) => void;
  showSuccess: (message: string, title?: string) => void;
  showError: (message: string, title?: string) => void;
  showWarning: (message: string, title?: string) => void;
  showInfo: (message: string, title?: string) => void;
  hideToast: (id?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((
    type: ToastType,
    message: string,
    title?: string,
    options?: { autoHide?: boolean; duration?: number }
  ) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const newToast: ToastMessage = {
      id,
      type,
      title,
      message,
      autoHide: options?.autoHide ?? true,
      duration: options?.duration ?? (type === 'error' ? 6000 : 4000),
    };

    setToasts(prev => [...prev, newToast]);

    // 自動隱藏
    if (newToast.autoHide) {
      setTimeout(() => {
        hideToast(id);
      }, newToast.duration);
    }
  }, []);

  const showSuccess = useCallback((message: string, title?: string) => {
    showToast('success', message, title);
  }, [showToast]);

  const showError = useCallback((message: string, title?: string) => {
    showToast('error', message, title);
  }, [showToast]);

  const showWarning = useCallback((message: string, title?: string) => {
    showToast('warning', message, title);
  }, [showToast]);

  const showInfo = useCallback((message: string, title?: string) => {
    showToast('info', message, title);
  }, [showToast]);

  const hideToast = useCallback((id?: string) => {
    if (id) {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    } else {
      // 隱藏最新的 toast
      setToasts(prev => prev.slice(0, -1));
    }
  }, []);

  const handleClose = useCallback((id: string) => {
    hideToast(id);
  }, [hideToast]);

  return (
    <ToastContext.Provider value={{
      showToast,
      showSuccess,
      showError,
      showWarning,
      showInfo,
      hideToast,
    }}>
      {children}

      {/* 渲染 Toast 通知 - 垂直堆疊避免重疊 */}
      <div style={{
        position: 'fixed',
        top: 16,
        right: 16,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        pointerEvents: 'none',
      }}>
        {toasts.map((toast) => (
          <div key={toast.id} style={{ pointerEvents: 'auto' }}>
            <Alert
              onClose={() => handleClose(toast.id)}
              severity={toast.type}
              variant="filled"
              sx={{
                minWidth: 300,
                maxWidth: 500,
                boxShadow: 3,
                '& .MuiAlert-message': {
                  width: '100%',
                },
              }}
            >
              {toast.title && (
                <AlertTitle>{toast.title}</AlertTitle>
              )}
              {toast.message}
            </Alert>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

// 預設的 Toast Hook，包含常用的通知訊息
export function useCommonToasts() {
  const { showSuccess, showError, showWarning, showInfo } = useToast();

  return {
    // 資料操作相關
    onDataRefreshed: () => showSuccess('資料已重新整理'),
    onDataExported: () => showSuccess('資料匯出成功'),
    onDataImported: () => showSuccess('資料匯入成功'),
    onDataSaved: () => showSuccess('資料儲存成功'),
    onDataDeleted: () => showSuccess('資料刪除成功'),

    // 錯誤相關
    onDataLoadError: () => showError('資料載入失敗，請重試'),
    onNetworkError: () => showError('網路連線錯誤，請檢查網路設定'),
    onPermissionError: () => showError('權限不足，請聯絡管理員'),
    onValidationError: (message: string) => showError(`驗證失敗：${message}`),

    // 警告相關
    onDataOutdated: () => showWarning('資料可能已過期，建議重新整理'),
    onQuotaWarning: () => showWarning('儲存空間即將用盡'),
    onPerformanceWarning: () => showWarning('系統負載較高，可能影響效能'),

    // 資訊相關
    onDataFiltered: (count: number) => showInfo(`已篩選出 ${count} 筆記錄`),
    onAutoSave: () => showInfo('已自動儲存', '自動儲存'),
    onSystemMaintenance: () => showInfo('系統將於今晚進行維護', '系統通知'),

    // 測試相關
    onTestCompleted: (result: string) => {
      if (result === 'PASS') {
        showSuccess('測試通過');
      } else {
        showError('測試失敗');
      }
    },
    onLogDownloaded: () => showSuccess('LOG 檔案下載完成'),
    onRetestScheduled: () => showInfo('已安排複測'),

    // 通用方法
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };
}

export default ToastProvider;