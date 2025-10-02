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
  LinearProgress,
  Alert,
  Stack,
} from '@mui/material';
import {
  Folder as FolderIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Archive as ArchiveIcon,
} from '@mui/icons-material';
import { useToast } from '../../common/components/ToastSystem';
import { useLanguage } from '../../../contexts/LanguageContext';

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
  const [searchTerm, setSearchTerm] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<Record<string, number>>({});

  const { showSuccess, showError, showInfo } = useToast();
  const { t } = useLanguage();

  const filteredFolders = useMemo(() => {
    return folders.filter(folder =>
      folder.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      folder.path.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [folders, searchTerm]);

  const handleScanFolders = useCallback(async () => {
    setIsScanning(true);
    showInfo(t('mtcct.scanning'), t('system.scan'));

    try {
      // TODO: 實際的資料夾掃描邏輯
      await new Promise(resolve => setTimeout(resolve, 2000));

      // TODO: 從後端 API 獲取掃描結果
      const scannedFolders: MTCCTFolder[] = [];

      setFolders(scannedFolders);
      showSuccess(t('mtcct.scan.complete.found', { count: scannedFolders.length }), t('scan.result'));
    } catch (error) {
      showError(t('scan.error'), t('scan.failed'));
    } finally {
      setIsScanning(false);
    }
  }, [showSuccess, showError, showInfo, t]);

  const handleDownloadFolder = useCallback(async (folder: MTCCTFolder) => {
    showInfo(t('mtcct.download.start', { name: folder.name }), t('download.starting'));

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
            showSuccess(t('mtcct.download.complete', { name: folder.name }), t('download.completed'));
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
  }, [showSuccess, showInfo, t]);

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
          {t('mtcct.folder.management')}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t('mtcct.description')}
        </Typography>
      </Box>

      {/* 控制面板 */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              size="small"
              placeholder={t('search.folder.path')}
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
                {isScanning ? t('scanning') : t('scan.folders')}
              </Button>
              <Chip
                label={t('file.count', { count: filteredFolders.length })}
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
            {t('mtcct.scanning')}
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
                transition: 'all 0.2s',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: 4
                }
              }}
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
                    {t('size')}: <strong>{folder.size}</strong>
                  </Typography>
                  <Typography variant="body2">
                    {t('file.count')}: <strong>{folder.fileCount.toLocaleString()}</strong>
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('last.modified')}: {folder.lastModified.toLocaleString()}
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
                      {t('download.progress')}: {Math.round(downloadProgress[folder.id])}%
                    </Typography>
                  </Box>
                )}
              </CardContent>

              <CardActions>
                <Button
                  size="small"
                  startIcon={<DownloadIcon />}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownloadFolder(folder);
                  }}
                  disabled={folder.status === 'downloading'}
                >
                  {t('download')}
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
            {searchTerm ? t('no.folders.match') : t('no.folders.found')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {searchTerm ? t('try.different.search') : t('click.scan.to.start')}
          </Typography>
        </Paper>
      )}
    </Box>
  );
}

export default MTCCTManagement;