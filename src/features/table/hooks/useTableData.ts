// Table 資料管理 Hook

import { useState, useEffect, useMemo } from 'react';
import { TestRecord, TableFilters, SortConfig } from '../types';

const DEFAULT_FILTERS: TableFilters = {
  searchTerm: '',
  station: '',
  model: '',
  result: 'ALL',
  dateFrom: '',
  dateTo: ''
};

export function useTableData() {
  const [records, setRecords] = useState<TestRecord[]>([]);
  const [filters, setFilters] = useState<TableFilters>(DEFAULT_FILTERS);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ field: null, direction: null });
  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  // 從 localStorage 載入資料
  useEffect(() => {
    try {
      const stored = localStorage.getItem('mesTestRecords');
      if (stored) {
        setRecords(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load records:', error);
    }
  }, []);

  // 篩選資料
  const filteredRecords = useMemo(() => {
    return records.filter(record => {
      // 搜尋條件
      if (filters.searchTerm) {
        const term = filters.searchTerm.toLowerCase();
        const matchSerial = record.serial?.toLowerCase().includes(term);
        const matchWorkOrder = record.workOrder?.toLowerCase().includes(term);
        if (!matchSerial && !matchWorkOrder) return false;
      }

      // 站別篩選
      if (filters.station && record.station !== filters.station) return false;

      // 機種篩選
      if (filters.model && record.model !== filters.model) return false;

      // 結果篩選
      if (filters.result !== 'ALL' && record.result !== filters.result) return false;

      // 日期範圍篩選
      if (filters.dateFrom) {
        const recordDate = new Date(record.datetime);
        const fromDate = new Date(filters.dateFrom);
        if (recordDate < fromDate) return false;
      }

      if (filters.dateTo) {
        const recordDate = new Date(record.datetime);
        const toDate = new Date(filters.dateTo);
        toDate.setHours(23, 59, 59, 999);
        if (recordDate > toDate) return false;
      }

      return true;
    });
  }, [records, filters]);

  // 排序資料
  const sortedRecords = useMemo(() => {
    if (!sortConfig.field || !sortConfig.direction) {
      return filteredRecords;
    }

    return [...filteredRecords].sort((a, b) => {
      const aValue = a[sortConfig.field as keyof TestRecord];
      const bValue = b[sortConfig.field as keyof TestRecord];

      if (aValue === undefined || bValue === undefined) return 0;

      let comparison = 0;
      if (aValue > bValue) comparison = 1;
      if (aValue < bValue) comparison = -1;

      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });
  }, [filteredRecords, sortConfig]);

  // 分頁資料
  const paginatedRecords = useMemo(() => {
    const start = currentPage * rowsPerPage;
    const end = start + rowsPerPage;
    return sortedRecords.slice(start, end);
  }, [sortedRecords, currentPage, rowsPerPage]);

  return {
    // 資料
    allRecords: records,
    filteredRecords,
    sortedRecords,
    paginatedRecords,

    // 篩選
    filters,
    setFilters,
    updateFilter: (key: keyof TableFilters, value: string) => {
      setFilters(prev => ({ ...prev, [key]: value }));
      setCurrentPage(0); // 重置到第一頁
    },
    clearFilters: () => {
      setFilters(DEFAULT_FILTERS);
      setCurrentPage(0);
    },

    // 排序
    sortConfig,
    setSortConfig,
    handleSort: (field: string) => {
      setSortConfig(prev => {
        if (prev.field === field) {
          if (prev.direction === 'asc') return { field, direction: 'desc' };
          if (prev.direction === 'desc') return { field: null, direction: null };
        }
        return { field, direction: 'asc' };
      });
    },

    // 分頁
    currentPage,
    setCurrentPage,
    rowsPerPage,
    setRowsPerPage,
    totalRecords: sortedRecords.length,
    totalPages: Math.ceil(sortedRecords.length / rowsPerPage),

    // 重新載入
    refreshData: () => {
      const stored = localStorage.getItem('mesTestRecords');
      if (stored) {
        setRecords(JSON.parse(stored));
      }
    }
  };
}
