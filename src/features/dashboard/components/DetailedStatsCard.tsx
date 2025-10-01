import * as React from 'react';
import { useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Chip from '@mui/material/Chip';
import LinearProgress from '@mui/material/LinearProgress';
import Grid from '@mui/material/Grid';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import InfoIcon from '@mui/icons-material/Info';
import { useLanguage } from '../../../contexts/LanguageContext';

// 測試數據接口
interface TestRecord {
  id: number;
  serialNumber: string;
  station: string;
  model: string;
  result: 'PASS' | 'FAIL';
  testTime: string;
  items?: Array<{
    name: string;
    value: any;
    result: 'PASS' | 'FAIL';
  }>;
}

interface DetailedStatsProps {
  data: TestRecord[];
  showRetestDetails?: boolean;
}

export default function DetailedStatsCard({ data, showRetestDetails = false }: DetailedStatsProps) {
  const { t } = useLanguage();
  const [selectedRetestItem, setSelectedRetestItem] = useState<any>(null);
  const [retestDialogOpen, setRetestDialogOpen] = useState(false);

  // 站別統計 - 動態從實際資料收集
  const stationStats = useMemo(() => {
    // 動態收集所有站別
    const stationSet = new Set<string>();
    data.forEach(record => {
      if (record.station) {
        stationSet.add(record.station);
      }
    });

    const stations = Array.from(stationSet).sort();

    return stations.map(station => {
      const stationData = data.filter(record => record.station === station);
      const total = stationData.length;
      const passed = stationData.filter(record => record.result === 'PASS').length;
      const failed = total - passed;
      const passRate = total > 0 ? (passed / total) * 100 : 0;

      return {
        station,
        total,
        passed,
        failed,
        passRate: Number(passRate.toFixed(1)),
        status: passRate >= 95 ? 'excellent' : passRate >= 85 ? 'good' : passRate >= 70 ? 'warning' : 'critical'
      };
    });
  }, [data]);

  // 機種統計
  const modelStats = useMemo(() => {
    // 動態從實際資料收集機種
    const modelSet = new Set<string>();
    data.forEach(record => {
      if (record.model) {
        modelSet.add(record.model);
      }
    });

    const models = Array.from(modelSet).sort();

    return models.map(model => {
      const modelData = data.filter(record => record.model === model);
      const total = modelData.length;
      const passed = modelData.filter(record => record.result === 'PASS').length;
      const passRate = total > 0 ? (passed / total) * 100 : 0;

      return {
        model,
        total,
        passed,
        passRate: Number(passRate.toFixed(1))
      };
    });
  }, [data]);


  // 失敗原因分析 - 基於真實測項失敗資料，顯示測項FAIL比例
  const failureReasons = useMemo(() => {
    // 收集所有測項的統計資料
    const testItemStats = new Map<string, { total: number, failed: number }>();

    // 統計每個測項的總數和失敗數
    data.forEach(record => {
      if (record.items && Array.isArray(record.items)) {
        record.items.forEach(item => {
          const testName = item.name || 'Unknown Test';
          const current = testItemStats.get(testName) || { total: 0, failed: 0 };
          current.total++;
          if (item.result === 'FAIL') {
            current.failed++;
          }
          testItemStats.set(testName, current);
        });
      }
    });

    // 轉換為陣列並計算失敗比例，只顯示有失敗的測項
    return Array.from(testItemStats.entries())
      .map(([testName, stats]) => ({
        reason: testName,
        count: stats.failed,
        total: stats.total,
        failureRate: stats.total > 0 ? Number(((stats.failed / stats.total) * 100).toFixed(1)) : 0
      }))
      .filter(item => item.count > 0) // 只顯示有失敗的測項
      .sort((a, b) => b.failureRate - a.failureRate); // 按失敗率排序
  }, [data]);

  // 複測詳情分析 - 按序號合併並顯示FAIL測項和測值
  const retestDetails = useMemo(() => {
    const failedRecords = data.filter(record => record.result === 'FAIL');

    // 按序號分組
    const groupedBySerial = failedRecords.reduce((groups, record) => {
      const serialNumber = record.serialNumber || 'Unknown';
      if (!groups[serialNumber]) {
        groups[serialNumber] = [];
      }
      groups[serialNumber].push(record);
      return groups;
    }, {});

    // 處理每個序號群組
    const retestItems = Object.entries(groupedBySerial).map(([serialNumber, records]) => {
      // 按時間排序記錄
      const sortedRecords = records.sort((a, b) =>
        new Date(a.testTime || a.datetime) - new Date(b.testTime || b.datetime)
      );

      const firstRecord = sortedRecords[0]; // 最早的記錄
      const lastRecord = sortedRecords[sortedRecords.length - 1]; // 最晚的記錄

      // 收集所有FAIL測項和測值，保留完整的items資料
      const allFailedItems = [];
      const allFailedItemsData = []; // 保存完整的失敗測項資料

      sortedRecords.forEach((record, recordIndex) => {
        console.log(`=== Record ${recordIndex} ===`);
        console.log('Record:', record);
        console.log('Record.items:', record.items);

        if (record.items && Array.isArray(record.items)) {
          console.log('Items found:', record.items.length);
          record.items.forEach((item, itemIndex) => {
            console.log(`Item ${itemIndex}:`, item);
            console.log('Item.name:', item.name);
            console.log('Item.value:', item.value);
            console.log('Item.result:', item.result);
          });

          const failedItems = record.items.filter(item => item.result === 'FAIL');
          console.log('Failed items (result=FAIL):', failedItems);

          failedItems.forEach(item => {
            // 保存完整的測項資料
            allFailedItemsData.push(item);

            if (item.name) {
              // 只顯示測項名稱，因為value是FAIL/PASS結果
              allFailedItems.push(item.name);
            }
          });
        } else {
          console.log('No items found in this record');
        }
      });

      // 去重並排序
      const uniqueFailedItems = [...new Set(allFailedItems)].sort();

      // 生成失敗原因顯示
      const failureReason = uniqueFailedItems.length > 0
        ? uniqueFailedItems.join(', ')
        : '測試失敗';

      return {
        id: lastRecord.id || Math.random(),
        serialNumber: serialNumber,
        station: lastRecord.station || 'Unknown',
        model: lastRecord.model || 'Unknown',
        testTime: lastRecord.testTime || lastRecord.datetime || '',
        firstTestTime: firstRecord.testTime || firstRecord.datetime || '', // 首次時間
        lastTestTime: lastRecord.testTime || lastRecord.datetime || '', // 最終時間
        reason: failureReason,
        retestCount: records.length, // 複測次數
        allRecords: sortedRecords, // 保存所有記錄（已排序）
        originalRecord: {
          ...lastRecord,
          items: allFailedItemsData // 保存所有失敗測項的完整資料
        }, // 最新記錄，包含完整的失敗測項資料
        failedItems: allFailedItemsData // 直接保存所有失敗測項資料
      };
    });

    // 按複測次數和時間排序
    return retestItems.sort((a, b) => {
      if (b.retestCount !== a.retestCount) {
        return b.retestCount - a.retestCount; // 複測次數多的在前
      }
      return new Date(b.testTime) - new Date(a.testTime); // 時間新的在前
    }).slice(0, 10); // 限制顯示數量
  }, [data]);


  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'success';
      case 'good': return 'info';
      case 'warning': return 'warning';
      case 'critical': return 'error';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'excellent': return '優秀';
      case 'good': return '良好';
      case 'warning': return '警告';
      case 'critical': return '異常';
      default: return '正常';
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {t('detailed.stats')}
        </Typography>

        <Grid container spacing={3}>
          {/* 站別表現統計 */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
              {t('station.performance')}
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>站別</TableCell>
                    <TableCell align="center">總數</TableCell>
                    <TableCell align="center">通過率</TableCell>
                    <TableCell align="center">狀態</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {stationStats.map((stat) => (
                    <TableRow key={stat.station} hover>
                      <TableCell sx={{ fontFamily: 'monospace' }}>
                        {stat.station}
                      </TableCell>
                      <TableCell align="center">
                        {stat.total}
                      </TableCell>
                      <TableCell align="center">
                        <Box>
                          <Typography variant="body2" sx={{ mb: 0.5 }}>
                            {stat.passRate}%
                          </Typography>
                          <LinearProgress
                            variant="determinate"
                            value={stat.passRate}
                            color={getStatusColor(stat.status) as any}
                            sx={{ height: 6, borderRadius: 3 }}
                          />
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={getStatusText(stat.status)}
                          size="small"
                          color={getStatusColor(stat.status) as any}
                          variant="outlined"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>

          {/* 機種統計 */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
              機種測試統計
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>機種</TableCell>
                    <TableCell align="center">測試數量</TableCell>
                    <TableCell align="center">通過數量</TableCell>
                    <TableCell align="center">通過率</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {modelStats.map((stat) => (
                    <TableRow key={stat.model} hover>
                      <TableCell>
                        <Chip
                          label={stat.model}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="center">
                        {stat.total}
                      </TableCell>
                      <TableCell align="center">
                        {stat.passed}
                      </TableCell>
                      <TableCell align="center">
                        <Typography
                          variant="body2"
                          color={stat.passRate >= 90 ? 'success.main' : stat.passRate >= 80 ? 'warning.main' : 'error.main'}
                          sx={{ fontWeight: 600 }}
                        >
                          {stat.passRate}%
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>

          {/* 失敗原因分析 */}
          {failureReasons.length > 0 && (
            <Grid size={12}>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                失敗原因分析
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>測項名稱</TableCell>
                      <TableCell align="center">失敗次數</TableCell>
                      <TableCell align="center">總測試次數</TableCell>
                      <TableCell align="center">失敗率</TableCell>
                      <TableCell>分佈</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {failureReasons.slice(0, 5).map((reason, index) => (
                      <TableRow key={reason.reason} hover>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Typography variant="body2" sx={{ fontWeight: index < 3 ? 600 : 400 }}>
                              #{index + 1}
                            </Typography>
                            <Typography variant="body2">
                              {reason.reason}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={reason.count}
                            size="small"
                            color={index < 2 ? 'error' : 'default'}
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell align="center">
                          {reason.total}
                        </TableCell>
                        <TableCell align="center">
                          <Typography
                            variant="body2"
                            color={reason.failureRate >= 50 ? 'error.main' : reason.failureRate >= 20 ? 'warning.main' : 'text.primary'}
                            sx={{ fontWeight: 600 }}
                          >
                            {reason.failureRate}%
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <LinearProgress
                            variant="determinate"
                            value={Math.min(reason.failureRate, 100)}
                            color={reason.failureRate >= 50 ? 'error' : reason.failureRate >= 20 ? 'warning' : 'primary'}
                            sx={{ height: 6, borderRadius: 3 }}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          )}

          {/* 複測詳情清單 */}
          {showRetestDetails && retestDetails.length > 0 && (
            <Grid size={12}>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                複測詳情清單
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>序號</TableCell>
                      <TableCell>站別</TableCell>
                      <TableCell>機種</TableCell>
                      <TableCell>失敗測項名稱</TableCell>
                      <TableCell>測試時間</TableCell>
                      <TableCell align="center">操作</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {retestDetails.slice(0, 10).map((item) => (
                      <TableRow key={item.id} hover>
                        <TableCell sx={{ fontFamily: 'monospace' }}>
                          {item.serialNumber}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={item.station}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={item.model}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {item.reason}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {new Date(item.testTime).toLocaleString()}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => {
                              setSelectedRetestItem(item);
                              setRetestDialogOpen(true);
                            }}
                            title="查看詳細資訊"
                          >
                            <InfoIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          )}
        </Grid>
      </CardContent>

      {/* 複測詳細資訊彈窗 */}
      <Dialog
        open={retestDialogOpen}
        onClose={() => setRetestDialogOpen(false)}
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
            複測詳細資訊
          </Typography>
          <IconButton
            onClick={() => setRetestDialogOpen(false)}
            size="small"
            sx={{ color: 'grey.400' }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers sx={{ p: 0 }}>
          {selectedRetestItem && (
            <Box p={3}>
              {/* 複測記錄詳情 - 仿照原始MES格式 */}
              <Box mb={3}>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 6, sm: 4 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      序號:
                    </Typography>
                    <Typography variant="body1" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                      {selectedRetestItem.serialNumber}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 6, sm: 4 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      站別:
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {selectedRetestItem.station}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 6, sm: 4 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      機種:
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {selectedRetestItem.model}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 6, sm: 4 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      複測次數:
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {selectedRetestItem.retestCount || 1}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 6, sm: 4 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      首次結果:
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600, color: 'error.main' }}>
                      FAIL
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 6, sm: 4 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      最終結果:
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600, color: 'error.main' }}>
                      FAIL
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      首次時間:
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {selectedRetestItem.firstTestTime ?
                        new Date(selectedRetestItem.firstTestTime).toLocaleString('sv-SE').replace('T', ' ') :
                        new Date(selectedRetestItem.testTime).toLocaleString('sv-SE').replace('T', ' ')
                      }
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      最終時間:
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {selectedRetestItem.lastTestTime ?
                        new Date(selectedRetestItem.lastTestTime).toLocaleString('sv-SE').replace('T', ' ') :
                        new Date(selectedRetestItem.testTime).toLocaleString('sv-SE').replace('T', ' ')
                      }
                    </Typography>
                  </Grid>
                </Grid>
              </Box>

              {/* 完整測試記錄 */}
              <Box>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                  完整測試記錄 ({selectedRetestItem.retestCount || 1} 筆)
                </Typography>
                <TableContainer>
                  <Table size="small" sx={{ border: 1, borderColor: 'divider' }}>
                    <TableHead>
                      <TableRow sx={{ bgcolor: 'grey.100' }}>
                        <TableCell sx={{ fontWeight: 600, border: 1, borderColor: 'divider' }}>測試時間</TableCell>
                        <TableCell sx={{ fontWeight: 600, border: 1, borderColor: 'divider' }}>結果</TableCell>
                        <TableCell sx={{ fontWeight: 600, border: 1, borderColor: 'divider' }}>測試員</TableCell>
                        <TableCell sx={{ fontWeight: 600, border: 1, borderColor: 'divider' }}>治具</TableCell>
                        <TableCell sx={{ fontWeight: 600, border: 1, borderColor: 'divider' }}>FAIL測項</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {(selectedRetestItem.allRecords || [selectedRetestItem.originalRecord]).map((record, index) => (
                        <TableRow key={index}>
                          <TableCell sx={{ border: 1, borderColor: 'divider', fontFamily: 'monospace' }}>
                            {new Date(record.testTime || record.datetime).toLocaleString('sv-SE').replace('T', ' ')}
                          </TableCell>
                          <TableCell sx={{ border: 1, borderColor: 'divider' }}>
                            <Typography variant="body2" color="error.main" sx={{ fontWeight: 600 }}>
                              {record.result || 'FAIL'}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ border: 1, borderColor: 'divider' }}>
                            {record.tester || 'M403C007'}
                          </TableCell>
                          <TableCell sx={{ border: 1, borderColor: 'divider' }}>
                            {record.partNumber || '1-1'}
                          </TableCell>
                          <TableCell sx={{ border: 1, borderColor: 'divider', maxWidth: 200 }}>
                            {(() => {
                              // 顯示該筆記錄的具體失敗測項
                              if (record.items && Array.isArray(record.items)) {
                                const failedItems = record.items.filter(item => item.result === 'FAIL');
                                if (failedItems.length > 0) {
                                  return failedItems.map((item, itemIndex) => (
                                    <Box key={itemIndex} mb={0.5}>
                                      <Typography variant="body2" color="error.main" sx={{ fontWeight: 500 }}>
                                        {item.name || '未知測項'}
                                      </Typography>
                                      {item.value && (
                                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem', mt: 0.2 }}>
                                          {item.value}
                                        </Typography>
                                      )}
                                    </Box>
                                  ));
                                }
                              }
                              return (
                                <Typography variant="body2" color="error.main" sx={{ fontWeight: 500 }}>
                                  測試失敗
                                </Typography>
                              );
                            })()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button
            variant="outlined"
            onClick={() => setRetestDialogOpen(false)}
          >
            關閉
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              // 這裡可以添加開始複測的邏輯
              console.log('開始複測:', selectedRetestItem);
              setRetestDialogOpen(false);
            }}
          >
            開始複測
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}