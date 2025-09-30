import * as React from 'react';
import { useState, useMemo, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Tab,
  Tabs,
  Button,
  Grid,
  Card,
  CardContent,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  Alert,
  Stack,
  IconButton,
  Tooltip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Badge,
  CircularProgress,
} from '@mui/material';
import {
  Settings as AIIcon,
  Label as LabelIcon,
  Analytics as AnalyticsIcon,
  Settings as ModelIcon,
  TrendingUp as TrendIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Build as BuildIcon,
  FlashOn as ElectricalIcon,
  Sensors as SensorsIcon,
  AcUnit as ThermostatIcon,
  Wifi as WifiIcon,
  BatteryFull as BatteryIcon,
  Memory as MemoryIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Star as AutoAwesomeIcon,
} from '@mui/icons-material';
import { useToast } from './ToastSystem';

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
      id={`ai-tabpanel-${index}`}
      aria-labelledby={`ai-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

interface FailureCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  keywords: string[];
  description: string;
}

const FAILURE_CATEGORIES: FailureCategory[] = [
  {
    id: 'battery',
    name: '電池相關',
    icon: <BatteryIcon />,
    color: '#ff9800',
    keywords: ['battery', 'voltage', '電池', '電壓', 'power'],
    description: '電池電壓異常、充電問題、電池壽命'
  },
  {
    id: 'communication',
    name: '通訊問題',
    icon: <WifiIcon />,
    color: '#2196f3',
    keywords: ['communication', 'connect', '通訊', '連線', 'timeout'],
    description: '通訊連線失敗、訊號中斷、協議錯誤'
  },
  {
    id: 'hardware',
    name: '硬體故障',
    icon: <BuildIcon />,
    color: '#f44336',
    keywords: ['hardware', 'component', '硬體', '元件', 'mechanical'],
    description: '機械故障、元件損壞、硬體異常'
  },
  {
    id: 'software',
    name: '軟體錯誤',
    icon: <MemoryIcon />,
    color: '#9c27b0',
    keywords: ['software', 'firmware', '軟體', '韌體', 'code'],
    description: '軟體異常、韌體錯誤、程式問題'
  },
  {
    id: 'calibration',
    name: '校正問題',
    icon: <EditIcon />,
    color: '#795548',
    keywords: ['calibration', 'accuracy', '校正', '精度', 'offset'],
    description: '校正失敗、精度不足、偏移異常'
  },
  {
    id: 'temperature',
    name: '溫度異常',
    icon: <ThermostatIcon />,
    color: '#ff5722',
    keywords: ['temperature', 'thermal', '溫度', '熱量', 'overheat'],
    description: '溫度過高、熱管理問題、溫度感測異常'
  },
  {
    id: 'electrical',
    name: '電源問題',
    icon: <ElectricalIcon />,
    color: '#ffeb3b',
    keywords: ['electrical', 'power', '電源', '電流', 'circuit'],
    description: '電源供應問題、電路異常、電流不穩'
  },
  {
    id: 'sensor',
    name: '感測器故障',
    icon: <SensorsIcon />,
    color: '#4caf50',
    keywords: ['sensor', 'detection', '感測', '檢測', 'signal'],
    description: '感測器故障、檢測異常、訊號問題'
  },
  {
    id: 'other',
    name: '其他問題',
    icon: <ErrorIcon />,
    color: '#607d8b',
    keywords: ['other', 'unknown', '其他', '未知', 'misc'],
    description: '未分類問題、其他異常情況'
  }
];

interface TrainingData {
  id: string;
  serial: string;
  station: string;
  logContent: string;
  category: string;
  confidence: number;
  createdAt: Date;
  verified: boolean;
}

interface Model {
  id: string;
  name: string;
  version: string;
  accuracy: number;
  trainedAt: Date;
  trainingDataCount: number;
  status: 'training' | 'ready' | 'outdated';
}

const MOCK_TRAINING_DATA: TrainingData[] = [];

const MOCK_MODELS: Model[] = [];

export function AIAnalysisSystem() {
  const [tabValue, setTabValue] = useState(0);
  const [trainingData, setTrainingData] = useState<TrainingData[]>(MOCK_TRAINING_DATA);
  const [models, setModels] = useState<Model[]>(MOCK_MODELS);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [logContent, setLogContent] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<{category: string; confidence: number; recommendations: string[]} | null>(null);
  const [isTraining, setIsTraining] = useState(false);
  const [labelDialogOpen, setLabelDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<TrainingData | null>(null);

  const { showSuccess, showError, showInfo } = useToast();

  // 智慧預標註邏輯
  const predictCategory = useCallback((content: string): {category: string; confidence: number} => {
    const normalizedContent = content.toLowerCase();
    let bestMatch = { category: 'other', confidence: 0.5 };

    for (const category of FAILURE_CATEGORIES) {
      const keywordMatches = category.keywords.filter(keyword =>
        normalizedContent.includes(keyword.toLowerCase())
      ).length;

      if (keywordMatches > 0) {
        const confidence = Math.min(0.6 + (keywordMatches * 0.15), 0.95);
        if (confidence > bestMatch.confidence) {
          bestMatch = { category: category.id, confidence };
        }
      }
    }

    return bestMatch;
  }, []);

  const handleAnalyzeLog = useCallback(async () => {
    if (!logContent.trim()) {
      showError('請輸入 LOG 內容');
      return;
    }

    setIsAnalyzing(true);
    showInfo('正在分析 LOG 內容...', 'AI 分析');

    try {
      // 模擬 AI 分析過程
      await new Promise(resolve => setTimeout(resolve, 2000));

      const prediction = predictCategory(logContent);
      const category = FAILURE_CATEGORIES.find(c => c.id === prediction.category);

      setAnalysisResult({
        category: prediction.category,
        confidence: prediction.confidence,
        recommendations: [
          `建議檢查 ${category?.description}`,
          '執行相關診斷程序',
          '記錄問題詳情以供後續分析'
        ]
      });

      showSuccess('LOG 分析完成', 'AI 分析');
    } catch (error) {
      showError('分析過程中發生錯誤');
    } finally {
      setIsAnalyzing(false);
    }
  }, [logContent, predictCategory, showSuccess, showError, showInfo]);

  const handleSaveTrainingData = useCallback(() => {
    if (!analysisResult || !logContent.trim()) return;

    const newData: TrainingData = {
      id: Date.now().toString(),
      serial: `AUTO_${Date.now()}`,
      station: 'Manual Input',
      logContent,
      category: selectedCategory || analysisResult.category,
      confidence: analysisResult.confidence,
      createdAt: new Date(),
      verified: false
    };

    setTrainingData(prev => [...prev, newData]);
    showSuccess('訓練資料已保存');
    setLogContent('');
    setAnalysisResult(null);
    setSelectedCategory('');
  }, [analysisResult, logContent, selectedCategory, showSuccess]);

  const handleTrainModel = useCallback(async () => {
    setIsTraining(true);
    showInfo('開始訓練模型...', '模型訓練');

    try {
      // 模擬模型訓練過程
      await new Promise(resolve => setTimeout(resolve, 5000));

      const newModel: Model = {
        id: Date.now().toString(),
        name: 'Updated Classification Model',
        version: 'v1.3.0',
        accuracy: 0.89 + Math.random() * 0.08,
        trainedAt: new Date(),
        trainingDataCount: trainingData.length,
        status: 'ready'
      };

      setModels(prev => [newModel, ...prev]);
      showSuccess('模型訓練完成', '訓練成功');
    } catch (error) {
      showError('模型訓練失敗');
    } finally {
      setIsTraining(false);
    }
  }, [trainingData.length, showSuccess, showError, showInfo]);

  const handleEditLabel = useCallback((record: TrainingData) => {
    setSelectedRecord(record);
    setLabelDialogOpen(true);
  }, []);

  const handleSaveLabel = useCallback(() => {
    if (!selectedRecord) return;

    setTrainingData(prev => prev.map(item =>
      item.id === selectedRecord.id
        ? { ...selectedRecord, verified: true }
        : item
    ));

    showSuccess('標註已更新');
    setLabelDialogOpen(false);
    setSelectedRecord(null);
  }, [selectedRecord, showSuccess]);

  const getCategoryDisplay = useCallback((categoryId: string) => {
    const category = FAILURE_CATEGORIES.find(c => c.id === categoryId);
    return category || FAILURE_CATEGORIES.find(c => c.id === 'other')!;
  }, []);

  const overviewStats = useMemo(() => {
    const totalData = trainingData.length;
    const verifiedData = trainingData.filter(d => d.verified).length;
    const categoryDistribution = FAILURE_CATEGORIES.map(cat => ({
      ...cat,
      count: trainingData.filter(d => d.category === cat.id).length
    }));

    return {
      totalData,
      verifiedData,
      categoryDistribution,
      averageConfidence: trainingData.reduce((sum, d) => sum + d.confidence, 0) / Math.max(totalData, 1)
    };
  }, [trainingData]);

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          <AIIcon sx={{ mr: 1 }} />
          AI 失敗原因分析系統
        </Typography>
        <Typography variant="body2" color="text.secondary">
          使用人工智慧技術自動分析測試失敗原因，提供智慧標註和預測功能
        </Typography>
      </Box>

      <Paper sx={{ width: '100%' }}>
        <Tabs
          value={tabValue}
          onChange={(_, newValue) => setTabValue(newValue)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab icon={<AnalyticsIcon />} label="總覽" />
          <Tab icon={<LabelIcon />} label="資料標註" />
          <Tab icon={<AutoAwesomeIcon />} label="批量預測" />
          <Tab icon={<ModelIcon />} label="模型管理" />
        </Tabs>

        {/* 總覽頁面 */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            {/* 統計卡片 */}
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    訓練資料總數
                  </Typography>
                  <Typography variant="h4">
                    {overviewStats.totalData}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    已驗證: {overviewStats.verifiedData}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    平均信心度
                  </Typography>
                  <Typography variant="h4">
                    {(overviewStats.averageConfidence * 100).toFixed(1)}%
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    預測準確度指標
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    模型數量
                  </Typography>
                  <Typography variant="h4">
                    {models.length}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {models.filter(m => m.status === 'ready').length} 個可用
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    最佳準確率
                  </Typography>
                  <Typography variant="h4">
                    {Math.max(...models.map(m => m.accuracy), 0).toFixed(1)}%
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    模型表現
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* 分類分佈圖 */}
            <Grid item xs={12} md={8}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    失敗原因分類分佈
                  </Typography>
                  <Grid container spacing={1}>
                    {overviewStats.categoryDistribution.map((category) => (
                      <Grid item xs={6} sm={4} md={3} key={category.id}>
                        <Paper
                          variant="outlined"
                          sx={{
                            p: 2,
                            textAlign: 'center',
                            borderColor: category.color,
                            borderWidth: 2
                          }}
                        >
                          <Box sx={{ color: category.color, mb: 1 }}>
                            {category.icon}
                          </Box>
                          <Typography variant="body2" gutterBottom>
                            {category.name}
                          </Typography>
                          <Typography variant="h6">
                            {category.count}
                          </Typography>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* 最近活動 */}
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    最近活動
                  </Typography>
                  <List dense>
                    {trainingData.slice(-5).reverse().map((data) => {
                      const category = getCategoryDisplay(data.category);
                      return (
                        <ListItem key={data.id}>
                          <ListItemIcon sx={{ color: category.color }}>
                            {category.icon}
                          </ListItemIcon>
                          <ListItemText
                            primary={`${data.serial} - ${category.name}`}
                            secondary={data.createdAt.toLocaleString()}
                          />
                        </ListItem>
                      );
                    })}
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* 資料標註頁面 */}
        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            {/* 手動標註工具 */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    LOG 內容分析
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={6}
                    placeholder="請輸入測試失敗的 LOG 內容..."
                    value={logContent}
                    onChange={(e) => setLogContent(e.target.value)}
                    sx={{ mb: 2 }}
                  />
                  <Button
                    variant="contained"
                    onClick={handleAnalyzeLog}
                    disabled={isAnalyzing || !logContent.trim()}
                    startIcon={isAnalyzing ? <CircularProgress size={20} /> : <AIIcon />}
                    fullWidth
                    sx={{ mb: 2 }}
                  >
                    {isAnalyzing ? '分析中...' : 'AI 智慧分析'}
                  </Button>

                  {analysisResult && (
                    <Alert severity="info" sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        AI 預測結果:
                      </Typography>
                      <Chip
                        icon={getCategoryDisplay(analysisResult.category).icon}
                        label={`${getCategoryDisplay(analysisResult.category).name} (${(analysisResult.confidence * 100).toFixed(1)}%)`}
                        sx={{ mb: 1, mr: 1 }}
                      />
                      <Typography variant="body2">
                        建議處理措施:
                      </Typography>
                      <ul>
                        {analysisResult.recommendations.map((rec, index) => (
                          <li key={index}>{rec}</li>
                        ))}
                      </ul>
                    </Alert>
                  )}

                  {analysisResult && (
                    <>
                      <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel>確認分類 (可修正 AI 預測)</InputLabel>
                        <Select
                          value={selectedCategory || analysisResult.category}
                          onChange={(e) => setSelectedCategory(e.target.value)}
                        >
                          {FAILURE_CATEGORIES.map((category) => (
                            <MenuItem key={category.id} value={category.id}>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Box sx={{ color: category.color, mr: 1 }}>
                                  {category.icon}
                                </Box>
                                {category.name}
                              </Box>
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      <Button
                        variant="outlined"
                        onClick={handleSaveTrainingData}
                        startIcon={<SaveIcon />}
                        fullWidth
                      >
                        保存為訓練資料
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* 訓練資料列表 */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    訓練資料集 ({trainingData.length} 筆)
                  </Typography>
                  <TableContainer sx={{ maxHeight: 400 }}>
                    <Table stickyHeader size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>序號</TableCell>
                          <TableCell>分類</TableCell>
                          <TableCell>信心度</TableCell>
                          <TableCell>狀態</TableCell>
                          <TableCell>操作</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {trainingData.map((data) => {
                          const category = getCategoryDisplay(data.category);
                          return (
                            <TableRow key={data.id}>
                              <TableCell>{data.serial}</TableCell>
                              <TableCell>
                                <Chip
                                  icon={category.icon}
                                  label={category.name}
                                  size="small"
                                  sx={{ backgroundColor: `${category.color}20` }}
                                />
                              </TableCell>
                              <TableCell>
                                {(data.confidence * 100).toFixed(1)}%
                              </TableCell>
                              <TableCell>
                                {data.verified ? (
                                  <CheckIcon color="success" />
                                ) : (
                                  <WarningIcon color="warning" />
                                )}
                              </TableCell>
                              <TableCell>
                                <IconButton
                                  size="small"
                                  onClick={() => handleEditLabel(data)}
                                >
                                  <EditIcon />
                                </IconButton>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* 批量預測頁面 */}
        <TabPanel value={tabValue} index={2}>
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              批量預測功能
            </Typography>
            <Typography>
              上傳多個 LOG 檔案，系統將自動使用訓練好的模型進行失敗原因預測。
              適用於大量測試資料的快速分析和分類。
            </Typography>
          </Alert>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    檔案上傳
                  </Typography>
                  <Box
                    sx={{
                      border: '2px dashed #ccc',
                      borderRadius: 2,
                      p: 4,
                      textAlign: 'center',
                      cursor: 'pointer',
                      '&:hover': { borderColor: 'primary.main' }
                    }}
                  >
                    <Typography>
                      拖拽 LOG 檔案到此處或點擊選擇檔案
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      支援 .log, .txt 格式
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    預測結果
                  </Typography>
                  <Typography color="textSecondary">
                    上傳檔案後，預測結果將顯示在此處
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* 模型管理頁面 */}
        <TabPanel value={tabValue} index={3}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">
                  模型列表
                </Typography>
                <Button
                  variant="contained"
                  onClick={handleTrainModel}
                  disabled={isTraining || trainingData.length < 10}
                  startIcon={isTraining ? <CircularProgress size={20} /> : <ModelIcon />}
                >
                  {isTraining ? '訓練中...' : '訓練新模型'}
                </Button>
              </Box>

              {trainingData.length < 10 && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  需要至少 10 筆訓練資料才能開始訓練模型。目前有 {trainingData.length} 筆資料。
                </Alert>
              )}

              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>模型名稱</TableCell>
                      <TableCell>版本</TableCell>
                      <TableCell>準確率</TableCell>
                      <TableCell>訓練資料</TableCell>
                      <TableCell>訓練時間</TableCell>
                      <TableCell>狀態</TableCell>
                      <TableCell>操作</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {models.map((model) => (
                      <TableRow key={model.id}>
                        <TableCell>{model.name}</TableCell>
                        <TableCell>{model.version}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <LinearProgress
                              variant="determinate"
                              value={model.accuracy * 100}
                              sx={{ width: 60, mr: 1 }}
                            />
                            {(model.accuracy * 100).toFixed(1)}%
                          </Box>
                        </TableCell>
                        <TableCell>{model.trainingDataCount}</TableCell>
                        <TableCell>{model.trainedAt.toLocaleString()}</TableCell>
                        <TableCell>
                          <Chip
                            label={model.status}
                            color={
                              model.status === 'ready' ? 'success' :
                              model.status === 'training' ? 'warning' : 'default'
                            }
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <IconButton size="small">
                            <InfoIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>

      {/* 標註編輯對話框 */}
      <Dialog open={labelDialogOpen} onClose={() => setLabelDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>編輯標註</DialogTitle>
        <DialogContent>
          {selectedRecord && (
            <Box>
              <TextField
                fullWidth
                label="序號"
                value={selectedRecord.serial}
                onChange={(e) => setSelectedRecord({...selectedRecord, serial: e.target.value})}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                multiline
                rows={4}
                label="LOG 內容"
                value={selectedRecord.logContent}
                onChange={(e) => setSelectedRecord({...selectedRecord, logContent: e.target.value})}
                sx={{ mb: 2 }}
              />
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>失敗分類</InputLabel>
                <Select
                  value={selectedRecord.category}
                  onChange={(e) => setSelectedRecord({...selectedRecord, category: e.target.value})}
                >
                  {FAILURE_CATEGORIES.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box sx={{ color: category.color, mr: 1 }}>
                          {category.icon}
                        </Box>
                        {category.name} - {category.description}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLabelDialogOpen(false)}>取消</Button>
          <Button variant="contained" onClick={handleSaveLabel}>保存</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default AIAnalysisSystem;