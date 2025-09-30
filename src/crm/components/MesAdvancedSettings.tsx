import * as React from "react";
import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Divider from "@mui/material/Divider";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemSecondaryAction from "@mui/material/ListItemSecondaryAction";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Tooltip from "@mui/material/Tooltip";
import Alert from "@mui/material/Alert";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import SettingsIcon from "@mui/icons-material/Settings";
import SaveIcon from "@mui/icons-material/Save";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import DownloadIcon from "@mui/icons-material/Download";
import RefreshIcon from "@mui/icons-material/Refresh";
import SecurityIcon from "@mui/icons-material/Security";
import NetworkCheckIcon from "@mui/icons-material/NetworkCheck";
import StorageIcon from "@mui/icons-material/Storage";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { useLanguage } from "../../contexts/LanguageContext";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index, ...other }: TabPanelProps) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function MesAdvancedSettings() {
  const { language, setLanguage, t } = useLanguage();
  const [tabValue, setTabValue] = useState(0);
  const [stations, setStations] = useState(["FA_FT01", "FA_FT02", "ICT_01", "ICT_02", "FINAL_01"]);
  const [models, setModels] = useState(["WA3", "WA4", "CH5", "DH6"]);
  const [newStation, setNewStation] = useState("");
  const [newModel, setNewModel] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<"station" | "model">("station");
  const [settings, setSettings] = useState({
    autoRefresh: true,
    refreshInterval: 30,
    enableNotifications: true,
    enableLogging: true,
    dataRetentionDays: 90,
    enableDataEncryption: true,
    maxConcurrentUsers: 50,
    sessionTimeout: 60,
    enableBackup: true,
    backupInterval: 24,
    theme: "light",
    timezone: "Asia/Taipei",
    dateFormat: "YYYY-MM-DD",
    timeFormat: "24h"
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleSettingsChange = (field: string) => (event: any) => {
    const value = event.target.type === "checkbox" ? event.target.checked : event.target.value;
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddItem = (type: "station" | "model") => {
    setDialogType(type);
    setDialogOpen(true);
  };

  const handleDeleteItem = (type: "station" | "model", item: string) => {
    if (type === "station") {
      setStations(prev => prev.filter(s => s !== item));
    } else {
      setModels(prev => prev.filter(m => m !== item));
    }
  };

  const handleDialogSave = () => {
    if (dialogType === "station" && newStation.trim()) {
      setStations(prev => [...prev, newStation.trim()]);
      setNewStation("");
    } else if (dialogType === "model" && newModel.trim()) {
      setModels(prev => [...prev, newModel.trim()]);
      setNewModel("");
    }
    setDialogOpen(false);
  };

  const handleSaveSettings = () => {
    // TODO: 實作儲存設定功能
    console.log("Saving settings:", settings);
    alert("設定已儲存！");
  };

  const handleExportSettings = () => {
    const configData = {
      stations,
      models,
      settings,
      exportTime: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(configData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `mes-config-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const configData = JSON.parse(e.target?.result as string);
          if (configData.stations) setStations(configData.stations);
          if (configData.models) setModels(configData.models);
          if (configData.settings) setSettings(configData.settings);
          alert("設定檔案已成功匯入！");
        } catch (error) {
          alert("設定檔案格式錯誤，請檢查檔案內容。");
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
      {/* 頁面標題 */}
      <Box mb={4}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
          ⚙️ {t('system.settings')}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {t('mes.advanced.config')}
        </Typography>
      </Box>

      {/* 主要設定區域 */}
      <Paper elevation={1} sx={{ borderRadius: 2 }}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="設定頁籤">
            <Tab icon={<SettingsIcon />} label={t('basic.settings')} />
            <Tab icon={<StorageIcon />} label={t('data.management')} />
            <Tab icon={<SecurityIcon />} label={t('security.settings')} />
            <Tab icon={<NotificationsIcon />} label={t('notification.settings')} />
            <Tab icon={<NetworkCheckIcon />} label={t('system.info')} />
          </Tabs>
        </Box>

        {/* 基本設定 */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            {/* 站別管理 */}
            <Grid size={12}>
              <Card variant="outlined">
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6">{t('station.management')}</Typography>
                    <Button
                      startIcon={<AddIcon />}
                      variant="outlined"
                      size="small"
                      onClick={() => handleAddItem("station")}
                    >
                      {t('add.station')}
                    </Button>
                  </Box>
                  <Box display="flex" flexWrap="wrap" gap={1}>
                    {stations.map((station) => (
                      <Chip
                        key={station}
                        label={station}
                        onDelete={() => handleDeleteItem("station", station)}
                        color="primary"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* 機種管理 */}
            <Grid size={12}>
              <Card variant="outlined">
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6">{t('model.management')}</Typography>
                    <Button
                      startIcon={<AddIcon />}
                      variant="outlined"
                      size="small"
                      onClick={() => handleAddItem("model")}
                    >
                      {t('add.model')}
                    </Button>
                  </Box>
                  <Box display="flex" flexWrap="wrap" gap={1}>
                    {models.map((model) => (
                      <Chip
                        key={model}
                        label={model}
                        onDelete={() => handleDeleteItem("model", model)}
                        color="secondary"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* 介面設定 */}
            <Grid size={12}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>{t('interface.settings')}</Typography>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                      <FormControl fullWidth>
                        <InputLabel>{t('theme')}</InputLabel>
                        <Select
                          value={settings.theme}
                          label={t('theme')}
                          onChange={handleSettingsChange("theme")}
                        >
                          <MenuItem value="light">{t('light.theme')}</MenuItem>
                          <MenuItem value="dark">{t('dark.theme')}</MenuItem>
                          <MenuItem value="auto">{t('auto.theme')}</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                      <FormControl fullWidth>
                        <InputLabel>{t('language')}</InputLabel>
                        <Select
                          value={language}
                          label={t('language')}
                          onChange={(e) => setLanguage(e.target.value as any)}
                        >
                          <MenuItem value="zh-TW">{t('traditional.chinese')}</MenuItem>
                          <MenuItem value="zh-CN">{t('simplified.chinese')}</MenuItem>
                          <MenuItem value="en-US">{t('english')}</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                      <FormControl fullWidth>
                        <InputLabel>{t('timezone')}</InputLabel>
                        <Select
                          value={settings.timezone}
                          label={t('timezone')}
                          onChange={handleSettingsChange("timezone")}
                        >
                          <MenuItem value="Asia/Taipei">{t('taipei.time')}</MenuItem>
                          <MenuItem value="Asia/Shanghai">{t('beijing.time')}</MenuItem>
                          <MenuItem value="Asia/Tokyo">{t('tokyo.time')}</MenuItem>
                          <MenuItem value="UTC">UTC</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* 資料管理 */}
        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            <Grid size={12}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>資料保存設定</Typography>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth
                        label="資料保存天數"
                        type="number"
                        value={settings.dataRetentionDays}
                        onChange={handleSettingsChange("dataRetentionDays")}
                        InputProps={{
                          endAdornment: "天"
                        }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth
                        label="自動重新整理間隔"
                        type="number"
                        value={settings.refreshInterval}
                        onChange={handleSettingsChange("refreshInterval")}
                        InputProps={{
                          endAdornment: "秒"
                        }}
                      />
                    </Grid>
                  </Grid>
                  <Box mt={2}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.enableBackup}
                          onChange={handleSettingsChange("enableBackup")}
                        />
                      }
                      label="啟用自動備份"
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={12}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>設定檔案管理</Typography>
                  <Box display="flex" gap={2} mt={2}>
                    <Button
                      startIcon={<DownloadIcon />}
                      variant="outlined"
                      onClick={handleExportSettings}
                    >
                      匯出設定
                    </Button>
                    <Button
                      startIcon={<UploadFileIcon />}
                      variant="outlined"
                      component="label"
                    >
                      匯入設定
                      <input
                        type="file"
                        hidden
                        accept=".json"
                        onChange={handleImportSettings}
                      />
                    </Button>
                  </Box>
                  <Alert severity="info" sx={{ mt: 2 }}>
                    設定檔案包含站別、機種、系統設定等資料，可用於系統備份或遷移。
                  </Alert>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* 安全設定 */}
        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3}>
            <Grid size={12}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>安全性設定</Typography>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth
                        label="最大同時使用者數"
                        type="number"
                        value={settings.maxConcurrentUsers}
                        onChange={handleSettingsChange("maxConcurrentUsers")}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth
                        label="會話逾時 (分鐘)"
                        type="number"
                        value={settings.sessionTimeout}
                        onChange={handleSettingsChange("sessionTimeout")}
                      />
                    </Grid>
                  </Grid>
                  <Box mt={2}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.enableDataEncryption}
                          onChange={handleSettingsChange("enableDataEncryption")}
                        />
                      }
                      label="啟用資料加密"
                    />
                  </Box>
                  <Box mt={1}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.enableLogging}
                          onChange={handleSettingsChange("enableLogging")}
                        />
                      }
                      label="啟用系統日誌記錄"
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* 通知設定 */}
        <TabPanel value={tabValue} index={3}>
          <Grid container spacing={3}>
            <Grid size={12}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>通知設定</Typography>
                  <Box>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.enableNotifications}
                          onChange={handleSettingsChange("enableNotifications")}
                        />
                      }
                      label="啟用系統通知"
                    />
                  </Box>
                  <Box mt={1}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.autoRefresh}
                          onChange={handleSettingsChange("autoRefresh")}
                        />
                      }
                      label="自動重新整理頁面"
                    />
                  </Box>
                  <Alert severity="info" sx={{ mt: 2 }}>
                    通知功能將在測試失敗或系統異常時提醒使用者。
                  </Alert>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* 系統資訊 */}
        <TabPanel value={tabValue} index={4}>
          <Grid container spacing={3}>
            <Grid size={12}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>系統資訊</Typography>
                  <List>
                    <ListItem>
                      <ListItemText primary="系統版本" secondary="MES v2.0.0" />
                    </ListItem>
                    <Divider />
                    <ListItem>
                      <ListItemText primary="最後更新" secondary={new Date().toLocaleString()} />
                    </ListItem>
                    <Divider />
                    <ListItem>
                      <ListItemText primary="資料庫狀態" secondary="正常運行" />
                    </ListItem>
                    <Divider />
                    <ListItem>
                      <ListItemText primary="已配置站別" secondary={`${stations.length} 個站別`} />
                    </ListItem>
                    <Divider />
                    <ListItem>
                      <ListItemText primary="已配置機種" secondary={`${models.length} 個機種`} />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* 底部操作按鈕 */}
        <Box p={3} display="flex" justifyContent="flex-end" gap={2}>
          <Button
            startIcon={<RefreshIcon />}
            variant="outlined"
            onClick={() => window.location.reload()}
          >
            {t('refresh')}
          </Button>
          <Button
            startIcon={<SaveIcon />}
            variant="contained"
            onClick={handleSaveSettings}
          >
            {t('save.settings')}
          </Button>
        </Box>
      </Paper>

      {/* 新增對話框 */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          新增{dialogType === "station" ? "站別" : "機種"}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label={`${dialogType === "station" ? "站別" : "機種"}名稱`}
            value={dialogType === "station" ? newStation : newModel}
            onChange={(e) => dialogType === "station" ? setNewStation(e.target.value) : setNewModel(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>取消</Button>
          <Button onClick={handleDialogSave} variant="contained">新增</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}