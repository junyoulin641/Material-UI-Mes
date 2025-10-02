// 共用驗證工具函數

/**
 * 驗證序號格式
 */
export function isValidSerialNumber(serial: string): boolean {
  // 基本格式驗證：至少 8 個字符
  return serial.length >= 8;
}

/**
 * 驗證工單號碼格式
 */
export function isValidWorkOrder(workOrder: string): boolean {
  // 工單格式：XXXXXXXXXX-XXXXX
  const pattern = /^\d{10}-\d{5}$/;
  return pattern.test(workOrder);
}

/**
 * 驗證日期範圍
 */
export function isValidDateRange(startDate: Date | string, endDate: Date | string): boolean {
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate;

  return start <= end;
}

/**
 * 驗證 Email
 */
export function isValidEmail(email: string): boolean {
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return pattern.test(email);
}

/**
 * 驗證數字範圍
 */
export function isInRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max;
}

/**
 * 驗證必填欄位
 */
export function isRequired(value: any): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
}
