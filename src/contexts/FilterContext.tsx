import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface GlobalFilterOptions {
  dateRange?: 'all' | 'today' | 'yesterday' | 'this-week' | 'last-week' | 'this-month' | 'last-month' | 'custom';
  result?: 'all' | 'pass' | 'fail';
  serialNumber?: string;
  workOrder?: string;
  station?: string;
  model?: string;
  dateFrom?: string;
  dateTo?: string;
  startTime?: string;
  endTime?: string;
}

interface FilterContextType {
  filters: GlobalFilterOptions;
  setFilters: (filters: GlobalFilterOptions) => void;
  updateFilters: (partialFilters: Partial<GlobalFilterOptions>) => void;
  resetFilters: () => void;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

// 計算今日日期範圍
const getTodayRange = () => {
  const today = new Date();
  const dateStr = today.toISOString().split('T')[0];
  return { dateFrom: dateStr, dateTo: dateStr };
};

// 預設篩選條件
const getDefaultFilters = (): GlobalFilterOptions => {
  const todayRange = getTodayRange();
  return {
    dateRange: 'today',
    result: 'all',
    serialNumber: '',
    workOrder: '',
    station: '',
    model: '',
    dateFrom: todayRange.dateFrom,
    dateTo: todayRange.dateTo,
    startTime: '00:00',
    endTime: '23:59',
  };
};

export function FilterProvider({ children }: { children: ReactNode }) {
  const [filters, setFiltersState] = useState<GlobalFilterOptions>(getDefaultFilters());

  const setFilters = (newFilters: GlobalFilterOptions) => {
    setFiltersState(newFilters);
  };

  const updateFilters = (partialFilters: Partial<GlobalFilterOptions>) => {
    setFiltersState(prev => ({ ...prev, ...partialFilters }));
  };

  const resetFilters = () => {
    setFiltersState(getDefaultFilters());
  };

  return (
    <FilterContext.Provider value={{ filters, setFilters, updateFilters, resetFilters }}>
      {children}
    </FilterContext.Provider>
  );
}

export function useFilters() {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error('useFilters must be used within FilterProvider');
  }
  return context;
}
