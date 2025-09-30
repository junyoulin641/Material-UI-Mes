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
import { useLanguage } from '../contexts/LanguageContext';

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
  const { t } = useLanguage();
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
          ⚙️ 個人化設定
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
              label="外觀設定"
              iconPosition="start"
              sx={{ minHeight: 60 }}
            />
            <Tab
              icon={<DashboardIcon />}
              label="儀表板"
              iconPosition="start"
              sx={{ minHeight: 60 }}
            />
            <Tab
              icon={<ViewListIcon />}
              label="表格設定"
              iconPosition="start"
              sx={{ minHeight: 60 }}
            />
            <Tab
              icon={<NotificationsIcon />}
              label="通知設定"
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
                  🎨 顯示設定
                </Typography>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>主題模式</InputLabel>
                  <Select
                    value={preferences.display.theme}
                    label="主題模式"
                    onChange={(e) => handlePreferenceChange('display', 'theme', e.target.value)}
                  >
                    <MenuItem value="light">☀️ 亮色主題</MenuItem>
                    <MenuItem value="dark">🌙 暗色主題</MenuItem>
                    <MenuItem value="auto">🔄 自動切換</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>字體大小</InputLabel>
                  <Select
                    value={preferences.display.fontSize}
                    label="字體大小"
                    onChange={(e) => handlePreferenceChange('display', 'fontSize', e.target.value)}
                  >
                    <MenuItem value="small">📝 小型</MenuItem>
                    <MenuItem value="medium">📄 中型</MenuItem>
                    <MenuItem value="large">📰 大型</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom color="primary">
                  ⚡ 介面選項
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
                  label="緊湊模式 - 減少間距和邊距"
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
                  label="動畫效果 - 介面過渡動畫"
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
                  label="顯示熱力圖 - 圖表中的數據密度視覺化"
                />
              </Grid>
            </Grid>
          </TabPanel>

          {/* 儀表板設定 */}
          <TabPanel value={activeTab} index={1}>
            <Grid container spacing={3}>
              <Grid size={12}>
                <Typography variant="h6" gutterBottom color="primary">
                  📊 儀表板配置
                </Typography>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>預設日期範圍</InputLabel>
                  <Select
                    value={preferences.dashboard.defaultDateRange}
                    label="預設日期範圍"
                    onChange={(e) => handlePreferenceChange('dashboard', 'defaultDateRange', e.target.value)}
                  >
                    <MenuItem value="today">今天</MenuItem>
                    <MenuItem value="7days">近 7 天</MenuItem>
                    <MenuItem value="30days">近 30 天</MenuItem>
                    <MenuItem value="90days">近 90 天</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>圖表佈局</InputLabel>
                  <Select
                    value={preferences.dashboard.chartLayout}
                    label="圖表佈局"
                    onChange={(e) => handlePreferenceChange('dashboard', 'chartLayout', e.target.value)}
                  >
                    <MenuItem value="compact">緊湊型 - 較小的圖表</MenuItem>
                    <MenuItem value="standard">標準型 - 平衡的顯示</MenuItem>
                    <MenuItem value="detailed">詳細型 - 大型圖表</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={12}>
                <Typography gutterBottom>
                  KPI 卡片數量: {preferences.dashboard.kpiCardsCount}
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
                  🔄 自動更新
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
                  label="自動重新整理資料"
                />
              </Grid>

              {preferences.dashboard.autoRefresh && (
                <Grid size={12}>
                  <Typography gutterBottom>
                    重新整理間隔: {preferences.dashboard.refreshInterval} 秒
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
                  label="隱藏空白統計 - 不顯示沒有資料的統計項目"
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
                  label="顯示趨勢指標 - 在統計卡片中顯示上升/下降趨勢"
                />
              </Grid>
            </Grid>
          </TabPanel>

          {/* 表格設定 */}
          <TabPanel value={activeTab} index={2}>
            <Grid container spacing={3}>
              <Grid size={12}>
                <Typography variant="h6" gutterBottom color="primary">
                  📋 表格顯示
                </Typography>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Typography gutterBottom>
                  每頁顯示筆數: {preferences.display.recordsPerPage}
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
                  <InputLabel>預設排序欄位</InputLabel>
                  <Select
                    value={preferences.table.defaultSort}
                    label="預設排序欄位"
                    onChange={(e) => handlePreferenceChange('table', 'defaultSort', e.target.value)}
                  >
                    <MenuItem value="testTime">測試時間</MenuItem>
                    <MenuItem value="serialNumber">序號</MenuItem>
                    <MenuItem value="station">站別</MenuItem>
                    <MenuItem value="result">結果</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom color="primary">
                  🎯 表格功能
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
                  label="顯示行號"
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
                  label="突出顯示失敗記錄"
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
                  label="固定表頭 - 滾動時保持表頭可見"
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
                  label="自動展開測試項目詳情"
                />
              </Grid>
            </Grid>
          </TabPanel>

          {/* 通知設定 */}
          <TabPanel value={activeTab} index={3}>
            <Grid container spacing={3}>
              <Grid size={12}>
                <Typography variant="h6" gutterBottom color="primary">
                  🔔 通知類型
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
                    label={<Chip label="✅ 成功通知" color="success" size="small" />}
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={preferences.notifications.showWarnings}
                        onChange={(e) => handlePreferenceChange('notifications', 'showWarnings', e.target.checked)}
                      />
                    }
                    label={<Chip label="⚠️ 警告通知" color="warning" size="small" />}
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={preferences.notifications.showErrors}
                        onChange={(e) => handlePreferenceChange('notifications', 'showErrors', e.target.checked)}
                      />
                    }
                    label={<Chip label="❌ 錯誤通知" color="error" size="small" />}
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={preferences.notifications.showInfo}
                        onChange={(e) => handlePreferenceChange('notifications', 'showInfo', e.target.checked)}
                      />
                    }
                    label={<Chip label="ℹ️ 資訊通知" color="info" size="small" />}
                  />
                </Box>
              </Grid>

              <Grid size={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom color="primary">
                  ⚙️ 通知行為
                </Typography>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>通知位置</InputLabel>
                  <Select
                    value={preferences.notifications.position}
                    label="通知位置"
                    onChange={(e) => handlePreferenceChange('notifications', 'position', e.target.value)}
                  >
                    <MenuItem value="top-left">↖️ 左上角</MenuItem>
                    <MenuItem value="top-right">↗️ 右上角</MenuItem>
                    <MenuItem value="bottom-left">↙️ 左下角</MenuItem>
                    <MenuItem value="bottom-right">↘️ 右下角</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Typography gutterBottom>
                  自動隱藏時間: {preferences.notifications.autoHideDelay} 秒
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
                  最大通知數量: {preferences.notifications.maxNotifications}
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
          重置預設值
        </Button>
        <Button onClick={handleClose}>
          取消
        </Button>
        <Button onClick={handleSave} variant="contained">
          儲存設定
        </Button>
      </DialogActions>
    </Dialog>
  );
}