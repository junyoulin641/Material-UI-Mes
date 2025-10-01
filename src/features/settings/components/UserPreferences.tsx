import * as React from 'react';
import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  FormControl,
  FormControlLabel,
  Switch,
  Select,
  MenuItem,
  Slider,
  Tabs,
  Tab,
  Card,
  CardContent,
  Grid,
  Divider,
  IconButton,
  InputLabel,
  Chip,
} from '@mui/material';
import {
  Close as CloseIcon,
  Dashboard as DashboardIcon,
  ViewList as ViewListIcon,
  Notifications as NotificationsIcon,
  Palette as PaletteIcon,
} from '@mui/icons-material';
import { useLanguage } from '../../../contexts/LanguageContext';

// 類型定義
interface PreferencesType {
  display: {
    recordsPerPage: number;
    showDetailedStats: boolean;
    showHeatmap: boolean;
    compactMode: boolean;
    showAnimations: boolean;
    theme: string;
    fontSize: string;
  };
  dashboard: {
    defaultDateRange: string;
    autoRefresh: boolean;
    refreshInterval: number;
    hideEmptyStats: boolean;
    showTrendIndicators: boolean;
    kpiCardsCount: number;
    chartLayout: string;
  };
  table: {
    defaultSort: string;
    sortOrder: string;
    showRowNumbers: boolean;
    highlightFails: boolean;
    expandItems: boolean;
    stickyHeader: boolean;
    zebraStripes: boolean;
  };
  notifications: {
    showSuccess: boolean;
    showWarnings: boolean;
    showErrors: boolean;
    showInfo: boolean;
    autoHideDelay: number;
    position: string;
    maxNotifications: number;
  };
}

// 預設偏好設定
const DEFAULT_PREFERENCES: PreferencesType = {
  display: {
    recordsPerPage: 50,
    showDetailedStats: true,
    showHeatmap: true,
    compactMode: false,
    showAnimations: true,
    theme: 'auto', // light, dark, auto
    fontSize: 'medium', // small, medium, large
  },
  dashboard: {
    defaultDateRange: '7days',
    autoRefresh: false,
    refreshInterval: 30,
    hideEmptyStats: false,
    showTrendIndicators: true,
    kpiCardsCount: 4,
    chartLayout: 'standard', // compact, standard, detailed
  },
  table: {
    defaultSort: 'testTime',
    sortOrder: 'desc',
    showRowNumbers: true,
    highlightFails: true,
    expandItems: false,
    stickyHeader: true,
    zebraStripes: false,
  },
  notifications: {
    showSuccess: true,
    showWarnings: true,
    showErrors: true,
    showInfo: true,
    autoHideDelay: 4,
    position: 'top-right', // top-left, top-right, bottom-left, bottom-right
    maxNotifications: 5,
  }
};

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`preference-tabpanel-${index}`}
      aria-labelledby={`preference-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

interface UserPreferencesProps {
  open: boolean;
  onClose: () => void;
  onSave?: (preferences: PreferencesType) => void;
}

export default function UserPreferences({ open, onClose, onSave }: UserPreferencesProps) {
  const { t, language, setLanguage } = useLanguage();
  const [activeTab, setActiveTab] = useState(0);
  const [preferences, setPreferences] = useState(() => {
    const saved = localStorage.getItem('mes-user-preferences');
    return saved ? { ...DEFAULT_PREFERENCES, ...JSON.parse(saved) } : DEFAULT_PREFERENCES;
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handlePreferenceChange = (section: string, key: string, value: any) => {
    setPreferences(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [key]: value
      }
    }));
  };

  const handleSave = () => {
    localStorage.setItem('mes-user-preferences', JSON.stringify(preferences));
    onSave?.(preferences);
    onClose();
  };

  const handleReset = () => {
    setPreferences(DEFAULT_PREFERENCES);
  };

  const handleClose = () => {
    // 恢復到保存的設定
    const saved = localStorage.getItem('mes-user-preferences');
    if (saved) {
      setPreferences({ ...DEFAULT_PREFERENCES, ...JSON.parse(saved) });
    } else {
      setPreferences(DEFAULT_PREFERENCES);
    }
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          maxHeight: '90vh',
          minHeight: '600px'
        }
      }}
    >
      <DialogTitle sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid #e0e0e0'
      }}>
        <Typography variant="h6" component="div">
          {t('user.preferences')}
        </Typography>
        <IconButton onClick={handleClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={handleTabChange} variant="fullWidth">
            <Tab
              icon={<PaletteIcon />}
              label={t('appearance.settings')}
              iconPosition="start"
              sx={{ minHeight: 60 }}
            />
            <Tab
              icon={<DashboardIcon />}
              label={t('dashboard')}
              iconPosition="start"
              sx={{ minHeight: 60 }}
            />
            <Tab
              icon={<ViewListIcon />}
              label={t('table.settings')}
              iconPosition="start"
              sx={{ minHeight: 60 }}
            />
            <Tab
              icon={<NotificationsIcon />}
              label={t('notification.settings')}
              iconPosition="start"
              sx={{ minHeight: 60 }}
            />
          </Tabs>
        </Box>

        <Box sx={{ px: 3 }}>
          {/* 外觀設定 */}
          <TabPanel value={activeTab} index={0}>
            <Grid container spacing={3}>
              <Grid size={12}>
                <Typography variant="h6" gutterBottom color="primary">
                  {t('display.settings')}
                </Typography>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>{t('theme.mode')}</InputLabel>
                  <Select
                    value={preferences.display.theme}
                    label={t('theme.mode')}
                    onChange={(e) => handlePreferenceChange('display', 'theme', e.target.value)}
                  >
                    <MenuItem value="light">{t('theme.light')}</MenuItem>
                    <MenuItem value="dark">{t('theme.dark')}</MenuItem>
                    <MenuItem value="auto">{t('theme.auto')}</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>{t('font.size')}</InputLabel>
                  <Select
                    value={preferences.display.fontSize}
                    label={t('font.size')}
                    onChange={(e) => handlePreferenceChange('display', 'fontSize', e.target.value)}
                  >
                    <MenuItem value="small">{t('font.small')}</MenuItem>
                    <MenuItem value="medium">{t('font.medium')}</MenuItem>
                    <MenuItem value="large">{t('font.large')}</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>{t('language.label')}</InputLabel>
                  <Select
                    value={language}
                    label={t('language.label')}
                    onChange={(e) => setLanguage(e.target.value as any)}
                  >
                    <MenuItem value="zh-TW">🇹🇼 繁體中文</MenuItem>
                    <MenuItem value="en-US">🇺🇸 English</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom color="primary">
                  {t('interface.options')}
                </Typography>
              </Grid>

              <Grid size={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={preferences.display.compactMode}
                      onChange={(e) => handlePreferenceChange('display', 'compactMode', e.target.checked)}
                    />
                  }
                  label={t('compact.mode')}
                />
              </Grid>

              <Grid size={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={preferences.display.showAnimations}
                      onChange={(e) => handlePreferenceChange('display', 'showAnimations', e.target.checked)}
                    />
                  }
                  label={t('animation.effects')}
                />
              </Grid>

              <Grid size={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={preferences.display.showHeatmap}
                      onChange={(e) => handlePreferenceChange('display', 'showHeatmap', e.target.checked)}
                    />
                  }
                  label={t('show.heatmap')}
                />
              </Grid>
            </Grid>
          </TabPanel>

          {/* 儀表板設定 */}
          <TabPanel value={activeTab} index={1}>
            <Grid container spacing={3}>
              <Grid size={12}>
                <Typography variant="h6" gutterBottom color="primary">
                  {t('dashboard.configuration')}
                </Typography>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>{t('default.date.range')}</InputLabel>
                  <Select
                    value={preferences.dashboard.defaultDateRange}
                    label={t('default.date.range')}
                    onChange={(e) => handlePreferenceChange('dashboard', 'defaultDateRange', e.target.value)}
                  >
                    <MenuItem value="today">{t('today')}</MenuItem>
                    <MenuItem value="7days">{t('last.7.days')}</MenuItem>
                    <MenuItem value="30days">{t('last.30.days')}</MenuItem>
                    <MenuItem value="90days">{t('last.90.days')}</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>{t('chart.layout')}</InputLabel>
                  <Select
                    value={preferences.dashboard.chartLayout}
                    label={t('chart.layout')}
                    onChange={(e) => handlePreferenceChange('dashboard', 'chartLayout', e.target.value)}
                  >
                    <MenuItem value="compact">{t('layout.compact')}</MenuItem>
                    <MenuItem value="standard">{t('layout.standard')}</MenuItem>
                    <MenuItem value="detailed">{t('layout.detailed')}</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={12}>
                <Typography gutterBottom>
                  {t('kpi.cards.count')}: {preferences.dashboard.kpiCardsCount}
                </Typography>
                <Slider
                  value={preferences.dashboard.kpiCardsCount}
                  onChange={(e, value) => handlePreferenceChange('dashboard', 'kpiCardsCount', value)}
                  min={3}
                  max={6}
                  step={1}
                  marks={[
                    { value: 3, label: '3' },
                    { value: 4, label: '4' },
                    { value: 5, label: '5' },
                    { value: 6, label: '6' },
                  ]}
                />
              </Grid>

              <Grid size={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom color="primary">
                  {t('auto.refresh')}
                </Typography>
              </Grid>

              <Grid size={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={preferences.dashboard.autoRefresh}
                      onChange={(e) => handlePreferenceChange('dashboard', 'autoRefresh', e.target.checked)}
                    />
                  }
                  label={t('auto.refresh.data')}
                />
              </Grid>

              {preferences.dashboard.autoRefresh && (
                <Grid size={12}>
                  <Typography gutterBottom>
                    {t('refresh.interval')}: {preferences.dashboard.refreshInterval} {t('seconds')}
                  </Typography>
                  <Slider
                    value={preferences.dashboard.refreshInterval}
                    onChange={(e, value) => handlePreferenceChange('dashboard', 'refreshInterval', value)}
                    min={10}
                    max={300}
                    step={10}
                    marks={[
                      { value: 30, label: '30s' },
                      { value: 60, label: '1m' },
                      { value: 120, label: '2m' },
                      { value: 300, label: '5m' },
                    ]}
                  />
                </Grid>
              )}

              <Grid size={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={preferences.dashboard.hideEmptyStats}
                      onChange={(e) => handlePreferenceChange('dashboard', 'hideEmptyStats', e.target.checked)}
                    />
                  }
                  label={t('hide.empty.stats')}
                />
              </Grid>

              <Grid size={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={preferences.dashboard.showTrendIndicators}
                      onChange={(e) => handlePreferenceChange('dashboard', 'showTrendIndicators', e.target.checked)}
                    />
                  }
                  label={t('show.trend.indicators')}
                />
              </Grid>
            </Grid>
          </TabPanel>

          {/* 表格設定 */}
          <TabPanel value={activeTab} index={2}>
            <Grid container spacing={3}>
              <Grid size={12}>
                <Typography variant="h6" gutterBottom color="primary">
                  {t('table.display')}
                </Typography>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Typography gutterBottom>
                  {t('records.per.page')}: {preferences.display.recordsPerPage}
                </Typography>
                <Slider
                  value={preferences.display.recordsPerPage}
                  onChange={(e, value) => handlePreferenceChange('display', 'recordsPerPage', value)}
                  min={25}
                  max={100}
                  step={25}
                  marks={[
                    { value: 25, label: '25' },
                    { value: 50, label: '50' },
                    { value: 75, label: '75' },
                    { value: 100, label: '100' },
                  ]}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>{t('default.sort.field')}</InputLabel>
                  <Select
                    value={preferences.table.defaultSort}
                    label={t('default.sort.field')}
                    onChange={(e) => handlePreferenceChange('table', 'defaultSort', e.target.value)}
                  >
                    <MenuItem value="testTime">{t('test.time')}</MenuItem>
                    <MenuItem value="serialNumber">{t('serial.number')}</MenuItem>
                    <MenuItem value="station">{t('station')}</MenuItem>
                    <MenuItem value="result">{t('result')}</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom color="primary">
                  {t('table.features')}
                </Typography>
              </Grid>

              <Grid size={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={preferences.table.showRowNumbers}
                      onChange={(e) => handlePreferenceChange('table', 'showRowNumbers', e.target.checked)}
                    />
                  }
                  label={t('show.row.numbers')}
                />
              </Grid>

              <Grid size={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={preferences.table.highlightFails}
                      onChange={(e) => handlePreferenceChange('table', 'highlightFails', e.target.checked)}
                    />
                  }
                  label={t('highlight.fails')}
                />
              </Grid>

              <Grid size={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={preferences.table.stickyHeader}
                      onChange={(e) => handlePreferenceChange('table', 'stickyHeader', e.target.checked)}
                    />
                  }
                  label={t('sticky.header')}
                />
              </Grid>

              <Grid size={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={preferences.table.expandItems}
                      onChange={(e) => handlePreferenceChange('table', 'expandItems', e.target.checked)}
                    />
                  }
                  label={t('auto.expand.items')}
                />
              </Grid>
            </Grid>
          </TabPanel>

          {/* 通知設定 */}
          <TabPanel value={activeTab} index={3}>
            <Grid container spacing={3}>
              <Grid size={12}>
                <Typography variant="h6" gutterBottom color="primary">
                  {t('notification.types')}
                </Typography>
              </Grid>

              <Grid size={12}>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={preferences.notifications.showSuccess}
                        onChange={(e) => handlePreferenceChange('notifications', 'showSuccess', e.target.checked)}
                      />
                    }
                    label={<Chip label={`✅ ${t('notification.success')}`} color="success" size="small" />}
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={preferences.notifications.showWarnings}
                        onChange={(e) => handlePreferenceChange('notifications', 'showWarnings', e.target.checked)}
                      />
                    }
                    label={<Chip label={`⚠️ ${t('notification.warning')}`} color="warning" size="small" />}
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={preferences.notifications.showErrors}
                        onChange={(e) => handlePreferenceChange('notifications', 'showErrors', e.target.checked)}
                      />
                    }
                    label={<Chip label={`❌ ${t('notification.error')}`} color="error" size="small" />}
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={preferences.notifications.showInfo}
                        onChange={(e) => handlePreferenceChange('notifications', 'showInfo', e.target.checked)}
                      />
                    }
                    label={<Chip label={`ℹ️ ${t('notification.info')}`} color="info" size="small" />}
                  />
                </Box>
              </Grid>

              <Grid size={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom color="primary">
                  {t('notification.behavior')}
                </Typography>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>{t('notification.position')}</InputLabel>
                  <Select
                    value={preferences.notifications.position}
                    label={t('notification.position')}
                    onChange={(e) => handlePreferenceChange('notifications', 'position', e.target.value)}
                  >
                    <MenuItem value="top-left">{t('position.top.left')}</MenuItem>
                    <MenuItem value="top-right">{t('position.top.right')}</MenuItem>
                    <MenuItem value="bottom-left">{t('position.bottom.left')}</MenuItem>
                    <MenuItem value="bottom-right">{t('position.bottom.right')}</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Typography gutterBottom>
                  {t('auto.hide.delay')}: {preferences.notifications.autoHideDelay} {t('seconds')}
                </Typography>
                <Slider
                  value={preferences.notifications.autoHideDelay}
                  onChange={(e, value) => handlePreferenceChange('notifications', 'autoHideDelay', value)}
                  min={2}
                  max={10}
                  step={1}
                  marks={[
                    { value: 2, label: '2s' },
                    { value: 4, label: '4s' },
                    { value: 6, label: '6s' },
                    { value: 10, label: '10s' },
                  ]}
                />
              </Grid>

              <Grid size={12}>
                <Typography gutterBottom>
                  {t('max.notifications')}: {preferences.notifications.maxNotifications}
                </Typography>
                <Slider
                  value={preferences.notifications.maxNotifications}
                  onChange={(e, value) => handlePreferenceChange('notifications', 'maxNotifications', value)}
                  min={3}
                  max={10}
                  step={1}
                  marks={[
                    { value: 3, label: '3' },
                    { value: 5, label: '5' },
                    { value: 8, label: '8' },
                    { value: 10, label: '10' },
                  ]}
                />
              </Grid>
            </Grid>
          </TabPanel>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, borderTop: '1px solid #e0e0e0' }}>
        <Button onClick={handleReset} color="warning">
          {t('reset.defaults')}
        </Button>
        <Button onClick={handleClose}>
          {t('cancel')}
        </Button>
        <Button onClick={handleSave} variant="contained">
          {t('save.settings')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}