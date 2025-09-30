import * as React from 'react';
import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import { useLanguage } from '../contexts/LanguageContext';

export interface SimpleFilterOptions {
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
  advancedSearch?: boolean;
  tester?: string;
  batchNumber?: string;
}

interface SimpleQuickFiltersProps {
  onFilterChange: (filters: SimpleFilterOptions) => void;
  stations?: string[];
  models?: string[];
}

export default function SimpleQuickFilters({
  onFilterChange,
  stations = [],
  models = []
}: SimpleQuickFiltersProps) {
  const { t } = useLanguage();
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [tempFilters, setTempFilters] = useState<SimpleFilterOptions>({});
  const [filters, setFilters] = useState<SimpleFilterOptions>({
    dateRange: 'all',
    result: 'all',
    serialNumber: '',
    workOrder: '',
    station: '',
    model: '',
    dateFrom: '',
    dateTo: '',
    startTime: '00:00',
    endTime: '23:59',
    advancedSearch: false,
    tester: '',
    batchNumber: ''
  });

  // 簡化的日期篩選選項
  const dateOptions = [
    { value: 'all', label: t('all') },
    { value: 'today', label: t('today') },
    { value: 'yesterday', label: t('yesterday') },
    { value: 'this-week', label: t('this.week') },
    { value: 'last-week', label: t('last.week') },
    { value: 'this-month', label: t('this.month') },
    { value: 'last-month', label: t('last.month') },
    { value: 'custom', label: '自訂日期範圍' },
  ];

  // 結果篩選選項
  const resultOptions = [
    { value: 'all', label: t('all') },
    { value: 'pass', label: t('pass') },
    { value: 'fail', label: t('fail') },
  ];

  const handleFilterChange = (key: keyof SimpleFilterOptions, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  // 快速日期選擇處理
  const handleDateRangeSelect = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days);

    const newFilters = {
      ...filters,
      dateFrom: start.toISOString().slice(0, 10),
      dateTo: end.toISOString().slice(0, 10),
      dateRange: 'custom'
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  // 進階搜尋對話框處理
  const handleOpenAdvanced = () => {
    setTempFilters({ ...filters });
    setShowAdvanced(true);
  };

  const handleCloseAdvanced = () => {
    setShowAdvanced(false);
    setTempFilters({});
  };

  const handleApplyAdvanced = () => {
    setFilters(tempFilters);
    onFilterChange(tempFilters);
    setShowAdvanced(false);
  };

  const handleResetAdvanced = () => {
    const resetFilters = {
      dateRange: 'all',
      result: 'all',
      serialNumber: '',
      workOrder: '',
      station: '',
      model: '',
      dateFrom: '',
      dateTo: '',
      startTime: '00:00',
      endTime: '23:59',
      tester: '',
      batchNumber: ''
    };
    setTempFilters(resetFilters);
  };

  // 快速日期選項 (與原始MES一致)
  const dateRangeQuickOptions = [
    { label: '今天', days: 0 },
    { label: '近7天', days: 6 },
    { label: '近30天', days: 29 },
    { label: '近90天', days: 89 },
  ];

  return (
    <Card variant="outlined" sx={{ mb: 3 }}>
      <CardContent sx={{ py: 2 }}>
        {/* 篩選標題 */}
        <Box mb={2}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SearchIcon color="primary" />
            數據篩選
          </Typography>
        </Box>

        {/* 主要篩選控制 - 模仿原始MES設計 */}
        <Grid container spacing={2} alignItems="center">
          {/* 序號關鍵字 */}
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <TextField
              fullWidth
              size="small"
              label="序號關鍵字"
              placeholder="輸入序號..."
              value={filters.serialNumber || ''}
              onChange={(e) => handleFilterChange('serialNumber', e.target.value)}
            />
          </Grid>

          {/* 站別選單 */}
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel>站別</InputLabel>
              <Select
                value={filters.station || ''}
                label="站別"
                onChange={(e) => handleFilterChange('station', e.target.value)}
              >
                <MenuItem value="">全部站別</MenuItem>
                {stations.map((station) => (
                  <MenuItem key={station} value={station}>
                    {station}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* 機種選單 */}
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel>機種</InputLabel>
              <Select
                value={filters.model || ''}
                label="機種"
                onChange={(e) => handleFilterChange('model', e.target.value)}
              >
                <MenuItem value="">全部機種</MenuItem>
                {models.map((model) => (
                  <MenuItem key={model} value={model}>
                    {model}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* 開始日期 */}
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <TextField
              fullWidth
              size="small"
              type="date"
              label="開始日期"
              InputLabelProps={{ shrink: true }}
              value={filters.dateFrom || ''}
              onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
            />
          </Grid>

          {/* 結束日期 */}
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <TextField
              fullWidth
              size="small"
              type="date"
              label="結束日期"
              InputLabelProps={{ shrink: true }}
              value={filters.dateTo || ''}
              onChange={(e) => handleFilterChange('dateTo', e.target.value)}
            />
          </Grid>

          {/* 進階搜尋按鈕 */}
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<SearchIcon />}
              onClick={handleOpenAdvanced}
            >
              進階搜尋
            </Button>
          </Grid>
        </Grid>

        {/* 快速日期選擇 */}
        <Box mt={2} display="flex" gap={1} flexWrap="wrap">
          {dateRangeQuickOptions.map((option) => (
            <Chip
              key={option.label}
              label={option.label}
              onClick={() => handleDateRangeSelect(option.days)}
              variant="outlined"
              size="small"
              sx={{ cursor: 'pointer' }}
            />
          ))}
        </Box>

        {/* 進階搜尋對話框 */}
        <Dialog
          open={showAdvanced}
          onClose={handleCloseAdvanced}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 2,
              maxHeight: '90vh'
            }
          }}
        >
          <DialogTitle sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            pb: 1
          }}>
            <Typography variant="h6" component="div">
              進階搜尋
            </Typography>
            <IconButton
              onClick={handleCloseAdvanced}
              size="small"
              sx={{ color: 'grey.400' }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>

          <DialogContent dividers>
            {/* 基本條件 */}
            <Box mb={3}>
              <Typography variant="subtitle1" gutterBottom color="primary.main" sx={{ fontWeight: 600 }}>
                基本條件
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>機種篩選</InputLabel>
                    <Select
                      value={tempFilters.model || ''}
                      label="機種篩選"
                      onChange={(e) => setTempFilters(f => ({...f, model: e.target.value}))}
                    >
                      <MenuItem value="">全部機種</MenuItem>
                      {models.map(model => (
                        <MenuItem key={model} value={model}>{model}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>站別篩選</InputLabel>
                    <Select
                      value={tempFilters.station || ''}
                      label="站別篩選"
                      onChange={(e) => setTempFilters(f => ({...f, station: e.target.value}))}
                    >
                      <MenuItem value="">全部站別</MenuItem>
                      {stations.map(station => (
                        <MenuItem key={station} value={station}>{station}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="序號關鍵字"
                    value={tempFilters.serialNumber || ''}
                    onChange={(e) => setTempFilters(f => ({...f, serialNumber: e.target.value}))}
                    placeholder="輸入序號..."
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="工單關鍵字"
                    value={tempFilters.workOrder || ''}
                    onChange={(e) => setTempFilters(f => ({...f, workOrder: e.target.value}))}
                    placeholder="輸入工單號..."
                  />
                </Grid>
              </Grid>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* 日期範圍 */}
            <Box mb={3}>
              <Typography variant="subtitle1" gutterBottom color="primary.main" sx={{ fontWeight: 600 }}>
                日期範圍
              </Typography>

              <Grid container spacing={2} mb={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box display="flex" gap={1} alignItems="center">
                    <TextField
                      fullWidth
                      size="small"
                      type="date"
                      label="開始日期"
                      InputLabelProps={{ shrink: true }}
                      value={tempFilters.dateFrom || ''}
                      onChange={(e) => setTempFilters(f => ({...f, dateFrom: e.target.value}))}
                    />
                    <TextField
                      size="small"
                      type="time"
                      label="時間"
                      InputLabelProps={{ shrink: true }}
                      value={tempFilters.startTime || '00:00'}
                      onChange={(e) => setTempFilters(f => ({...f, startTime: e.target.value}))}
                      sx={{ width: 120 }}
                    />
                  </Box>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box display="flex" gap={1} alignItems="center">
                    <TextField
                      fullWidth
                      size="small"
                      type="date"
                      label="結束日期"
                      InputLabelProps={{ shrink: true }}
                      value={tempFilters.dateTo || ''}
                      onChange={(e) => setTempFilters(f => ({...f, dateTo: e.target.value}))}
                    />
                    <TextField
                      size="small"
                      type="time"
                      label="時間"
                      InputLabelProps={{ shrink: true }}
                      value={tempFilters.endTime || '23:59'}
                      onChange={(e) => setTempFilters(f => ({...f, endTime: e.target.value}))}
                      sx={{ width: 120 }}
                    />
                  </Box>
                </Grid>
              </Grid>

              {/* 常用時段 */}
              <Box mb={2}>
                <Typography variant="body2" color="text.secondary" mb={1}>
                  常用時段:
                </Typography>
                <Box display="flex" gap={1} flexWrap="wrap">
                  {[
                    { label: '全天', start: '00:00', end: '23:59' },
                    { label: '白班 (08:00-17:00)', start: '08:00', end: '17:00' },
                    { label: '夜班 (20:00-06:00)', start: '20:00', end: '06:00' },
                    { label: '上午', start: '09:00', end: '12:00' },
                    { label: '下午', start: '13:00', end: '17:00' },
                  ].map(preset => (
                    <Chip
                      key={preset.label}
                      label={preset.label}
                      size="small"
                      variant="outlined"
                      clickable
                      onClick={() => {
                        setTempFilters(f => ({
                          ...f,
                          startTime: preset.start,
                          endTime: preset.end
                        }));
                      }}
                      sx={{ cursor: 'pointer' }}
                    />
                  ))}
                </Box>
              </Box>
            </Box>
          </DialogContent>

          <DialogActions sx={{ p: 2 }}>
            <Button
              variant="outlined"
              onClick={handleResetAdvanced}
            >
              重置條件
            </Button>
            <Button
              variant="outlined"
              onClick={handleCloseAdvanced}
            >
              取消
            </Button>
            <Button
              variant="contained"
              onClick={handleApplyAdvanced}
              startIcon={<SearchIcon />}
            >
              套用篩選
            </Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
}