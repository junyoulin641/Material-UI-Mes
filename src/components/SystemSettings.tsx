import * as React from 'react';
import { useState, useRef, useCallback } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  TextField,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Divider,
  Stack,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Upload as UploadIcon,
  Folder as FolderIcon,
  DeleteOutline as DeleteIcon,
  Add as AddIcon,
  Storage as StorageIcon,
  Assessment as AssessmentIcon,
  CloudUpload as CloudUploadIcon,
  InsertDriveFile as FileIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { useToast } from './ToastSystem';
import { getMESDatabase, TestRecord as DBTestRecord } from '../utils/MESDatabase';

// 原始 MES 系統的時間解析函數
function parseMesTime(s: string) {
  s = String(s || '').trim();
  const m = s.match(/(\d{4})[\/-](\d{2})[\/-](\d{2})[ T-](\d{2}):(\d{2}):(\d{2})/);
  if (!m) return { date: '', time: '' };
  const [, Y, Mo, D, H, Mi, S] = m;
  return { date: `${Y}-${Mo}-${D}`, time: `${H}:${Mi}:${S}` };
}

// 原始 MES 系統的資料正規化函數
function normalizeMesJson(input: any) {
  // 確保輸入是有效的
  if (input === null || input === undefined) {
    input = {};
  }

  const arr = Array.isArray(input) ? input : [input];
  return arr.map(rec => {
    // 對於任何無效的記錄，建立基本物件
    if (!rec || typeof rec !== 'object') {
      rec = {};
    }

    // 嘗試從檔案名推導資訊（對於那些只有 {"Result": [{"Name": "Ok", "Code": 0}]} 的檔案）
    let serial = rec['Serial Number'] || rec['Serial'] || rec['serial'] || '';
    let testTime = rec['Test Time'] || rec['Test_Time'] || rec['datetime'] || '';
    let station = rec['Station'] || rec['station'] || '';
    let model = rec['Model'] || rec['model'] || rec['Product Type'] || '';
    let workOrder = rec['Work Order'] || rec['WorkOrder'] || rec['工單'] || '';
    let fn = rec['FN'] || rec['fn'] || '';
    let tester = rec['Tester'] || rec['tester'] || '';

    // 如果沒有基本資訊，嘗試從檔案結構推導
    if (!serial && !testTime && !station) {
      // 對於 {"Result": [{"Name": "Ok", "Code": 0}]} 格式的檔案
      if (rec.Result && Array.isArray(rec.Result)) {
        const result = rec.Result[0];
        if (result && result.Name) {
          serial = result.Name || 'Unknown';
          testTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
          station = 'Unknown';
          model = 'Unknown';
        }
      } else {
        // 對於其他無法識別的格式，也建立基本記錄
        serial = 'Unknown';
        testTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
        station = 'Unknown';
        model = 'Unknown';
      }
    }

    const ts = parseMesTime(String(testTime || ''));
    const date = ts.date, time = ts.time;

    const out: any = {
      serial: serial,
      datetime: date && time ? `${date} ${time}` : date || testTime || '',
      station: station,
      model: model,
      workOrder: workOrder,
      FN: fn,
      Tester: tester
    };

    const items = Array.isArray(rec.Items) ? rec.Items : [];
    out.result = items.some((it: any) => String(it.result).toUpperCase() === 'FAIL') ? 'FAIL' : 'PASS';

    // 保存原始 Items 陣列用於詳細檢視
    out.Items = items;

    for (const it of items) {
      const key = (it && it.name ? String(it.name) : '').trim();
      if (!key) continue;
      if (/^(date\s*time|datetime|test\s*time|date|time)$/i.test(key)) continue;
      // 確保我們不會意外賦值整個對象
      const value = it && it.value != null ?
        (typeof it.value === 'object' ? JSON.stringify(it.value) : String(it.value)) : '';
      out[key] = value;
    }

    out.date = date;
    out.time = time;

    // 現在所有記錄都返回，不再過濾
    return out;
  }).filter(Boolean);
}

// 檢查是否為有效的MES測試資料JSON
function isValidMesJson(json: any) {
  if (!json || typeof json !== 'object') return false;

  // 排除明顯不是MES資料的格式
  if (json.Result && Array.isArray(json.Result) && !json.Items) {
    // 這是 {"Result": [{"Name": "Ok", "Code": 0}]} 格式，不是MES資料
    return false;
  }

  // 檢查MES欄位的各種可能名稱
  const hasSerial = json['Serial Number'] || json['Serial'] || json['serial'] || json['SerialNumber'];
  const hasTestTime = json['Test Time'] || json['Test_Time'] || json['datetime'] || json['TestTime'];
  const hasStation = json['Station'] || json['station'];
  const hasItems = json['Items'] || json['items'];
  const hasFN = json['FN'] || json['fn'];

  // 有序號和時間，或者有Items和FN，都認為是有效的MES資料
  return !!(hasSerial && hasTestTime) || !!(hasItems && (hasFN || hasStation));
}

interface TestRecord {
  serialNumber: string;
  workOrder: string;
  station: string;
  model: string;
  result: 'PASS' | 'FAIL';
  testTime: string;
  tester: string;
  partNumber: string;
  items: Array<{
    name: string;
    value: any;
    result: 'PASS' | 'FAIL';
  }>;
}

interface LogFile {
  name: string;
  content: string;
  serial: string;
  timestamp: string;
}

export function SystemSettings() {
  const [stations, setStations] = useState<string[]>([]);
  const [models, setModels] = useState<string[]>([]);
  const [newStation, setNewStation] = useState('');
  const [newModel, setNewModel] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importResults, setImportResults] = useState<{
    jsonCount: number;
    logCount: number;
    pairedCount: number;
    totalRecords: number;
  } | null>(null);
  const [logMappings, setLogMappings] = useState<Map<string, LogFile>>(new Map());

  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const { showSuccess, showError, showInfo } = useToast();

  // 處理檔案匯入（使用 IndexedDB）
  const handleFileImport = useCallback(async (files: FileList | File[]) => {
    setIsImporting(true);
    setImportProgress(0);
    setImportResults(null);

    try {
      const fileArray = Array.from(files);
      const jsonFiles = fileArray.filter(f => f.name.toLowerCase().endsWith('.json'));
      const logFiles = fileArray.filter(f => f.name.toLowerCase().endsWith('.log'));

      showInfo(`發現 ${jsonFiles.length} 個 JSON 檔案和 ${logFiles.length} 個 LOG 檔案`, '開始匯入');

      // 初始化 IndexedDB
      const db = await getMESDatabase();

      // 處理 LOG 檔案並儲存到 IndexedDB
      const logMap = new Map<string, string>(); // serial_timestamp -> logId
      for (let i = 0; i < logFiles.length; i++) {
        const logFile = logFiles[i];
        const content = await logFile.text();

        // 從檔名提取序號和時間戳
        const match = logFile.name.match(/(\d{8}-\d{6})-([^[\]]+)/);
        if (match) {
          const [, timestamp, serial] = match;
          const key = `${serial}_${timestamp}`;

          try {
            // 儲存 LOG 檔案到 IndexedDB
            const logId = await db.saveLogFile({
              serial,
              fileName: logFile.name,
              content,
              timestamp: new Date(),
              size: content.length
            });

            logMap.set(key, logId);
            console.log(`✅ IndexedDB儲存成功: ${logFile.name} (${(content.length / 1024).toFixed(1)}KB)`);
          } catch (error) {
            console.error(`IndexedDB儲存失敗: ${logFile.name}`, error);
            // 備援：嘗試儲存到 localStorage（較小的檔案）
            try {
              if (content.length < 1024 * 1024) { // 小於 1MB
                localStorage.setItem(`log_backup_${key}`, content);
                console.log(`📦 localStorage備援儲存: ${logFile.name}`);
              }
            } catch (lsError) {
              console.error(`localStorage備援也失敗: ${logFile.name}`, lsError);
            }
          }
        }

        setImportProgress((i + 1) / (logFiles.length + jsonFiles.length) * 50);
      }

      // 處理 JSON 檔案
      const allRecords: DBTestRecord[] = [];
      let pairedCount = 0;

      for (let i = 0; i < jsonFiles.length; i++) {
        const jsonFile = jsonFiles[i];
        const content = await jsonFile.text();

        try {
          // 使用原始 MES 系統的資料處理邏輯 - 多層次錯誤處理
          let data;
          let isValidJson = false;

          // 第一層：嘗試標準 JSON 解析
          try {
            data = JSON.parse(content);
            isValidJson = isValidMesJson(data);
            console.log(`✅ JSON解析成功: ${jsonFile.name} (有效性: ${isValidJson})`);
          } catch (parseError) {
            console.warn(`⚠️ JSON解析失敗，嘗試修復: ${jsonFile.name}`, parseError);

            // 第二層：嘗試修復常見的 JSON 格式問題
            try {
              let fixedContent = content
                .replace(/,\s*}/g, '}')  // 移除尾隨逗號
                .replace(/,\s*]/g, ']')  // 移除陣列尾隨逗號
                .replace(/'/g, '"')      // 單引號轉雙引號
                .trim();

              data = JSON.parse(fixedContent);
              isValidJson = isValidMesJson(data);
              console.log(`✅ JSON修復成功: ${jsonFile.name} (有效性: ${isValidJson})`);
            } catch (fixError) {
              console.error(`❌ JSON修復失敗: ${jsonFile.name}`, fixError);
              // 第三層：創建最基本的記錄結構
              data = {
                serialNumber: jsonFile.name.replace(/\.(json|log)$/i, ''),
                result: 'FAIL',
                testTime: new Date().toISOString(),
                station: 'Unknown',
                model: 'Unknown'
              };
              console.log(`🔧 使用備援記錄: ${jsonFile.name}`);
            }
          }

          // 使用原始 MES 系統的正規化函數處理資料
          const normalizedRecords = normalizeMesJson(data);

          // 處理每一筆正規化的記錄 - 使用原始MES系統的欄位名稱
          for (const normalizedData of normalizedRecords) {
            const record: DBTestRecord = {
              serialNumber: normalizedData.serial || '',  // 原始MES使用 'serial'
              workOrder: normalizedData.workOrder || '',
              station: normalizedData.station || '',
              model: normalizedData.model || '',
              result: normalizedData.result as 'PASS' | 'FAIL',
              testTime: normalizedData.datetime || new Date().toISOString(),  // 原始MES使用 'datetime'
              tester: normalizedData.Tester || '',  // 原始MES使用 'Tester' (大寫T)
              partNumber: normalizedData.FN || '',  // 原始MES使用 'FN'
              items: Array.isArray(normalizedData.Items) ? normalizedData.Items.map(item => ({  // 原始MES使用 'Items'
                name: item.name || 'Unknown',
                value: item.value !== undefined ? item.value : '',
                result: item.result || 'UNKNOWN'
              })) : []
            };

            // 詳細的資料驗證和除錯輸出
            console.log(`📋 正規化記錄: SN=${record.serialNumber} | Station=${record.station} | Result=${record.result} | Items=${record.items.length}`);

            // 驗證關鍵欄位 - 也要記錄原始MES的欄位資訊
            console.log(`🔍 原始MES資料檢查: serial=${normalizedData.serial}, station=${normalizedData.station}, model=${normalizedData.model}, datetime=${normalizedData.datetime}`);

            if (!record.serialNumber) {
              console.warn('⚠️ 警告: 序號為空，使用檔名作為序號', normalizedData);
              record.serialNumber = jsonFile.name.replace(/\.(json|log)$/i, '');
            }
            if (!record.station) {
              console.warn('⚠️ 警告: 站別為空，嘗試從檔名解析', normalizedData);
              const stationMatch = jsonFile.name.match(/(FA_FT\d+|ICT_\d+|FINAL_\d+)/i);
              record.station = stationMatch ? stationMatch[1] : 'Unknown';
            }
            if (!record.model) {
              console.warn('⚠️ 警告: 機種為空，嘗試從檔名解析', normalizedData);
              const modelMatch = jsonFile.name.match(/(WA\d+|WB\d+|XC\d+)/i);
              record.model = modelMatch ? modelMatch[1] : 'Unknown';
            }

            // 嘗試配對 LOG 檔案 - 為每筆記錄都嘗試配對
            const match = jsonFile.name.match(/(\d{8}-\d{6})-([^.]+)/);
            if (match) {
              const [, timestamp, serial] = match;
              const key = `${serial}_${timestamp}`;
              const logId = logMap.get(key);

              if (logId) {
                pairedCount++;

                // 儲存配對關係到 IndexedDB
                try {
                  await db.saveLogMapping({
                    recordKey: `${record.serialNumber}_${timestamp}_${record.station}`,
                    serial: record.serialNumber,
                    fileName: `${timestamp}-${serial}.log`,
                    logId
                  });
                  console.log(`🔗 配對關係儲存成功: ${record.serialNumber} <-> ${logId}`);
                } catch (error) {
                  console.error(`配對關係儲存失敗:`, error);
                }
              }
            }

            allRecords.push(record);
          }
        } catch (error) {
          console.error(`解析 JSON 檔案失敗: ${jsonFile.name}`, error);
        }

        setImportProgress(50 + ((i + 1) / jsonFiles.length) * 50);
      }

      // 儲存測試記錄到 IndexedDB 和 localStorage (雙重保存)
      try {
        await db.saveTestRecords(allRecords);
        console.log(`✅ 測試記錄儲存到 IndexedDB: ${allRecords.length} 筆`);
      } catch (error) {
        console.error('IndexedDB 測試記錄儲存失敗:', error);
      }

      // 同時保存到 localStorage 作為備援和相容性
      try {
        const existingData = JSON.parse(localStorage.getItem('mesTestData') || '[]');
        const updatedData = [...existingData, ...allRecords];
        localStorage.setItem('mesTestData', JSON.stringify(updatedData));
        console.log(`✅ 測試記錄同時儲存到 localStorage: ${allRecords.length} 筆`);

        // 觸發 storage 事件讓其他組件知道資料已更新
        window.dispatchEvent(new StorageEvent('storage', {
          key: 'mesTestData',
          newValue: JSON.stringify(updatedData),
          oldValue: JSON.stringify(existingData)
        }));

        // 觸發自定義事件（同頁面內的組件更新）
        window.dispatchEvent(new CustomEvent('mesDataUpdated', {
          detail: { recordCount: allRecords.length, totalCount: updatedData.length }
        }));
      } catch (lsError) {
        console.error('localStorage 儲存失敗:', lsError);
      }

      setImportResults({
        jsonCount: jsonFiles.length,
        logCount: logFiles.length,
        pairedCount,
        totalRecords: allRecords.length
      });

      showSuccess(
        `✅ 成功匯入 ${allRecords.length} 筆資料，其中 ${pairedCount} 筆已配對 LOG`,
        '匯入完成'
      );

    } catch (error) {
      console.error('匯入過程中發生錯誤:', error);
      showError('匯入過程中發生錯誤', '匯入失敗');
    } finally {
      setIsImporting(false);
      setImportProgress(0);
    }
  }, [showSuccess, showError, showInfo]);

  // 檔案選擇處理
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      handleFileImport(files);
      event.target.value = '';
    }
  };

  // 資料夾選擇處理
  const handleFolderSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const relevantFiles = Array.from(files).filter(f =>
        f.name.toLowerCase().endsWith('.json') || f.name.toLowerCase().endsWith('.log')
      );
      if (relevantFiles.length > 0) {
        handleFileImport(relevantFiles);
      } else {
        showError('選擇的資料夾中沒有找到 JSON 或 LOG 檔案', '匯入失敗');
      }
      event.target.value = '';
    }
  };

  // 新增站別
  const handleAddStation = () => {
    if (newStation.trim() && !stations.includes(newStation.trim())) {
      const updatedStations = [...stations, newStation.trim()];
      setStations(updatedStations);
      localStorage.setItem('mesStations', JSON.stringify(updatedStations));
      setNewStation('');
      showSuccess('站別新增成功', '設定更新');
    }
  };

  // 刪除站別
  const handleDeleteStation = (station: string) => {
    const updatedStations = stations.filter(s => s !== station);
    setStations(updatedStations);
    localStorage.setItem('mesStations', JSON.stringify(updatedStations));
    showSuccess('站別刪除成功', '設定更新');
  };

  // 新增機種
  const handleAddModel = () => {
    if (newModel.trim() && !models.includes(newModel.trim())) {
      const updatedModels = [...models, newModel.trim()];
      setModels(updatedModels);
      localStorage.setItem('mesModels', JSON.stringify(updatedModels));
      setNewModel('');
      showSuccess('機種新增成功', '設定更新');
    }
  };

  // 刪除機種
  const handleDeleteModel = (model: string) => {
    const updatedModels = models.filter(m => m !== model);
    setModels(updatedModels);
    localStorage.setItem('mesModels', JSON.stringify(updatedModels));
    showSuccess('機種刪除成功', '設定更新');
  };

  // 清空所有資料
  const handleClearAllData = async () => {
    try {
      // 清空 IndexedDB
      const db = await getMESDatabase();
      await db.clearAllData();
      console.log('✅ IndexedDB 資料已清空');

      // 清空所有相關的 localStorage 項目
      const keys = Object.keys(localStorage);
      const mesKeys = keys.filter(key =>
        key.startsWith('mes') ||
        key.startsWith('log_') ||
        key.includes('test') ||
        key.includes('Test') ||
        key.includes('MES')
      );

      mesKeys.forEach(key => {
        localStorage.removeItem(key);
        console.log(`🗑️ 清除 localStorage: ${key}`);
      });

      // 重置狀態
      setStations([]);
      setModels([]);
      setLogMappings(new Map());
      setImportResults(null);

      // 觸發全域事件讓所有組件更新
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'mesTestData',
        newValue: '[]',
        oldValue: null
      }));

      window.dispatchEvent(new CustomEvent('mesDataUpdated', {
        detail: { recordCount: 0, totalCount: 0, action: 'clear' }
      }));

      showSuccess(`✅ 完全清空：IndexedDB + ${mesKeys.length} 個 localStorage 項目`, '系統重置');
      console.log('🚀 系統已完全清空，準備測試實際資料載入');
    } catch (error) {
      console.error('清空資料時發生錯誤:', error);
      showError('清空資料時發生錯誤', '操作失敗');
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* 頁面標題 */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
          ⚙️ 系統設定
        </Typography>
        <Typography variant="body1" color="text.secondary">
          系統配置、資料匯入和管理功能
        </Typography>
      </Box>

      {/* 匯入進度顯示 */}
      {isImporting && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2" gutterBottom>
            正在匯入資料... {Math.round(importProgress)}%
          </Typography>
          <LinearProgress variant="determinate" value={importProgress} sx={{ mt: 1 }} />
        </Alert>
      )}

      {/* 匯入結果顯示 */}
      {importResults && (
        <Alert severity="success" sx={{ mb: 3 }}>
          <Typography variant="body2">
            匯入完成！JSON 檔案: {importResults.jsonCount}，LOG 檔案: {importResults.logCount}，
            成功配對: {importResults.pairedCount}，總記錄數: {importResults.totalRecords}
          </Typography>
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* 資料匯入 */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CloudUploadIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">
                  測試資料匯入
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                支援 JSON 和 LOG 檔案的單檔或批量匯入，系統會自動配對相關檔案
              </Typography>

              <Stack spacing={2}>
                <Button
                  variant="contained"
                  startIcon={<FileIcon />}
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isImporting}
                  fullWidth
                >
                  📁 選擇檔案
                </Button>

                <Button
                  variant="contained"
                  color="success"
                  startIcon={<FolderIcon />}
                  onClick={() => folderInputRef.current?.click()}
                  disabled={isImporting}
                  fullWidth
                >
                  📂 選擇資料夾
                </Button>
              </Stack>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".json,.log"
                style={{ display: 'none' }}
                onChange={handleFileSelect}
              />

              <input
                ref={folderInputRef}
                type="file"
                {...({ webkitdirectory: "", directory: "" } as any)}
                style={{ display: 'none' }}
                onChange={handleFolderSelect}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* 站別管理 */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <SettingsIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">
                  站別管理
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="新增站別"
                  value={newStation}
                  onChange={(e) => setNewStation(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddStation()}
                  InputProps={{
                    endAdornment: (
                      <IconButton onClick={handleAddStation} size="small">
                        <AddIcon />
                      </IconButton>
                    )
                  }}
                />
              </Box>

              <Box sx={{ maxHeight: 200, overflow: 'auto' }}>
                {stations.map((station) => (
                  <Chip
                    key={station}
                    label={station}
                    onDelete={() => handleDeleteStation(station)}
                    deleteIcon={<DeleteIcon />}
                    sx={{ m: 0.5 }}
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* 機種管理 */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AssessmentIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">
                  機種管理
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="新增機種"
                  value={newModel}
                  onChange={(e) => setNewModel(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddModel()}
                  InputProps={{
                    endAdornment: (
                      <IconButton onClick={handleAddModel} size="small">
                        <AddIcon />
                      </IconButton>
                    )
                  }}
                />
              </Box>

              <Box sx={{ maxHeight: 200, overflow: 'auto' }}>
                {models.map((model) => (
                  <Chip
                    key={model}
                    label={model}
                    onDelete={() => handleDeleteModel(model)}
                    deleteIcon={<DeleteIcon />}
                    sx={{ m: 0.5 }}
                    color="secondary"
                    variant="outlined"
                  />
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* 系統管理 */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <StorageIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">
                  系統管理
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                系統資料管理和維護功能
              </Typography>

              <Stack spacing={2}>
                <Button
                  variant="outlined"
                  color="warning"
                  startIcon={<DeleteIcon />}
                  onClick={handleClearAllData}
                  fullWidth
                >
                  清空所有資料
                </Button>

                <Button
                  variant="outlined"
                  color="info"
                  startIcon={<AssessmentIcon />}
                  onClick={() => {
                    // 測試資料連接
                    const testData = localStorage.getItem('mesTestData');
                    if (testData) {
                      const data = JSON.parse(testData);
                      console.log('🔍 localStorage 測試資料:', data);
                      alert(`📊 目前有 ${data.length} 筆測試記錄\n\n請檢查 Console 查看詳細資料`);
                    } else {
                      alert('❌ 沒有找到測試資料');
                    }
                  }}
                  fullWidth
                >
                  檢查資料狀態
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default SystemSettings;