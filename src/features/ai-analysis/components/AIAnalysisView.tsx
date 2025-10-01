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
import { useToast } from '../../common/components/ToastSystem';
import { useLanguage } from '../../../contexts/LanguageContext';

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

// Note: FAILURE_CATEGORIES will be created dynamically in the component to use t() function

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
  const { t } = useLanguage();

  // Create FAILURE_CATEGORIES dynamically to use t() function
  const FAILURE_CATEGORIES: FailureCategory[] = [
    {
      id: 'battery',
      name: t('battery.related'),
      icon: <BatteryIcon />,
      color: '#ff9800',
      keywords: ['battery', 'voltage', '電池', '電壓', 'power'],
      description: t('battery.description')
    },
    {
      id: 'communication',
      name: t('communication.issues'),
      icon: <WifiIcon />,
      color: '#2196f3',
      keywords: ['communication', 'connect', '通訊', '連線', 'timeout'],
      description: t('communication.description')
    },
    {
      id: 'hardware',
      name: t('hardware.failure'),
      icon: <BuildIcon />,
      color: '#f44336',
      keywords: ['hardware', 'component', '硬體', '元件', 'mechanical'],
      description: t('hardware.description')
    },
    {
      id: 'software',
      name: t('software.error'),
      icon: <MemoryIcon />,
      color: '#9c27b0',
      keywords: ['software', 'firmware', '軟體', '韌體', 'code'],
      description: t('software.description')
    },
    {
      id: 'calibration',
      name: t('calibration.issues'),
      icon: <EditIcon />,
      color: '#795548',
      keywords: ['calibration', 'accuracy', '校正', '精度', 'offset'],
      description: t('calibration.description')
    },
    {
      id: 'temperature',
      name: t('temperature.abnormal'),
      icon: <ThermostatIcon />,
      color: '#ff5722',
      keywords: ['temperature', 'thermal', '溫度', '熱量', 'overheat'],
      description: t('temperature.description')
    },
    {
      id: 'electrical',
      name: t('electrical.issues'),
      icon: <ElectricalIcon />,
      color: '#ffeb3b',
      keywords: ['electrical', 'power', '電源', '電流', 'circuit'],
      description: t('electrical.description')
    },
    {
      id: 'sensor',
      name: t('sensor.failure'),
      icon: <SensorsIcon />,
      color: '#4caf50',
      keywords: ['sensor', 'detection', '感測', '檢測', 'signal'],
      description: t('sensor.description')
    },
    {
      id: 'other',
      name: t('other.issues'),
      icon: <ErrorIcon />,
      color: '#607d8b',
      keywords: ['other', 'unknown', '其他', '未知', 'misc'],
      description: t('other.description')
    }
  ];

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
      showError(t('enter.log.content'));
      return;
    }

    setIsAnalyzing(true);
    showInfo(t('analyzing.log.content'), t('ai.analysis'));

    try {
      // 模擬 AI 分析過程
      await new Promise(resolve => setTimeout(resolve, 2000));

      const prediction = predictCategory(logContent);
      const category = FAILURE_CATEGORIES.find(c => c.id === prediction.category);

      setAnalysisResult({
        category: prediction.category,
        confidence: prediction.confidence,
        recommendations: [
          `${t('suggest.check')} ${category?.description}`,
          t('run.diagnostics'),
          t('record.issue.details')
        ]
      });

      showSuccess(t('log.analysis.complete'), t('ai.analysis'));
    } catch (error) {
      showError(t('analysis.error'));
    } finally {
      setIsAnalyzing(false);
    }
  }, [logContent, predictCategory, showSuccess, showError, showInfo, FAILURE_CATEGORIES, t]);

  const handleSaveTrainingData = useCallback(() => {
    if (!analysisResult || !logContent.trim()) return;

    const newData: TrainingData = {
      id: Date.now().toString(),
      serial: `AUTO_${Date.now()}`,
      station: t('manual.input'),
      logContent,
      category: selectedCategory || analysisResult.category,
      confidence: analysisResult.confidence,
      createdAt: new Date(),
      verified: false
    };

    setTrainingData(prev => [...prev, newData]);
    showSuccess(t('training.data.saved'));
    setLogContent('');
    setAnalysisResult(null);
    setSelectedCategory('');
  }, [analysisResult, logContent, selectedCategory, showSuccess, t]);

  const handleTrainModel = useCallback(async () => {
    setIsTraining(true);
    showInfo(t('start.training.model'), t('model.training'));

    try {
      // 模擬模型訓練過程
      await new Promise(resolve => setTimeout(resolve, 5000));

      const newModel: Model = {
        id: Date.now().toString(),
        name: t('updated.classification.model'),
        version: 'v1.3.0',
        accuracy: 0.89 + Math.random() * 0.08,
        trainedAt: new Date(),
        trainingDataCount: trainingData.length,
        status: 'ready'
      };

      setModels(prev => [newModel, ...prev]);
      showSuccess(t('model.training.complete'), t('training.success'));
    } catch (error) {
      showError(t('model.training.failed'));
    } finally {
      setIsTraining(false);
    }
  }, [trainingData.length, showSuccess, showError, showInfo, t]);

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

    showSuccess(t('label.updated'));
    setLabelDialogOpen(false);
    setSelectedRecord(null);
  }, [selectedRecord, showSuccess, t]);

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
          {t('ai.analysis.system')}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t('ai.analysis.description')}
        </Typography>
      </Box>

      <Paper sx={{ width: '100%' }}>
        <Tabs
          value={tabValue}
          onChange={(_, newValue) => setTabValue(newValue)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab icon={<AnalyticsIcon />} label={t('overview')} />
          <Tab icon={<LabelIcon />} label={t('data.annotation')} />
          <Tab icon={<AutoAwesomeIcon />} label={t('batch.prediction')} />
          <Tab icon={<ModelIcon />} label={t('model.management')} />
        </Tabs>

        {/* 總覽頁面 */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            {/* 統計卡片 */}
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    {t('total.training.data')}
                  </Typography>
                  <Typography variant="h4">
                    {overviewStats.totalData}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {t('verified')}: {overviewStats.verifiedData}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    {t('average.confidence')}
                  </Typography>
                  <Typography variant="h4">
                    {(overviewStats.averageConfidence * 100).toFixed(1)}%
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {t('prediction.accuracy.metric')}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    {t('model.count')}
                  </Typography>
                  <Typography variant="h4">
                    {models.length}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {models.filter(m => m.status === 'ready').length} {t('available.suffix')}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    {t('best.accuracy')}
                  </Typography>
                  <Typography variant="h4">
                    {Math.max(...models.map(m => m.accuracy), 0).toFixed(1)}%
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {t('model.performance')}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* 分類分佈圖 */}
            <Grid item xs={12} md={8}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {t('failure.category.distribution')}
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
                    {t('recent.activity')}
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
                    {t('log.content.analysis')}
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={6}
                    placeholder={t('enter.failed.log.content')}
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
                    {isAnalyzing ? t('analyzing') : t('ai.smart.analysis')}
                  </Button>

                  {analysisResult && (
                    <Alert severity="info" sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        {t('ai.prediction.result')}:
                      </Typography>
                      <Chip
                        icon={getCategoryDisplay(analysisResult.category).icon}
                        label={`${getCategoryDisplay(analysisResult.category).name} (${(analysisResult.confidence * 100).toFixed(1)}%)`}
                        sx={{ mb: 1, mr: 1 }}
                      />
                      <Typography variant="body2">
                        {t('recommended.actions')}:
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
                        <InputLabel>{t('confirm.category')}</InputLabel>
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
                        {t('save.as.training.data')}
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
                    {t('training.dataset')} ({trainingData.length} {t('items.suffix')})
                  </Typography>
                  <TableContainer sx={{ maxHeight: 400 }}>
                    <Table stickyHeader size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>{t('serial.number')}</TableCell>
                          <TableCell>{t('category')}</TableCell>
                          <TableCell>{t('confidence')}</TableCell>
                          <TableCell>{t('status')}</TableCell>
                          <TableCell>{t('actions')}</TableCell>
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
              {t('batch.prediction.feature')}
            </Typography>
            <Typography>
              {t('batch.prediction.description')}
            </Typography>
          </Alert>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {t('file.upload')}
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
                      {t('drag.drop.log.files')}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {t('supported.formats')}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {t('prediction.results')}
                  </Typography>
                  <Typography color="textSecondary">
                    {t('upload.to.see.results')}
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
                  {t('model.list')}
                </Typography>
                <Button
                  variant="contained"
                  onClick={handleTrainModel}
                  disabled={isTraining || trainingData.length < 10}
                  startIcon={isTraining ? <CircularProgress size={20} /> : <ModelIcon />}
                >
                  {isTraining ? t('training') : t('train.new.model')}
                </Button>
              </Box>

              {trainingData.length < 10 && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  {t('require.10.training.data.prefix')} {trainingData.length} {t('data.count.suffix')}
                </Alert>
              )}

              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>{t('model.name')}</TableCell>
                      <TableCell>{t('version')}</TableCell>
                      <TableCell>{t('accuracy')}</TableCell>
                      <TableCell>{t('training.data')}</TableCell>
                      <TableCell>{t('training.time')}</TableCell>
                      <TableCell>{t('status')}</TableCell>
                      <TableCell>{t('actions')}</TableCell>
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
        <DialogTitle>{t('edit.label')}</DialogTitle>
        <DialogContent>
          {selectedRecord && (
            <Box>
              <TextField
                fullWidth
                label={t('serial.number')}
                value={selectedRecord.serial}
                onChange={(e) => setSelectedRecord({...selectedRecord, serial: e.target.value})}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                multiline
                rows={4}
                label={t('log.content.analysis')}
                value={selectedRecord.logContent}
                onChange={(e) => setSelectedRecord({...selectedRecord, logContent: e.target.value})}
                sx={{ mb: 2 }}
              />
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>{t('failure.category')}</InputLabel>
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
          <Button onClick={() => setLabelDialogOpen(false)}>{t('cancel')}</Button>
          <Button variant="contained" onClick={handleSaveLabel}>{t('save')}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default AIAnalysisSystem;