import * as React from 'react';
import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
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
import { useLanguage } from '../../../contexts/LanguageContext';
import { useFilters } from '../../../contexts/FilterContext';

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
  const { filters: globalFilters, setFilters: setGlobalFilters } = useFilters();
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [tempFilters, setTempFilters] = useState<SimpleFilterOptions>({});

  // 簡化的日期篩選選項
  const dateOptions = [
    { value: 'all', label: t('all') },
    { value: 'today', label: t('today') },
    { value: 'yesterday', label: t('yesterday') },
    { value: 'this-week', label: t('this.week') },
    { value: 'last-week', label: t('last.week') },
    { value: 'this-month', label: t('this.month') },
    { value: 'last-month', label: t('last.month') },
    { value: 'custom', label: t('自訂日期範圍') },
  ];

  // 結果篩選選項
  const resultOptions = [
    { value: 'all', label: t('all') },
    { value: 'pass', label: t('pass') },
    { value: 'fail', label: t('fail') },
  ];

  const handleFilterChange = (key: keyof SimpleFilterOptions, value: string) => {
    const newFilters = { ...globalFilters, [key]: value };
    setGlobalFilters(newFilters);
    onFilterChange(newFilters);
  };

  // 快速日期選擇處理
  const handleDateRangeSelect = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days);

    const newFilters = {
      ...globalFilters,
      dateFrom: start.toISOString().slice(0, 10),
      dateTo: end.toISOString().slice(0, 10),
      dateRange: 'custom'
    };
    setGlobalFilters(newFilters);
    onFilterChange(newFilters);
  };

  // 進階搜尋對話框處理
  const handleOpenAdvanced = () => {
    setTempFilters({ ...globalFilters });
    setShowAdvanced(true);
  };

  const handleCloseAdvanced = () => {
    setShowAdvanced(false);
    setTempFilters({});
  };

  const handleApplyAdvanced = () => {
    setGlobalFilters(tempFilters);
    onFilterChange(tempFilters);
    setShowAdvanced(false);
  };

  // 初始載入時觸發篩選
  useEffect(() => {
    onFilterChange(globalFilters);
  }, []); // 只在掛載時執行一次

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
    { label: t('today'), days: 0 },
    { label: t('last.7.days'), days: 6 },
    { label: t('last.14.days'), days: 13 },
    { label: t('last.30.days'), days: 29 },
    { label: t('last.90.days'), days: 89 },
  ];

  return (
    <Box
      sx={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(250,250,252,0.95) 100%)',
        backdropFilter: 'blur(10px)',
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
        p: 3,
        mb: 3,
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: 'linear-gradient(90deg, #1976d2 0%, #42a5f5 50%, #1976d2 100%)',
          backgroundSize: '200% 100%',
          animation: 'gradient 3s ease infinite',
        },
        '@keyframes gradient': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      }}
    >
      {/* 篩選標題 */}
      <Box mb={3} display="flex" alignItems="center" justifyContent="space-between">
        <Box display="flex" alignItems="center" gap={1.5}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
              boxShadow: '0 4px 12px rgba(25,118,210,0.3)',
            }}
          >
            <SearchIcon sx={{ color: 'white', fontSize: 22 }} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
              {t('quick.filters')}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {t('filter.description') || '快速篩選測試資料'}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* 主要篩選控制 */}
      <Box
        sx={{
          background: 'rgba(255,255,255,0.6)',
          borderRadius: 2,
          p: 2.5,
          border: '1px solid',
          borderColor: 'grey.200',
        }}
      >
        <Grid container spacing={2} alignItems="center">
          {/* 序號關鍵字 */}
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <TextField
              fullWidth
              size="small"
              label={t('serial.number.search')}
              placeholder={t('enter.serial.number')}
              value={globalFilters.serialNumber || ''}
              onChange={(e) => handleFilterChange('serialNumber', e.target.value)}
            />
          </Grid>

          {/* 站別選單 */}
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel>{t('station')}</InputLabel>
              <Select
                value={globalFilters.station || ''}
                label={t('station')}
                onChange={(e) => handleFilterChange('station', e.target.value)}
              >
                <MenuItem value="">{t('all')}</MenuItem>
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
              <InputLabel>{t('model')}</InputLabel>
              <Select
                value={globalFilters.model || ''}
                label={t('model')}
                onChange={(e) => handleFilterChange('model', e.target.value)}
              >
                <MenuItem value="">{t('all')}</MenuItem>
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
              label={t('date.from')}
              InputLabelProps={{ shrink: true }}
              value={globalFilters.dateFrom || ''}
              onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
            />
          </Grid>

          {/* 結束日期 */}
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <TextField
              fullWidth
              size="small"
              type="date"
              label={t('date.to')}
              InputLabelProps={{ shrink: true }}
              value={globalFilters.dateTo || ''}
              onChange={(e) => handleFilterChange('dateTo', e.target.value)}
            />
          </Grid>

          {/* 進階搜尋按鈕 */}
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<SearchIcon />}
              onClick={handleOpenAdvanced}
              sx={{
                background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                boxShadow: '0 4px 12px rgba(25,118,210,0.25)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #1565c0 0%, #1976d2 100%)',
                  boxShadow: '0 6px 16px rgba(25,118,210,0.35)',
                  transform: 'translateY(-1px)',
                },
                transition: 'all 0.2s ease',
              }}
            >
              {t('advanced.search')}
            </Button>
          </Grid>
        </Grid>
      </Box>

      {/* 快速日期選擇 - 新設計 */}
      <Box mt={3}>
        <Typography variant="body2" color="text.secondary" mb={1.5} sx={{ fontWeight: 500 }}>
          {t('quick.date.range') || '快速日期範圍'}
        </Typography>
        <Box display="flex" gap={1.5} flexWrap="wrap">
          {dateRangeQuickOptions.map((option) => (
            <Chip
              key={option.label}
              label={option.label}
              onClick={() => handleDateRangeSelect(option.days)}
              variant="outlined"
              size="medium"
              sx={{
                cursor: 'pointer',
                borderColor: 'primary.main',
                color: 'primary.main',
                fontWeight: 500,
                px: 1,
                transition: 'all 0.2s ease',
                '&:hover': {
                  background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                  color: 'white',
                  borderColor: 'transparent',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 12px rgba(25,118,210,0.3)',
                },
              }}
            />
          ))}
        </Box>
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
              {t('advanced.search')}
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
                {t('basic.conditions')}
              </Typography>   
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>{t('model.filter')}</InputLabel>
                    <Select
                      value={tempFilters.model || ''}
                      label={t('model.filter')}
                      onChange={(e) => setTempFilters(f => ({...f, model: e.target.value}))}
                    >
                      <MenuItem value="">{t('all')}</MenuItem>
                      {models.map(model => (
                        <MenuItem key={model} value={model}>{model}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>{t('station.filter')}</InputLabel>
                    <Select
                      value={tempFilters.station || ''}
                      label={t('station.filter')}
                      onChange={(e) => setTempFilters(f => ({...f, station: e.target.value}))}
                    >
                      <MenuItem value="">{t('all')}</MenuItem>
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
                    label={t('serial.number.search')}
                    value={tempFilters.serialNumber || ''}
                    onChange={(e) => setTempFilters(f => ({...f, serialNumber: e.target.value}))}
                    placeholder={t('enter.serial.number')}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label={t('work.order.search')}
                    value={tempFilters.workOrder || ''}
                    onChange={(e) => setTempFilters(f => ({...f, workOrder: e.target.value}))}
                    placeholder={t('enter.work.order')}
                  />
                </Grid>
              </Grid>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* 日期範圍 */}
            <Box mb={3}>
              <Typography variant="subtitle1" gutterBottom color="primary.main" sx={{ fontWeight: 600 }}>
                {t('data.range')}
              </Typography>

              <Grid container spacing={2} mb={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box display="flex" gap={1} alignItems="center">
                    <TextField
                      fullWidth
                      size="small"
                      type="date"
                      label={t('date.from')}
                      InputLabelProps={{ shrink: true }}
                      value={tempFilters.dateFrom || ''}
                      onChange={(e) => setTempFilters(f => ({...f, dateFrom: e.target.value}))}
                    />
                    <TextField
                      size="small"
                      type="time"
                      label={t('time')}
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
                      label={t('date.to')}
                      InputLabelProps={{ shrink: true }}
                      value={tempFilters.dateTo || ''}
                      onChange={(e) => setTempFilters(f => ({...f, dateTo: e.target.value}))}
                    />
                    <TextField
                      size="small"
                      type="time"
                      label={t('time')}
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
                  {t('common.time.range')}
                </Typography>
                <Box display="flex" gap={1} flexWrap="wrap">
                  {[
                    { label: t('all.day'), start: '00:00', end: '23:59' },
                    { label: t('morning'), start: '08:00', end: '17:00' },
                    { label: t('evening'), start: '20:00', end: '06:00' },
                    { label: t('morning'), start: '09:00', end: '12:00' },
                    { label: t('afternoon'), start: '13:00', end: '17:00' },
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
              {t('advanced.search.reset')}
            </Button>
            <Button
              variant="outlined"
              onClick={handleCloseAdvanced}
            >
              {t('advanced.search.close')}
            </Button>
            <Button
              variant="contained"
              onClick={handleApplyAdvanced}
              startIcon={<SearchIcon />}
            >
              {t('advanced.search.apply')}    
            </Button>
          </DialogActions>
        </Dialog>
    </Box>
  );
}