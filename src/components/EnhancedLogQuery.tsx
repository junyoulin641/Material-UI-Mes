import * as React from 'react';
import { useState, useMemo, useCallback } from 'react';
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  Download as DownloadIcon,
  Visibility as VisibilityIcon,
  Refresh as RefreshIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useLanguage } from '../contexts/LanguageContext';

// 模擬 LOG 檔案資料
const generateLogData = () => {
  const stations: string[] = [];
  const models: string[] = [];
  const results = ['PASS', 'FAIL'];

  const logs = [];
  for (let i = 0; i < 200; i++) {
    const randomDate = new Date();
    randomDate.setDate(randomDate.getDate() - Math.floor(Math.random() * 30));

    const serial = `CH${Math.random().toString().substr(2, 12)}`;
    const station = stations[Math.floor(Math.random() * stations.length)];
    const model = models[Math.floor(Math.random() * models.length)];
    const result = Math.random() > 0.2 ? 'PASS' : 'FAIL';

    logs.push({
      id: i + 1,
      workOrder: `6210018423-000${String(Math.floor(Math.random() * 100)).padStart(2, '0')}`,
      serialNumber: serial,
      station,
      model,
      result,
      testTime: randomDate.toISOString(),
      tester: `2001092${Math.floor(Math.random() * 10)}A`,
      fileName: `${model}-FixtureNumber[1]-${randomDate.toISOString().slice(0, 10).replace(/-/g, '')}-${randomDate.toTimeString().slice(0, 8).replace(/:/g, '')}-${serial}[1].log`,
      logContent: generateLogContent(serial, station, model, result),
      fileSize: Math.floor(Math.random() * 50000) + 10000, // 10KB - 60KB
    });
  }
  return logs;
};

const generateLogContent = (serial: string, station: string, model: string, result: string) => {
  const timestamp = new Date().toISOString();
  const voltage = (Math.random() * 2 + 11).toFixed(2);
  const temperature = (Math.random() * 20 + 20).toFixed(1);

  return `=== MES Test Log ===
Date: ${timestamp}
Serial Number: ${serial}
Station: ${station}
Model: ${model}
Test Result: ${result}

=== Test Environment ===
Tester ID: 2001092${Math.floor(Math.random() * 10)}A
Temperature: ${temperature}°C
Humidity: ${(Math.random() * 20 + 40).toFixed(1)}%
Voltage: ${voltage}V

=== Test Sequence ===
[${timestamp}] Test Started
[${timestamp}] Power On Test: ${Math.random() > 0.1 ? 'PASS' : 'FAIL'}
[${timestamp}] Communication Test: ${Math.random() > 0.05 ? 'PASS' : 'FAIL'}
[${timestamp}] Sensor Test: ${Math.random() > 0.08 ? 'PASS' : 'FAIL'}
[${timestamp}] Battery Test: ${Math.random() > 0.1 ? 'PASS' : 'FAIL'}
[${timestamp}] Final Calibration: ${Math.random() > 0.05 ? 'PASS' : 'FAIL'}
[${timestamp}] Test Completed

=== Test Results ===
Overall Result: ${result}
Test Duration: ${Math.floor(Math.random() * 300) + 60} seconds
Error Count: ${result === 'FAIL' ? Math.floor(Math.random() * 5) + 1 : 0}

${result === 'FAIL' ? `=== Error Details ===
Error 1: ${['Battery voltage out of range', 'Communication timeout', 'Sensor calibration failed', 'Power supply unstable'][Math.floor(Math.random() * 4)]}
Error 2: Hardware component malfunction
` : ''}

=== Test Data ===
Measurement 1: ${(Math.random() * 100).toFixed(2)}
Measurement 2: ${(Math.random() * 100).toFixed(2)}
Measurement 3: ${(Math.random() * 100).toFixed(2)}

=== End of Log ===`;
};

// 介面定義
interface LogQueryFilters {
  workOrder: string;
  serialNumber: string;
  station: string;
  model: string;
  dateFrom: string;
  dateTo: string;
  result: string;
}

interface LogRecord {
  id: number;
  workOrder: string;
  serialNumber: string;
  station: string;
  model: string;
  result: string;
  testTime: string;
  tester: string;
  fileName: string;
  logContent: string;
  fileSize: number;
}

interface EnhancedLogQueryProps {
  onLogView?: (logData: LogRecord) => void;
  onLogDownload?: (logData: LogRecord) => void;
}

export default function EnhancedLogQuery({ onLogView, onLogDownload }: EnhancedLogQueryProps) {
  const { t } = useLanguage();
  const [logs] = useState<LogRecord[]>(() => generateLogData());
  const [loading, setLoading] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<LogRecord | null>(null);
  const [previewSize, setPreviewSize] = useState({ width: 800, height: 600 });

  // 篩選條件
  const [filters, setFilters] = useState<LogQueryFilters>({
    workOrder: '',
    serialNumber: '',
    station: '',
    model: '',
    dateFrom: '',
    dateTo: '',
    result: '',
  });

  // 搜尋結果
  const [searchResults, setSearchResults] = useState<LogRecord[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const stations: string[] = [];
  const models: string[] = [];

  // 執行搜尋
  const handleSearch = useCallback(() => {
    setLoading(true);
    setHasSearched(true);

    // 模擬搜尋延遲
    setTimeout(() => {
      const filtered = logs.filter(log => {
        return (
          (!filters.workOrder || log.workOrder.toLowerCase().includes(filters.workOrder.toLowerCase())) &&
          (!filters.serialNumber || log.serialNumber.toLowerCase().includes(filters.serialNumber.toLowerCase())) &&
          (!filters.station || log.station === filters.station) &&
          (!filters.model || log.model === filters.model) &&
          (!filters.result || log.result === filters.result) &&
          (!filters.dateFrom || new Date(log.testTime) >= new Date(filters.dateFrom)) &&
          (!filters.dateTo || new Date(log.testTime) <= new Date(filters.dateTo))
        );
      });

      setSearchResults(filtered);
      setLoading(false);
    }, 1000);
  }, [logs, filters]);

  // 清除搜尋條件
  const handleClear = useCallback(() => {
    setFilters({
      workOrder: '',
      serialNumber: '',
      station: '',
      model: '',
      dateFrom: '',
      dateTo: '',
      result: '',
    });
    setSearchResults([]);
    setHasSearched(false);
  }, []);

  // 檢視 LOG
  const handleViewLog = useCallback((log: LogRecord) => {
    setSelectedLog(log);
    setPreviewOpen(true);
    onLogView?.(log);
  }, [onLogView]);

  // 下載 LOG
  const handleDownloadLog = useCallback((log: LogRecord) => {
    const blob = new Blob([log.logContent], { type: 'text/plain;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = log.fileName;
    link.click();
    onLogDownload?.(log);
  }, [onLogDownload]);

  // 格式化檔案大小
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* 頁面標題 */}
      <Box mb={3}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
          🔍 LOG 查詢系統
        </Typography>
        <Typography variant="body1" color="text.secondary">
          搜尋和檢視製造測試日誌，支援多條件篩選和內容預覽
        </Typography>
      </Box>

      {/* 搜尋條件 */}
      <Paper elevation={1} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Box mb={2}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SearchIcon />
            搜尋條件
          </Typography>
        </Box>

        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <TextField
              fullWidth
              size="small"
              label="工單號碼"
              placeholder="輸入工單號碼..."
              value={filters.workOrder}
              onChange={(e) => setFilters(prev => ({ ...prev, workOrder: e.target.value }))}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <TextField
              fullWidth
              size="small"
              label="序號"
              placeholder="輸入序號..."
              value={filters.serialNumber}
              onChange={(e) => setFilters(prev => ({ ...prev, serialNumber: e.target.value }))}
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
                {stations.map(station => (
                  <MenuItem key={station} value={station}>{station}</MenuItem>
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
                {models.map(model => (
                  <MenuItem key={model} value={model}>{model}</MenuItem>
                ))}
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

        <Box mt={2} display="flex" gap={2}>
          <Button
            variant="contained"
            startIcon={loading ? <CircularProgress size={16} /> : <SearchIcon />}
            onClick={handleSearch}
            disabled={loading}
          >
            {loading ? '搜尋中...' : '搜尋'}
          </Button>
          <Button
            variant="outlined"
            startIcon={<ClearIcon />}
            onClick={handleClear}
          >
            清除
          </Button>
        </Box>
      </Paper>

      {/* 搜尋結果 */}
      <Paper elevation={1} sx={{ borderRadius: 2 }}>
        <Box p={2} borderBottom="1px solid #e0e0e0">
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            📋 搜尋結果
            {hasSearched && (
              <Chip
                label={`${searchResults.length} 筆記錄`}
                size="small"
                color="primary"
                variant="outlined"
              />
            )}
          </Typography>
        </Box>

        {!hasSearched ? (
          <Box p={4} textAlign="center">
            <Typography variant="body1" color="text.secondary">
              請設定搜尋條件並點擊「搜尋」按鈕來查看 LOG 檔案
            </Typography>
          </Box>
        ) : searchResults.length === 0 ? (
          <Box p={4} textAlign="center">
            <Alert severity="info">
              找不到符合條件的 LOG 檔案，請調整搜尋條件後重試
            </Alert>
          </Box>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>工單號碼</TableCell>
                  <TableCell>序號</TableCell>
                  <TableCell>站別</TableCell>
                  <TableCell>機種</TableCell>
                  <TableCell align="center">結果</TableCell>
                  <TableCell>測試時間</TableCell>
                  <TableCell>測試員</TableCell>
                  <TableCell>檔案大小</TableCell>
                  <TableCell align="center">操作</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {searchResults.map((log) => (
                  <TableRow key={log.id} hover>
                    <TableCell sx={{ fontFamily: 'monospace' }}>
                      {log.workOrder}
                    </TableCell>
                    <TableCell sx={{ fontFamily: 'monospace' }}>
                      {log.serialNumber}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={log.station}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={log.model}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={log.result}
                        size="small"
                        color={log.result === 'PASS' ? 'success' : 'error'}
                        variant="filled"
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(log.testTime).toLocaleString()}
                    </TableCell>
                    <TableCell>{log.tester}</TableCell>
                    <TableCell>{formatFileSize(log.fileSize)}</TableCell>
                    <TableCell align="center">
                      <Tooltip title="預覽 LOG">
                        <IconButton
                          size="small"
                          onClick={() => handleViewLog(log)}
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="下載 LOG">
                        <IconButton
                          size="small"
                          onClick={() => handleDownloadLog(log)}
                        >
                          <DownloadIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* LOG 預覽對話框 */}
      <Dialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        maxWidth={false}
        PaperProps={{
          sx: {
            width: previewSize.width,
            height: previewSize.height,
            maxWidth: '90vw',
            maxHeight: '90vh',
            borderRadius: 2,
          }
        }}
      >
        <DialogTitle sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid #e0e0e0',
          pr: 1,
        }}>
          <Box>
            <Typography variant="h6">LOG 檔案預覽</Typography>
            {selectedLog && (
              <Typography variant="caption" color="text.secondary">
                {selectedLog.fileName} • {formatFileSize(selectedLog.fileSize)} • {new Date(selectedLog.testTime).toLocaleString()}
              </Typography>
            )}
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            <Tooltip title="下載檔案">
              <IconButton
                onClick={() => selectedLog && handleDownloadLog(selectedLog)}
                size="small"
              >
                <DownloadIcon />
              </IconButton>
            </Tooltip>
            <IconButton
              onClick={() => setPreviewOpen(false)}
              size="small"
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ p: 0, overflow: 'hidden' }}>
          <Box
            sx={{
              height: '100%',
              fontFamily: 'monospace',
              fontSize: '12px',
              lineHeight: 1.4,
              p: 2,
              overflow: 'auto',
              backgroundColor: '#f5f5f5',
              whiteSpace: 'pre-wrap',
              '&::-webkit-scrollbar': {
                width: '8px',
                height: '8px',
              },
              '&::-webkit-scrollbar-track': {
                backgroundColor: '#f1f1f1',
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: '#c1c1c1',
                borderRadius: '4px',
              },
              '&::-webkit-scrollbar-thumb:hover': {
                backgroundColor: '#a8a8a8',
              },
            }}
          >
            {selectedLog?.logContent}
          </Box>
        </DialogContent>

        <DialogActions sx={{ borderTop: '1px solid #e0e0e0' }}>
          <Button onClick={() => setPreviewOpen(false)}>
            關閉
          </Button>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={() => selectedLog && handleDownloadLog(selectedLog)}
          >
            下載
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}