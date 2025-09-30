import * as React from 'react';
import { useState, useMemo, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  LinearProgress,
  Alert,
  Tooltip,
  Stack,
  Divider,
} from '@mui/material';
import {
  Folder as FolderIcon,
  InsertDriveFile as FileIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  FolderOpen as FolderOpenIcon,
  Archive as ArchiveIcon,
} from '@mui/icons-material';
import { useToast } from './ToastSystem';

interface MTCCTFolder {
  id: string;
  name: string;
  path: string;
  size: string;
  fileCount: number;
  lastModified: Date;
  status: 'available' | 'downloading' | 'error' | 'completed';
  type: 'log' | 'data' | 'config' | 'backup';
}

interface MTCCTFile {
  id: string;
  name: string;
  path: string;
  size: string;
  type: string;
  lastModified: Date;
  folderId: string;
}

const MOCK_FOLDERS: MTCCTFolder[] = [];

const MOCK_FILES: MTCCTFile[] = [];

export function MTCCTManagement() {
  const [folders, setFolders] = useState<MTCCTFolder[]>(MOCK_FOLDERS);
  const [selectedFolder, setSelectedFolder] = useState<MTCCTFolder | null>(null);
  const [files, setFiles] = useState<MTCCTFile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<Record<string, number>>({});

  const { showSuccess, showError, showInfo } = useToast();

  const filteredFolders = useMemo(() => {
    return folders.filter(folder =>
      folder.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      folder.path.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [folders, searchTerm]);

  const handleScanFolders = useCallback(async () => {
    setIsScanning(true);
    showInfo('正在掃描 MTCCT 資料夾...', '系統掃描');

    try {
      // 模擬掃描過程
      await new Promise(resolve => setTimeout(resolve, 2000));

      // 模擬發現新資料夾
      const newFolder: MTCCTFolder = {
        id: Date.now().toString(),
        name: `New_Scan_${new Date().getHours()}${new Date().getMinutes()}`,
        path: `/MTCCT/NewScan/${Date.now()}`,
        size: '67.3 MB',
        fileCount: 445,
        lastModified: new Date(),
        status: 'available',
        type: 'log'
      };

      setFolders(prev => [...prev, newFolder]);
      showSuccess(`掃描完成，發現 1 個新資料夾`, '掃描結果');
    } catch (error) {
      showError('掃描過程中發生錯誤', '掃描失敗');
    } finally {
      setIsScanning(false);
    }
  }, [showSuccess, showError, showInfo]);

  const handleFolderClick = useCallback((folder: MTCCTFolder) => {
    setSelectedFolder(folder);
    setFiles(MOCK_FILES.filter(file => file.folderId === folder.id));
    setDetailsOpen(true);
  }, []);

  const handleDownloadFolder = useCallback(async (folder: MTCCTFolder) => {
    showInfo(`開始下載資料夾: ${folder.name}`, '下載開始');

    setFolders(prev => prev.map(f =>
      f.id === folder.id ? { ...f, status: 'downloading' } : f
    ));

    // 模擬下載進度
    const interval = setInterval(() => {
      setDownloadProgress(prev => {
        const current = prev[folder.id] || 0;
        const newProgress = Math.min(current + Math.random() * 15, 100);

        if (newProgress >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setFolders(prevFolders => prevFolders.map(f =>
              f.id === folder.id ? { ...f, status: 'completed' } : f
            ));
            showSuccess(`資料夾下載完成: ${folder.name}`, '下載完成');
            setDownloadProgress(prevProg => {
              const newProg = { ...prevProg };
              delete newProg[folder.id];
              return newProg;
            });
          }, 500);
        }

        return { ...prev, [folder.id]: newProgress };
      });
    }, 300);
  }, [showSuccess, showInfo]);

  const handleDownloadFile = useCallback(async (file: MTCCTFile) => {
    showInfo(`下載檔案: ${file.name}`, '檔案下載');

    // 模擬檔案下載
    const blob = new Blob([`Mock content for ${file.name}`], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showSuccess('檔案下載完成', '下載成功');
  }, [showSuccess, showInfo]);

  const getStatusColor = (status: MTCCTFolder['status']) => {
    switch (status) {
      case 'available': return 'success';
      case 'downloading': return 'warning';
      case 'error': return 'error';
      case 'completed': return 'info';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: MTCCTFolder['status']) => {
    switch (status) {
      case 'available': return <CheckCircleIcon />;
      case 'downloading': return <DownloadIcon />;
      case 'error': return <ErrorIcon />;
      case 'completed': return <ArchiveIcon />;
      default: return <InfoIcon />;
    }
  };

  const getTypeColor = (type: MTCCTFolder['type']) => {
    switch (type) {
      case 'log': return 'primary';
      case 'data': return 'secondary';
      case 'config': return 'warning';
      case 'backup': return 'info';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          MTCCT 資料夾管理
        </Typography>
        <Typography variant="body2" color="text.secondary">
          管理和下載 MTCCT 系統中的測試資料、LOG 檔案和設定檔案
        </Typography>
      </Box>

      {/* 控制面板 */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              size="small"
              placeholder="搜尋資料夾名稱或路徑..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Stack direction="row" spacing={1}>
              <Button
                variant="contained"
                startIcon={<RefreshIcon />}
                onClick={handleScanFolders}
                disabled={isScanning}
                size="small"
              >
                {isScanning ? '掃描中...' : '掃描資料夾'}
              </Button>
              <Chip
                label={`${filteredFolders.length} 個資料夾`}
                color="primary"
                variant="outlined"
              />
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      {/* 掃描進度 */}
      {isScanning && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="body2" gutterBottom>
            正在掃描 MTCCT 資料夾...
          </Typography>
          <LinearProgress />
        </Paper>
      )}

      {/* 資料夾列表 */}
      <Grid container spacing={2}>
        {filteredFolders.map((folder) => (
          <Grid item xs={12} sm={6} md={4} key={folder.id}>
            <Card
              sx={{
                height: '100%',
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: 4
                }
              }}
              onClick={() => handleFolderClick(folder)}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                  <FolderIcon color="primary" sx={{ mr: 1, mt: 0.5 }} />
                  <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                    <Typography variant="subtitle1" noWrap>
                      {folder.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {folder.path}
                    </Typography>
                  </Box>
                </Box>

                <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                  <Chip
                    label={folder.type.toUpperCase()}
                    size="small"
                    color={getTypeColor(folder.type)}
                  />
                  <Chip
                    icon={getStatusIcon(folder.status)}
                    label={folder.status}
                    size="small"
                    color={getStatusColor(folder.status)}
                  />
                </Stack>

                <Box sx={{ mb: 1 }}>
                  <Typography variant="body2">
                    大小: <strong>{folder.size}</strong>
                  </Typography>
                  <Typography variant="body2">
                    檔案數量: <strong>{folder.fileCount.toLocaleString()}</strong>
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    修改時間: {folder.lastModified.toLocaleString()}
                  </Typography>
                </Box>

                {/* 下載進度 */}
                {downloadProgress[folder.id] && (
                  <Box sx={{ mb: 1 }}>
                    <LinearProgress
                      variant="determinate"
                      value={downloadProgress[folder.id]}
                      sx={{ mb: 0.5 }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      下載進度: {Math.round(downloadProgress[folder.id])}%
                    </Typography>
                  </Box>
                )}
              </CardContent>

              <CardActions>
                <Button
                  size="small"
                  startIcon={<FolderOpenIcon />}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleFolderClick(folder);
                  }}
                >
                  查看
                </Button>
                <Button
                  size="small"
                  startIcon={<DownloadIcon />}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownloadFolder(folder);
                  }}
                  disabled={folder.status === 'downloading'}
                >
                  下載
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* 無結果顯示 */}
      {filteredFolders.length === 0 && !isScanning && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <FolderIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {searchTerm ? '未找到符合條件的資料夾' : '尚未發現任何 MTCCT 資料夾'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {searchTerm ? '請嘗試修改搜尋條件' : '點擊「掃描資料夾」按鈕開始搜尋'}
          </Typography>
        </Paper>
      )}

      {/* 資料夾詳情對話框 */}
      <Dialog
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <FolderIcon sx={{ mr: 1 }} />
            {selectedFolder?.name}
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedFolder && (
            <>
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  路徑: {selectedFolder.path}<br />
                  大小: {selectedFolder.size} | 檔案數量: {selectedFolder.fileCount.toLocaleString()}
                </Typography>
              </Alert>

              <Typography variant="h6" gutterBottom>
                檔案列表 ({files.length} 個檔案)
              </Typography>

              <List>
                {files.map((file) => (
                  <React.Fragment key={file.id}>
                    <ListItem>
                      <ListItemIcon>
                        <FileIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary={file.name}
                        secondary={`${file.size} | ${file.lastModified.toLocaleString()}`}
                      />
                      <Tooltip title="下載檔案">
                        <IconButton
                          size="small"
                          onClick={() => handleDownloadFile(file)}
                        >
                          <DownloadIcon />
                        </IconButton>
                      </Tooltip>
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
              </List>

              {files.length === 0 && (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <FileIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                  <Typography color="text.secondary">
                    此資料夾暫無檔案
                  </Typography>
                </Box>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsOpen(false)}>
            關閉
          </Button>
          {selectedFolder && (
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={() => {
                handleDownloadFolder(selectedFolder);
                setDetailsOpen(false);
              }}
              disabled={selectedFolder.status === 'downloading'}
            >
              下載整個資料夾
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default MTCCTManagement;