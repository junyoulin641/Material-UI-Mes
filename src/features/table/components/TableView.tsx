import * as React from 'react';
import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  DataGrid,
  GridToolbarContainer,
  GridToolbarExport,
  GridToolbarFilterButton,
  GridToolbarDensitySelector,
  GridToolbarColumnsButton,
  GridColDef,
  GridRowsProp,
} from '@mui/x-data-grid';
import {
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Visibility as VisibilityIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Home as HomeIcon,
  NavigateNext as NavigateNextIcon,
} from '@mui/icons-material';
import {
  Breadcrumbs,
  Link,
} from '@mui/material';
import { useLanguage } from '../../../contexts/LanguageContext';
import { getMESDatabase } from '../../../utils/MESDatabase';
import { useNavigation } from '../../common/components/AppRouter';

// 自定義工具欄
function CustomToolbar({ onRefresh, onExport }: { onRefresh: () => void; onExport: () => void }) {
  return (
    <GridToolbarContainer>
      <GridToolbarColumnsButton />
      <GridToolbarFilterButton />
      <GridToolbarDensitySelector />
      <GridToolbarExport />
      <Button
        startIcon={<RefreshIcon />}
        onClick={onRefresh}
        size="small"
        sx={{ ml: 1 }}
      >
        刷新
      </Button>
    </GridToolbarContainer>
  );
}

// 從 IndexedDB 載入資料
const loadDataFromStorage = async (): Promise<GridRowsProp> => {
  try {
    // 優先從 IndexedDB 載入
    const db = await getMESDatabase();
    const records = await db.getAllTestRecords();

    if (records.length > 0) {
      console.log(`從 IndexedDB 載入 ${records.length} 筆記錄`);
      return records.map((record, index) => ({
        id: record.id || index + 1,
        serialNumber: record.serialNumber || '',
        workOrder: record.workOrder || '',
        station: record.station || '',
        model: record.model || '',
        result: record.result || 'FAIL',
        testTime: record.testTime || new Date().toISOString(),
        tester: record.tester || 'Unknown',
        partNumber: record.partNumber || `PN-${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
        testDuration: 120,
        items: record.items || [],
      }));
    }
  } catch (error) {
    console.error('從 IndexedDB 載入資料失敗，嘗試 localStorage:', error);
  }

  // 備援：從 localStorage 載入
  try {
    const storedData = localStorage.getItem('mesTestData');
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      console.log(`從 localStorage 載入 ${parsedData.length} 筆記錄`);
      return parsedData.map((record: any, index: number) => ({
        id: index + 1,
        serialNumber: record.serialNumber || '',
        workOrder: record.workOrder || '',
        station: record.station || '',
        model: record.model || '',
        result: record.result || 'FAIL',
        testTime: record.testTime || new Date().toISOString(),
        tester: record.tester || 'Unknown',
        partNumber: record.partNumber || `PN-${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
        testDuration: 120,
        items: record.items || [],
      }));
    }
  } catch (error) {
    console.error('從 localStorage 載入資料時發生錯誤:', error);
  }

  return [];
};
interface EnhancedTableViewProps {
  title?: string;
  showAdvancedFilters?: boolean;
}

export default function EnhancedTableView({
  title = "測試記錄檢視",
  showAdvancedFilters = true
}: EnhancedTableViewProps) {
  const { t } = useLanguage();
  const { setCurrentView } = useNavigation();
  const [data, setData] = useState<GridRowsProp>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  // 初始載入資料
  useEffect(() => {
    const loadInitialData = async () => {
      const initialData = await loadDataFromStorage();
      setData(initialData);
    };

    loadInitialData();
  }, []);

  // 監聽資料變化並自動重新載入
  useEffect(() => {
    const handleStorageChange = async (e: StorageEvent) => {
      if (e.key === 'mesTestData') {
        console.log('檢測到資料更新，重新載入表格資料...');
        const newData = await loadDataFromStorage();
        setData(newData);
        console.log(`表格資料已更新: ${newData.length} 筆記錄`);
      }
    };

    // 自定義事件監聽器，用於同頁面內的資料更新
    const handleCustomUpdate = async () => {
      console.log('收到自定義更新事件，重新載入表格資料...');
      const newData = await loadDataFromStorage();
      setData(newData);
      console.log(`表格資料已更新: ${newData.length} 筆記錄`);
    };

    // 監聽 storage 事件
    window.addEventListener('storage', handleStorageChange);

    // 監聽自定義事件（同頁面內的更新）
    window.addEventListener('mesDataUpdated', handleCustomUpdate);

    // 定期檢查資料更新（降低頻率到10秒）
    const interval = setInterval(async () => {
      try {
        const currentData = await loadDataFromStorage();
        if (currentData.length !== data.length) {
          console.log(`🔄 定期檢查發現資料變化: ${data.length} → ${currentData.length}`);
          setData(currentData);
        }
      } catch (error) {
        console.error('定期檢查資料更新失敗:', error);
      }
    }, 10000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('mesDataUpdated', handleCustomUpdate);
      clearInterval(interval);
    };
  }, [data.length]);

  // 篩選狀態
  const [filters, setFilters] = useState({
    serial: '',
    station: '',
    model: '',
    result: '',
    dateFrom: '',
    dateTo: '',
  });

  // 從系統設定讀取站別和機種配置
  const configuredStations = useMemo(() => {
    try {
      const saved = localStorage.getItem('mesStations');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  }, []);

  const configuredModels = useMemo(() => {
    try {
      const saved = localStorage.getItem('mesModels');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  }, []);

  // 動態產生欄位 - 仿原始MES系統邏輯
  const columns: GridColDef[] = useMemo(() => {
    // 基本系統欄位
    const baseColumns: GridColDef[] = [
      {
        field: 'serialNumber',
        headerName: t('column.serial.number'),
        width: 200,
        fontFamily: 'monospace',
      },
      {
        field: 'workOrder',
        headerName: t('column.work.order'),
        width: 150,
        fontFamily: 'monospace',
      },
      {
        field: 'partNumber',
        headerName: t('column.part.number'),
        width: 130,
        fontFamily: 'monospace',
        renderCell: (params) => (
          <Chip
            label={params.value}
            size="small"
            color="secondary"
            variant="outlined"
          />
        ),
      },
      {
        field: 'station',
        headerName: t('column.station'),
        width: 120,
        renderCell: (params) => (
          <Chip
            label={params.value}
            size="small"
            variant="outlined"
          />
        ),
      },
      {
        field: 'model',
        headerName: t('column.model'),
        width: 100,
        renderCell: (params) => (
          <Chip
            label={params.value}
            size="small"
            color="primary"
            variant="outlined"
          />
        ),
      },
      {
        field: 'result',
        headerName: t('column.result'),
        width: 100,
        renderCell: (params) => (
          <Chip
            label={params.value}
            size="small"
            color={params.value === 'PASS' ? 'success' : 'error'}
            variant="outlined"
          />
        ),
      },
      {
        field: 'testTime',
        headerName: t('column.test.time'),
        width: 180,
        type: 'dateTime',
        valueGetter: (value) => new Date(value),
      },
      {
        field: 'tester',
        headerName: t('column.tester'),
        width: 120,
      },
    ];

    // 動態測項欄位 - 仿原始MES系統邏輯
    if (data.length > 0) {
      // 收集所有測項名稱
      const allTestItems = new Set<string>();
      data.forEach(record => {
        if (record.items && Array.isArray(record.items)) {
          record.items.forEach(item => {
            if (item.name && !item.name.match(/^(date\s*time|datetime|test\s*time|date|time)$/i)) {
              allTestItems.add(item.name);
            }
          });
        }
      });

      // 為每個測項創建欄位
      const testItemColumns: GridColDef[] = Array.from(allTestItems).sort().map(itemName => ({
        field: `testItem_${itemName}`,
        headerName: itemName,
        width: 120,
        renderCell: (params) => {
          const record = data.find(r => r.id === params.id);
          if (record?.items) {
            const testItem = record.items.find(item => item.name === itemName);
            if (testItem) {
              const value = testItem.value || testItem.result || '';
              const isNumeric = !isNaN(Number(value)) && value !== '';
              const color = testItem.result === 'FAIL' ? 'error' :
                           testItem.result === 'PASS' ? 'success' : 'default';

              return (
                <Chip
                  label={value}
                  size="small"
                  color={color}
                  variant="outlined"
                  sx={{
                    fontFamily: isNumeric ? 'monospace' : 'inherit',
                    fontSize: '0.75rem'
                  }}
                />
              );
            }
          }
          return <span style={{ color: '#999' }}>-</span>;
        },
        valueGetter: (value, row) => {
          const testItem = row.items?.find(item => item.name === itemName);
          return testItem?.value || testItem?.result || '';
        }
      }));

      baseColumns.push(...testItemColumns);
    }

    return baseColumns;
  }, [data]);

  // 過濾資料
  const filteredData = useMemo(() => {
    return data.filter(row => {
      return (
        (!filters.serial || row.serialNumber.toLowerCase().includes(filters.serial.toLowerCase())) &&
        (!filters.station || row.station === filters.station) &&
        (!filters.model || row.model === filters.model) &&
        (!filters.result || row.result === filters.result) &&
        (!filters.dateFrom || new Date(row.testTime) >= new Date(filters.dateFrom)) &&
        (!filters.dateTo || new Date(row.testTime) <= new Date(filters.dateTo))
      );
    });
  }, [data, filters]);

  const handleRefresh = useCallback(async () => {
    setLoading(true);
    try {
      const refreshedData = await loadDataFromStorage();
      setData(refreshedData);
    } catch (error) {
      console.error('重新整理資料失敗:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleExport = useCallback(() => {
    const csvContent = [
      ['序號', '工單', '站別', '機種', '結果', '測試時間', '測試員'].join(','),
      ...filteredData.map(row => [
        row.serialNumber,
        row.workOrder,
        row.station,
        row.model,
        row.result,
        new Date(row.testTime).toLocaleString(),
        row.tester
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `MES_TestRecords_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  }, [filteredData]);

  const handleViewDetails = (row: any) => {
    setSelectedRow(row);
    setPreviewOpen(true);
  };

  const handleDownloadLog = (row: any) => {
    // 模擬 LOG 下載
    const logContent = `Test Log for ${row.serialNumber}\n` +
      `Station: ${row.station}\n` +
      `Model: ${row.model}\n` +
      `Result: ${row.result}\n` +
      `Test Time: ${new Date(row.testTime).toLocaleString()}\n` +
      `Tester: ${row.tester}\n` +
      `Duration: ${row.testDuration}s\n` +
      `Part Number: ${row.partNumber}\n\n` +
      `Test Items:\n` +
      row.items.map((item: any) => `${item.name}: ${item.value}`).join('\n');

    const blob = new Blob([logContent], { type: 'text/plain;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${row.serialNumber}_${row.station}.log`;
    link.click();
  };

  return (
    <Box sx={{
      width: '100%',
      height: '100%',
      pl: { xs: 2, sm: 3, md: 4 }, // 增加左側邊距
      pr: { xs: 2, sm: 3 },
      py: 3
    }}>
      {/* 頁面標題 */}
      <Box mb={3}>
        {/* 麵包屑導航 */}
        <Breadcrumbs
          separator={<NavigateNextIcon fontSize="small" />}
          sx={{ mb: 2 }}
        >
          <Link
            underline="hover"
            sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary', cursor: 'pointer' }}
            onClick={() => setCurrentView('dashboard')}
          >
            <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
            首頁
          </Link>
          <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
            測試記錄
          </Typography>
        </Breadcrumbs>

        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
           {title}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          查看和管理所有製造測試記錄，支援進階篩選和資料匯出功能
        </Typography>
      </Box>

      {/* 進階篩選 */}
      {showAdvancedFilters && (
        <Paper elevation={1} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
          <Box mb={2}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <FilterListIcon />
              資料篩選
            </Typography>
          </Box>

          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <TextField
                fullWidth
                size="small"
                label="序號關鍵字"
                placeholder="輸入序號..."
                value={filters.serial}
                onChange={(e) => setFilters(prev => ({ ...prev, serial: e.target.value }))}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <FormControl fullWidth size="small">
                <InputLabel>站別</InputLabel>
                <Select
                  value={filters.station}
                  label="站別"
                  onChange={(e) => setFilters(prev => ({ ...prev, station: e.target.value }))}
                >
                  <MenuItem value="">全部站別</MenuItem>
                  {configuredStations.map((station) => (
                    <MenuItem key={station} value={station}>
                      {station}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <FormControl fullWidth size="small">
                <InputLabel>機種</InputLabel>
                <Select
                  value={filters.model}
                  label="機種"
                  onChange={(e) => setFilters(prev => ({ ...prev, model: e.target.value }))}
                >
                  <MenuItem value="">全部機種</MenuItem>
                  {configuredModels.map((model) => (
                    <MenuItem key={model} value={model}>
                      {model}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <FormControl fullWidth size="small">
                <InputLabel>結果</InputLabel>
                <Select
                  value={filters.result}
                  label="結果"
                  onChange={(e) => setFilters(prev => ({ ...prev, result: e.target.value }))}
                >
                  <MenuItem value="">全部結果</MenuItem>
                  <MenuItem value="PASS">PASS</MenuItem>
                  <MenuItem value="FAIL">FAIL</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <TextField
                fullWidth
                size="small"
                type="date"
                label="開始日期"
                InputLabelProps={{ shrink: true }}
                value={filters.dateFrom}
                onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <TextField
                fullWidth
                size="small"
                type="date"
                label="結束日期"
                InputLabelProps={{ shrink: true }}
                value={filters.dateTo}
                onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
              />
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* 資料表格 */}
      <Paper sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={filteredData}
          columns={columns}
          loading={loading}
          pageSizeOptions={[25, 50, 100]}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 25 },
            },
          }}
          slots={{
            toolbar: CustomToolbar,
          }}
          slotProps={{
            toolbar: {
              onRefresh: handleRefresh,
              onExport: handleExport,
            },
          }}
          checkboxSelection
          disableRowSelectionOnClick
          sx={{
            '& .MuiDataGrid-toolbarContainer': {
              borderBottom: '1px solid #e0e0e0',
              padding: '8px 16px',
            },
          }}
        />
      </Paper>

      {/* 詳情預覽對話框 */}
      <Dialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2, maxHeight: '80vh' }
        }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">測試記錄詳情</Typography>
          <IconButton onClick={() => setPreviewOpen(false)} size="small">
            ✕
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          {selectedRow && (
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="subtitle2">序號</Typography>
                <Typography variant="body1" sx={{ fontFamily: 'monospace', mb: 2 }}>
                  {selectedRow.serialNumber}
                </Typography>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="subtitle2">工單</Typography>
                <Typography variant="body1" sx={{ fontFamily: 'monospace', mb: 2 }}>
                  {selectedRow.workOrder}
                </Typography>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="subtitle2">料號</Typography>
                <Chip label={selectedRow.partNumber} size="small" color="secondary" variant="outlined" sx={{ mb: 2 }} />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="subtitle2">站別</Typography>
                <Chip label={selectedRow.station} size="small" variant="outlined" sx={{ mb: 2 }} />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="subtitle2">機種</Typography>
                <Chip label={selectedRow.model} size="small" color="primary" variant="outlined" sx={{ mb: 2 }} />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="subtitle2">測試結果</Typography>
                <Chip
                  label={selectedRow.result}
                  size="small"
                  color={selectedRow.result === 'PASS' ? 'success' : 'error'}
                  variant="outlined"
                  sx={{ mb: 2 }}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="subtitle2">測試時間</Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {new Date(selectedRow.testTime).toLocaleString()}
                </Typography>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="subtitle2">測試員</Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {selectedRow.tester}
                </Typography>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="subtitle2">測試時長</Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {selectedRow.testDuration} 秒
                </Typography>
              </Grid>

              <Grid size={12}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>測試項目</Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {selectedRow.items?.map((item: any, index: number) => (
                    <Chip
                      key={index}
                      label={`${item.name}: ${item.value}`}
                      size="small"
                      color={item.value === 'PASS' ? 'success' : 'error'}
                      variant="outlined"
                    />
                  ))}
                </Box>
              </Grid>
            </Grid>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setPreviewOpen(false)}>關閉</Button>
          {selectedRow?.result === 'FAIL' && (
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={() => handleDownloadLog(selectedRow)}
            >
              下載 LOG
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}