import * as React from 'react';
import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearIcon from '@mui/icons-material/Clear';
import { useLanguage } from '../../../contexts/LanguageContext';

export interface FilterOptions {
  dateRange?: 'all' | 'today' | 'yesterday' | 'this-week' | 'last-week' | 'this-month' | 'last-month';
  result?: 'all' | 'pass' | 'fail';
  station?: string;
  model?: string;
  serialNumber?: string;
  workOrder?: string;
}

interface QuickFiltersProps {
  onFilterChange: (filters: FilterOptions) => void;
  stations?: string[];
  models?: string[];
  showAdvanced?: boolean;
}

export default function QuickFilters({
  onFilterChange,
  stations = [],
  models = [],
  showAdvanced = true
}: QuickFiltersProps) {
  const { t } = useLanguage();
  const [expanded, setExpanded] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    dateRange: 'all',
    result: 'all',
    station: 'all',
    model: 'all',
    serialNumber: '',
    workOrder: ''
  });

  // 日期篩選選項
  const dateOptions = [
    { value: 'all', label: t('all') },
    { value: 'today', label: t('today') },
    { value: 'yesterday', label: t('yesterday') },
    { value: 'this-week', label: t('this.week') },
    { value: 'last-week', label: t('last.week') },
    { value: 'this-month', label: t('this.month') },
    { value: 'last-month', label: t('last.month') },
  ];

  // 結果篩選選項
  const resultOptions = [
    { value: 'all', label: t('all') },
    { value: 'pass', label: t('pass') },
    { value: 'fail', label: t('fail') },
  ];

  const handleFilterChange = (key: keyof FilterOptions, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleResetFilters = () => {
    const resetFilters: FilterOptions = {
      dateRange: 'all',
      result: 'all',
      station: 'all',
      model: 'all',
      serialNumber: '',
      workOrder: ''
    };
    setFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.dateRange && filters.dateRange !== 'all') count++;
    if (filters.result && filters.result !== 'all') count++;
    if (filters.station && filters.station !== 'all') count++;
    if (filters.model && filters.model !== 'all') count++;
    if (filters.serialNumber && filters.serialNumber.trim() !== '') count++;
    if (filters.workOrder && filters.workOrder.trim() !== '') count++;
    return count;
  };

  return (
    <Card variant="outlined" sx={{ mb: 2 }}>
      <CardContent sx={{ pb: expanded ? 2 : 1 }}>
        {/* 快速篩選標題和展開按鈕 */}
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={expanded ? 2 : 0}>
          <Box display="flex" alignItems="center" gap={1}>
            <FilterListIcon color="primary" />
            <Typography variant="h6" component="h3">
              {t('quick.filters')}
            </Typography>
            {getActiveFiltersCount() > 0 && (
              <Chip
                label={getActiveFiltersCount()}
                color="primary"
                size="small"
                sx={{ minWidth: '24px', height: '20px' }}
              />
            )}
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            {getActiveFiltersCount() > 0 && (
              <Button
                size="small"
                startIcon={<ClearIcon />}
                onClick={handleResetFilters}
                color="secondary"
              >
                {t('reset.filters')}
              </Button>
            )}
            <IconButton
              onClick={() => setExpanded(!expanded)}
              size="small"
              sx={{
                transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.3s'
              }}
            >
              <ExpandMoreIcon />
            </IconButton>
          </Box>
        </Box>

        {/* 快速日期篩選按鈕 - 始終顯示 */}
        {!expanded && (
          <Box display="flex" flexWrap="wrap" gap={1} mt={1}>
            {dateOptions.slice(1, 5).map((option) => (
              <Chip
                key={option.value}
                label={option.label}
                clickable
                color={filters.dateRange === option.value ? 'primary' : 'default'}
                variant={filters.dateRange === option.value ? 'filled' : 'outlined'}
                onClick={() => handleFilterChange('dateRange', option.value)}
                size="small"
              />
            ))}
            <Chip
              label={filters.result === 'pass' ? t('pass') : filters.result === 'fail' ? t('fail') : ''}
              clickable
              color={filters.result !== 'all' ? (filters.result === 'pass' ? 'success' : 'error') : 'default'}
              variant={filters.result !== 'all' ? 'filled' : 'outlined'}
              onClick={() => {
                const nextResult = filters.result === 'all' ? 'pass' :
                                  filters.result === 'pass' ? 'fail' : 'all';
                handleFilterChange('result', nextResult);
              }}
              size="small"
              sx={{
                display: filters.result !== 'all' ? 'flex' : 'none',
                minWidth: '60px'
              }}
            />
          </Box>
        )}

        {/* 展開的詳細篩選選項 */}
        <Collapse in={expanded}>
          <Grid container spacing={2} mt={1}>
            {/* 序號搜尋 */}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                fullWidth
                size="small"
                label={t('serial.number.search')}
                placeholder={t('enter.serial.number')}
                value={filters.serialNumber || ''}
                onChange={(e) => handleFilterChange('serialNumber', e.target.value)}
              />
            </Grid>

            {/* 工單搜尋 */}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                fullWidth
                size="small"
                label={t('work.order.search')}
                placeholder={t('enter.work.order')}
                value={filters.workOrder || ''}
                onChange={(e) => handleFilterChange('workOrder', e.target.value)}
              />
            </Grid>

            {/* 日期範圍篩選 */}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <FormControl fullWidth size="small">
                <InputLabel>{t('filter.by.date')}</InputLabel>
                <Select
                  value={filters.dateRange || 'all'}
                  label={t('filter.by.date')}
                  onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                >
                  {dateOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* 結果篩選 */}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <FormControl fullWidth size="small">
                <InputLabel>{t('filter.by.result')}</InputLabel>
                <Select
                  value={filters.result || 'all'}
                  label={t('filter.by.result')}
                  onChange={(e) => handleFilterChange('result', e.target.value)}
                >
                  {resultOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* 站別篩選 */}
            {showAdvanced && stations.length > 0 && (
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>{t('filter.by.station')}</InputLabel>
                  <Select
                    value={filters.station || 'all'}
                    label={t('filter.by.station')}
                    onChange={(e) => handleFilterChange('station', e.target.value)}
                  >
                    <MenuItem value="all">{t('all')}</MenuItem>
                    {stations.map((station) => (
                      <MenuItem key={station} value={station}>
                        {station}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}

            {/* 機種篩選 */}
            {showAdvanced && models.length > 0 && (
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>{t('filter.by.model')}</InputLabel>
                  <Select
                    value={filters.model || 'all'}
                    label={t('filter.by.model')}
                    onChange={(e) => handleFilterChange('model', e.target.value)}
                  >
                    <MenuItem value="all">{t('all')}</MenuItem>
                    {models.map((model) => (
                      <MenuItem key={model} value={model}>
                        {model}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}
          </Grid>

          {/* 套用和重置按鈕 */}
          <Box display="flex" justifyContent="flex-end" gap={1} mt={2}>
            <Button
              variant="outlined"
              startIcon={<ClearIcon />}
              onClick={handleResetFilters}
              disabled={getActiveFiltersCount() === 0}
            >
              {t('reset.filters')}
            </Button>
          </Box>
        </Collapse>
      </CardContent>
    </Card>
  );
}