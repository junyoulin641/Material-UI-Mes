import * as React from "react";
import { useState, useMemo } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Chip from "@mui/material/Chip";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TablePagination from "@mui/material/TablePagination";
import IconButton from "@mui/material/IconButton";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Tooltip from "@mui/material/Tooltip";
import Paper from "@mui/material/Paper";
import Divider from "@mui/material/Divider";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import ClearRoundedIcon from "@mui/icons-material/ClearRounded";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DownloadIcon from "@mui/icons-material/Download";
import FileOpenIcon from "@mui/icons-material/FileOpen";
import FilterListIcon from "@mui/icons-material/FilterList";

// 模擬的 LOG 搜尋結果
interface LogRecord {
  id: string;
  workOrder: string;
  serialNumber: string;
  station: string;
  model: string;
  testTime: string;
  tester: string;
  result: "PASS" | "FAIL";
  logFileName: string;
  logContent: string;
}

const generateMockLogData = (): LogRecord[] => {
  const stations = ["FA_FT01", "FA_FT02", "ICT_01", "ICT_02", "FINAL_01"];
  const models = ["WA3", "WA4", "CH5", "DH6"];
  const testers = ["Test01", "Test02", "Test03"];
  const data: LogRecord[] = [];

  for (let i = 0; i < 50; i++) {
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 30));
    const serial = `CH${Math.random().toString().substr(2, 12)}`;
    const station = stations[Math.floor(Math.random() * stations.length)];
    const model = models[Math.floor(Math.random() * models.length)];
    const result = Math.random() > 0.15 ? "PASS" : "FAIL";

    data.push({
      id: i.toString(),
      workOrder: `621001${Math.random().toString().substr(2, 8)}`,
      serialNumber: serial,
      station,
      model,
      testTime: date.toISOString().replace("T", " ").substr(0, 19),
      tester: testers[Math.floor(Math.random() * testers.length)],
      result,
      logFileName: `${model}-FixtureNumber[1]-${date.toISOString().substr(0, 10).replace(/-/g, "")}-${serial}[1].log`,
      logContent: generateLogContent(serial, station, model, result, date)
    });
  }

  return data.sort((a, b) => new Date(b.testTime).getTime() - new Date(a.testTime).getTime());
};

const generateLogContent = (serial: string, station: string, model: string, result: string, date: Date): string => {
  return `LOG 檔案內容
=====================================
測試資訊:
- 序號: ${serial}
- 站別: ${station}
- 機種: ${model}
- 時間: ${date.toISOString()}
- 結果: ${result}

測試流程:
[${date.toTimeString().substr(0, 8)}] 開始測試流程
[${date.toTimeString().substr(0, 8)}] 檢查治具連線... OK
[${date.toTimeString().substr(0, 8)}] 載入測試參數... OK
[${date.toTimeString().substr(0, 8)}] 執行電壓測試... ${result === "PASS" ? "PASS" : "FAIL"}
[${date.toTimeString().substr(0, 8)}] 執行電流測試... ${result === "PASS" ? "PASS" : "FAIL"}
[${date.toTimeString().substr(0, 8)}] 執行功能測試... ${result === "PASS" ? "PASS" : "FAIL"}
[${date.toTimeString().substr(0, 8)}] 生成測試報告... OK
[${date.toTimeString().substr(0, 8)}] 測試完成

詳細測試項目:
- 電壓測試: ${result === "PASS" ? "3.3V PASS" : "3.1V FAIL"}
- 電流測試: ${result === "PASS" ? "150mA PASS" : "180mA FAIL"}
- 溫度測試: ${result === "PASS" ? "25°C PASS" : "35°C FAIL"}
- 功能測試: ${result === "PASS" ? "ALL PASS" : "FUNCTION FAIL"}

測試結果: ${result}
=====================================`;
};

interface SearchParams {
  workOrder: string;
  serialNumber: string;
  station: string;
  model: string;
  dateFrom: string;
  dateTo: string;
  result: string;
}

export default function MesEnhancedLogQuery() {
  const [searchParams, setSearchParams] = useState<SearchParams>({
    workOrder: "",
    serialNumber: "",
    station: "",
    model: "",
    dateFrom: "",
    dateTo: "",
    result: "",
  });

  const [searchResults, setSearchResults] = useState<LogRecord[]>([]);
  const [isSearched, setIsSearched] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedLog, setSelectedLog] = useState<LogRecord | null>(null);
  const [logDialogOpen, setLogDialogOpen] = useState(false);

  const mockData = useMemo(() => generateMockLogData(), []);

  const handleInputChange = (field: keyof SearchParams) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchParams(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleSelectChange = (field: keyof SearchParams) => (event: any) => {
    setSearchParams(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleSearch = () => {
    let filtered = mockData;

    // 套用篩選條件
    if (searchParams.workOrder.trim()) {
      filtered = filtered.filter(record =>
        record.workOrder.toLowerCase().includes(searchParams.workOrder.toLowerCase())
      );
    }

    if (searchParams.serialNumber.trim()) {
      filtered = filtered.filter(record =>
        record.serialNumber.toLowerCase().includes(searchParams.serialNumber.toLowerCase())
      );
    }

    if (searchParams.station) {
      filtered = filtered.filter(record => record.station === searchParams.station);
    }

    if (searchParams.model) {
      filtered = filtered.filter(record => record.model === searchParams.model);
    }

    if (searchParams.result) {
      filtered = filtered.filter(record => record.result === searchParams.result);
    }

    if (searchParams.dateFrom) {
      filtered = filtered.filter(record =>
        record.testTime >= searchParams.dateFrom
      );
    }

    if (searchParams.dateTo) {
      filtered = filtered.filter(record =>
        record.testTime <= searchParams.dateTo + " 23:59:59"
      );
    }

    setSearchResults(filtered);
    setIsSearched(true);
    setPage(0);
  };

  const handleClear = () => {
    setSearchParams({
      workOrder: "",
      serialNumber: "",
      station: "",
      model: "",
      dateFrom: "",
      dateTo: "",
      result: "",
    });
    setSearchResults([]);
    setIsSearched(false);
    setPage(0);
  };

  const handleViewLog = (record: LogRecord) => {
    setSelectedLog(record);
    setLogDialogOpen(true);
  };

  const handleDownloadLog = (record: LogRecord) => {
    const blob = new Blob([record.logContent], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = record.logFileName;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedResults = searchResults.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const stations = ["FA_FT01", "FA_FT02", "ICT_01", "ICT_02", "FINAL_01"];
  const models = ["WA3", "WA4", "CH5", "DH6"];

  return (
    <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
      {/* 頁面標題 */}
      <Box mb={4}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
          🔍 LOG 查詢系統
        </Typography>
        <Typography variant="body1" color="text.secondary">
          強大的製造測試日誌查詢與分析工具
        </Typography>
      </Box>

      {/* 搜尋條件區 */}
      <Card variant="outlined" sx={{ mb: 4 }}>
        <CardContent>
          <Box mb={2}>
            <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <FilterListIcon />
              搜尋條件
            </Typography>
          </Box>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <TextField
                fullWidth
                label="工單號碼"
                value={searchParams.workOrder}
                onChange={handleInputChange("workOrder")}
                placeholder="e.g., 6210018423-00010"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <TextField
                fullWidth
                label="序號"
                value={searchParams.serialNumber}
                onChange={handleInputChange("serialNumber")}
                placeholder="e.g., CH510339000056304"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <FormControl fullWidth>
                <InputLabel>站別</InputLabel>
                <Select
                  value={searchParams.station}
                  label="站別"
                  onChange={handleSelectChange("station")}
                >
                  <MenuItem value="">全部站別</MenuItem>
                  {stations.map(station => (
                    <MenuItem key={station} value={station}>{station}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <FormControl fullWidth>
                <InputLabel>機種</InputLabel>
                <Select
                  value={searchParams.model}
                  label="機種"
                  onChange={handleSelectChange("model")}
                >
                  <MenuItem value="">全部機種</MenuItem>
                  {models.map(model => (
                    <MenuItem key={model} value={model}>{model}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <FormControl fullWidth>
                <InputLabel>測試結果</InputLabel>
                <Select
                  value={searchParams.result}
                  label="測試結果"
                  onChange={handleSelectChange("result")}
                >
                  <MenuItem value="">全部結果</MenuItem>
                  <MenuItem value="PASS">PASS</MenuItem>
                  <MenuItem value="FAIL">FAIL</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <TextField
                fullWidth
                type="date"
                label="開始日期"
                value={searchParams.dateFrom}
                onChange={handleInputChange("dateFrom")}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <TextField
                fullWidth
                type="date"
                label="結束日期"
                value={searchParams.dateTo}
                onChange={handleInputChange("dateTo")}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          <Box display="flex" gap={2} justifyContent="flex-end">
            <Button
              variant="outlined"
              startIcon={<ClearRoundedIcon />}
              onClick={handleClear}
            >
              清除條件
            </Button>
            <Button
              variant="contained"
              startIcon={<SearchRoundedIcon />}
              onClick={handleSearch}
            >
              開始搜尋
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* 搜尋結果區 */}
      <Card variant="outlined">
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6" gutterBottom>
              搜尋結果
            </Typography>
            {isSearched && (
              <Chip
                label={`找到 ${searchResults.length} 筆記錄`}
                color="primary"
                variant="outlined"
              />
            )}
          </Box>

          {!isSearched ? (
            <Box textAlign="center" py={6}>
              <FileOpenIcon sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
              <Typography variant="body1" color="text.secondary">
                請設定搜尋條件後點擊「開始搜尋」按鈕
              </Typography>
            </Box>
          ) : searchResults.length === 0 ? (
            <Box textAlign="center" py={6}>
              <Typography variant="body1" color="text.secondary">
                沒有找到符合條件的 LOG 檔案
              </Typography>
            </Box>
          ) : (
            <>
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>工單號碼</TableCell>
                      <TableCell>序號</TableCell>
                      <TableCell>站別</TableCell>
                      <TableCell>機種</TableCell>
                      <TableCell>測試時間</TableCell>
                      <TableCell>結果</TableCell>
                      <TableCell>測試員</TableCell>
                      <TableCell align="center">操作</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedResults.map((record) => (
                      <TableRow key={record.id} hover>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontFamily: "monospace", fontSize: "0.75rem" }}>
                            {record.workOrder}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontFamily: "monospace", fontSize: "0.75rem" }}>
                            {record.serialNumber}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip label={record.station} color="primary" variant="outlined" size="small" />
                        </TableCell>
                        <TableCell>
                          <Chip label={record.model} color="secondary" size="small" />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontSize: "0.75rem" }}>
                            {record.testTime}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={record.result}
                            color={record.result === "PASS" ? "success" : "error"}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{record.tester}</Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Box display="flex" gap={1}>
                            <Tooltip title="查看 LOG">
                              <IconButton size="small" onClick={() => handleViewLog(record)}>
                                <VisibilityIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="下載 LOG">
                              <IconButton size="small" onClick={() => handleDownloadLog(record)}>
                                <DownloadIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <TablePagination
                component="div"
                count={searchResults.length}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[10, 25, 50]}
                labelRowsPerPage="每頁顯示:"
                labelDisplayedRows={({ from, to, count }) => `${from}-${to} / 共 ${count} 筆`}
              />
            </>
          )}
        </CardContent>
      </Card>

      {/* LOG 預覽對話框 */}
      <Dialog
        open={logDialogOpen}
        onClose={() => setLogDialogOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          LOG 檔案預覽
          {selectedLog && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              檔案: {selectedLog.logFileName}<br />
              序號: {selectedLog.serialNumber} | 時間: {selectedLog.testTime}
            </Typography>
          )}
        </DialogTitle>
        <DialogContent>
          <Box
            sx={{
              height: 500,
              backgroundColor: "grey.100",
              p: 2,
              borderRadius: 1,
              fontFamily: "monospace",
              fontSize: "0.75rem",
              overflow: "auto",
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <Typography component="pre" sx={{ whiteSpace: "pre-wrap" }}>
              {selectedLog?.logContent || ""}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLogDialogOpen(false)}>關閉</Button>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={() => selectedLog && handleDownloadLog(selectedLog)}
          >
            下載 LOG
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}