import * as React from 'react';
import { useState, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Breadcrumbs,
  Link,
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  Info as InfoIcon,
  Assessment as AssessmentIcon,
  Home as HomeIcon,
  NavigateNext as NavigateNextIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useFilters } from '../../../contexts/FilterContext';
import { useDashboardData } from '../../dashboard/hooks/useDashboardData';
import { useNavigation } from '../../common/components/AppRouter';

export default function RetestListView() {
  const { t } = useLanguage();
  const { setCurrentView } = useNavigation();
  const { filters: globalFilters } = useFilters();

  // 使用 Dashboard 資料 Hook 獲取複測記錄
  const { retestRecords } = useDashboardData(globalFilters as any);

  // 分頁狀態
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  // 彈窗狀態
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);

  // 搜尋狀態
  const [searchText, setSearchText] = useState('');

  // 過濾後的資料
  const filteredRecords = useMemo(() => {
    if (!searchText.trim()) return retestRecords;

    const searchLower = searchText.toLowerCase();
    return retestRecords.filter(record =>
      record.serialNumber?.toLowerCase().includes(searchLower) ||
      record.station?.toLowerCase().includes(searchLower) ||
      record.model?.toLowerCase().includes(searchLower) ||
      record.failureReason?.toLowerCase().includes(searchLower)
    );
  }, [retestRecords, searchText]);

  // 分頁處理
  const paginatedRecords = useMemo(() => {
    const start = page * rowsPerPage;
    const end = start + rowsPerPage;
    return filteredRecords.slice(start, end);
  }, [filteredRecords, page, rowsPerPage]);

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenDetail = (record: any) => {
    setSelectedRecord(record);
    setDetailDialogOpen(true);
  };

  const handleCloseDetail = () => {
    setDetailDialogOpen(false);
    setSelectedRecord(null);
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* 麵包屑導航 */}
      <Box sx={{ mb: 3 }}>
        <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
          <Link
            component="button"
            variant="body1"
            onClick={() => setCurrentView('dashboard')}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              textDecoration: 'none',
              color: 'text.secondary',
              '&:hover': { color: 'primary.main' }
            }}
          >
            <HomeIcon sx={{ fontSize: 20 }} />
            {t('dashboard')}
          </Link>
          <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <AssessmentIcon sx={{ fontSize: 20 }} />
            {t('retest.details')}
          </Typography>
        </Breadcrumbs>
      </Box>

      {/* 頁面標題和統計 */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
            {t('retest.details')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('total.retest.records')}: {filteredRecords.length} {t('records')}
          </Typography>
        </Box>
        <IconButton onClick={() => window.location.reload()} color="primary">
          <RefreshIcon />
        </IconButton>
      </Box>

      {/* 搜尋欄 */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          size="small"
          placeholder={t('search.serial.station.model')}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* 複測清單表格 */}
      <Card>
        <CardContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>{t('column.serial.number')}</TableCell>
                  <TableCell>{t('column.station')}</TableCell>
                  <TableCell>{t('column.model')}</TableCell>
                  <TableCell align="center">{t('column.retest.count')}</TableCell>
                  <TableCell>{t('column.failed.items')}</TableCell>
                  <TableCell align="center">{t('column.actions')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedRecords.map((record, index) => (
                  <TableRow key={index} hover>
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{
                          color: 'primary.main',
                          cursor: 'pointer',
                          '&:hover': { textDecoration: 'underline' }
                        }}
                        onClick={() => handleOpenDetail(record)}
                      >
                        {record.serialNumber}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={record.station}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>{record.model}</TableCell>
                    <TableCell align="center">
                      <Chip
                        label={`${record.retestCount} ${t('times')}`}
                        size="small"
                        color={record.retestCount >= 3 ? 'error' : record.retestCount === 2 ? 'warning' : 'info'}
                        variant="outlined"
                        sx={{ fontWeight: 600 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Tooltip title={record.failureReason}>
                        <Typography
                          variant="body2"
                          sx={{
                            maxWidth: 300,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            color: 'error.main'
                          }}
                        >
                          {record.failureReason}
                        </Typography>
                      </Tooltip>
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDetail(record)}
                        color="primary"
                      >
                        <InfoIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredRecords.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                      <Typography variant="body1" color="text.secondary">
                        {t('no.retest.records')}
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* 分頁控制 */}
          <TablePagination
            rowsPerPageOptions={[10, 25, 50, 100]}
            component="div"
            count={filteredRecords.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage={t('rows.per.page')}
            labelDisplayedRows={({ from, to, count }) =>
              `${from}-${to} ${t('of')} ${count !== -1 ? count : `more than ${to}`}`
            }
          />
        </CardContent>
      </Card>

      {/* 複測詳細資訊彈窗 */}
      <Dialog
        open={detailDialogOpen}
        onClose={handleCloseDetail}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <InfoIcon color="primary" />
            <Typography variant="h6">{t('retest.detail.info')}</Typography>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {selectedRecord && (
            <Box>
              {/* 基本資訊 */}
              <Box sx={{ mb: 3 }}>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="body2" color="text.secondary">{t('column.serial.number')}</Typography>
                    <Typography variant="body1" fontWeight={600}>{selectedRecord.serialNumber}</Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="body2" color="text.secondary">{t('column.model')}</Typography>
                    <Typography variant="body1" fontWeight={600}>{selectedRecord.model}</Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="body2" color="text.secondary">{t('column.station')}</Typography>
                    <Typography variant="body1" fontWeight={600}>{selectedRecord.station}</Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="body2" color="text.secondary">{t('column.retest.count')}</Typography>
                    <Chip
                      label={`${selectedRecord.retestCount} ${t('times')}`}
                      size="small"
                      color={selectedRecord.retestCount >= 3 ? 'error' : selectedRecord.retestCount === 2 ? 'warning' : 'info'}
                      sx={{ fontWeight: 600 }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="body2" color="text.secondary">{t('column.failed.items')}</Typography>
                    <Typography variant="body1" color="error.main">{selectedRecord.failureReason}</Typography>
                  </Grid>
                </Grid>
              </Box>

              {/* 測試歷史記錄 */}
              <Box>
                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                  {t('test.history')}
                </Typography>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>{t('test.sequence')}</TableCell>
                        <TableCell>{t('column.test.time')}</TableCell>
                        <TableCell>{t('column.result')}</TableCell>
                        <TableCell>{t('column.tester')}</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedRecord.allRecords?.map((record: any, idx: number) => (
                        <TableRow key={idx}>
                          <TableCell>
                            <Chip
                              label={`${t('test.number')} ${idx + 1}`}
                              size="small"
                              color={idx === 0 ? 'default' : 'secondary'}
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell>{new Date(record.testTime).toLocaleString('zh-TW')}</TableCell>
                          <TableCell>
                            <Chip
                              label={record.result}
                              size="small"
                              color={record.result === 'PASS' ? 'success' : 'error'}
                              sx={{ fontWeight: 600 }}
                            />
                          </TableCell>
                          <TableCell>{record.tester || '-'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetail} variant="outlined">
            {t('close')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
