import * as React from "react";
import { useState, useMemo, useCallback } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Grid from "@mui/material/Grid";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import { useTheme } from "@mui/material/styles";
import {
  DataGrid,
  GridToolbarContainer,
  GridToolbarExport,
  GridToolbarFilterButton,
  GridToolbarDensitySelector,
  GridToolbarColumnsButton,
  GridColDef,
  GridRowsProp,
} from "@mui/x-data-grid";
import RefreshIcon from "@mui/icons-material/Refresh";
import DownloadIcon from "@mui/icons-material/Download";
import VisibilityIcon from "@mui/icons-material/Visibility";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";

// 模擬的測試數據
const generateMockData = (): GridRowsProp => {
  const stations = ["FA_FT01", "FA_FT02", "ICT_01", "ICT_02", "FINAL_01"];
  const models = ["WA3", "WA4", "CH5", "DH6"];
  const results = ["PASS", "FAIL"];
  const data: GridRowsProp = [];

  for (let i = 0; i < 100; i++) {
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 30));
    const serial = `CH${Math.random().toString().substr(2, 12)}`;
    const workOrder = `621001${Math.random().toString().substr(2, 8)}`;

    data.push({
      id: `${serial}-${i}`,
      serial,
      station: stations[Math.floor(Math.random() * stations.length)],
      model: models[Math.floor(Math.random() * models.length)],
      result: Math.random() > 0.15 ? "PASS" : "FAIL", // 85% pass rate
      datetime: date.toISOString().replace("T", " ").substr(0, 19),
      date: date.toISOString().substr(0, 10),
      time: date.toTimeString().substr(0, 8),
      workOrder,
      Tester: `Test${Math.floor(Math.random() * 99) + 1}`,
      FN: `${Math.floor(Math.random() * 9) + 1}-${Math.floor(Math.random() * 9) + 1}`,
      Items: [],
    });
  }

  return data.sort((a, b) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime());
};

// 自定義工具欄
interface CustomToolbarProps {
  onRefresh: () => void;
  onExport: () => void;
}

function CustomToolbar({ onRefresh, onExport }: CustomToolbarProps) {
  return (
    <GridToolbarContainer>
      <GridToolbarColumnsButton />
      <GridToolbarFilterButton />
      <GridToolbarDensitySelector />
      <GridToolbarExport />
      <Button
        startIcon={<RefreshIcon />}
        onClick={onRefresh}
        size="small"
      >
        重新整理
      </Button>
      <Button
        startIcon={<DownloadIcon />}
        onClick={onExport}
        size="small"
      >
        匯出資料
      </Button>
    </GridToolbarContainer>
  );
}

interface MesRecord {
  id: string;
  serial: string;
  station: string;
  model: string;
  result: "PASS" | "FAIL";
  datetime: string;
  date: string;
  time: string;
  workOrder: string;
  Tester: string;
  FN: string;
  Items: any[];
}

export default function MesEnhancedTable() {
  const theme = useTheme();
  const [searchText, setSearchText] = useState("");
  const [resultFilter, setResultFilter] = useState("ALL");
  const [stationFilter, setStationFilter] = useState("ALL");
  const [modelFilter, setModelFilter] = useState("ALL");
  const [pageSize, setPageSize] = useState(25);
  const [logDialogOpen, setLogDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<MesRecord | null>(null);

  // 模擬數據
  const mockData = useMemo(() => generateMockData(), []);

  // 處理搜尋篩選
  const filteredData = useMemo(() => {
    let filtered = mockData;

    // 文字搜尋
    if (searchText.trim()) {
      filtered = filtered.filter(record =>
        Object.values(record).some(value =>
          String(value).toLowerCase().includes(searchText.toLowerCase())
        )
      );
    }

    // 結果篩選
    if (resultFilter !== "ALL") {
      filtered = filtered.filter(record => record.result === resultFilter);
    }

    // 站別篩選
    if (stationFilter !== "ALL") {
      filtered = filtered.filter(record => record.station === stationFilter);
    }

    // 機種篩選
    if (modelFilter !== "ALL") {
      filtered = filtered.filter(record => record.model === modelFilter);
    }

    return filtered;
  }, [mockData, searchText, resultFilter, stationFilter, modelFilter]);

  // 準備 DataGrid 的列定義
  const columns: GridColDef[] = useMemo(() => [
    {
      field: "serial",
      headerName: "序號",
      flex: 1,
      minWidth: 120,
      renderCell: (params) => (
        <Typography
          variant="body2"
          sx={{
            fontFamily: "monospace",
            backgroundColor: "grey.100",
            px: 1,
            py: 0.5,
            borderRadius: 0.5,
            fontSize: "0.75rem"
          }}
        >
          {params.value}
        </Typography>
      ),
    },
    {
      field: "result",
      headerName: "結果",
      width: 100,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={params.value === "PASS" ? "success" : "error"}
          size="small"
          variant={params.value === "PASS" ? "filled" : "outlined"}
        />
      ),
    },
    {
      field: "station",
      headerName: "站別",
      width: 110,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color="primary"
          variant="outlined"
          size="small"
        />
      ),
    },
    {
      field: "model",
      headerName: "機種",
      width: 80,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color="secondary"
          size="small"
        />
      ),
    },
    {
      field: "datetime",
      headerName: "測試時間",
      width: 160,
      renderCell: (params) => (
        <Typography
          variant="body2"
          sx={{
            fontFamily: "monospace",
            color: "text.secondary",
            fontSize: "0.75rem"
          }}
        >
          {params.value}
        </Typography>
      ),
    },
    {
      field: "workOrder",
      headerName: "工單號碼",
      flex: 1,
      minWidth: 120,
      renderCell: (params) => (
        <Typography
          variant="body2"
          sx={{
            fontFamily: "monospace",
            color: "text.secondary",
            fontSize: "0.75rem"
          }}
        >
          {params.value}
        </Typography>
      ),
    },
    {
      field: "FN",
      headerName: "治具編號",
      width: 90,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color="warning"
          variant="outlined"
          size="small"
          sx={{ fontSize: "0.7rem" }}
        />
      ),
    },
    {
      field: "Tester",
      headerName: "測試員",
      width: 80,
    },
    {
      field: "actions",
      headerName: "操作",
      width: 100,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Box>
          <Tooltip title="查看 LOG">
            <IconButton
              size="small"
              onClick={() => handleViewLog(params.row as MesRecord)}
              color="primary"
            >
              <VisibilityIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ], []);

  // 處理 LOG 查看
  const handleViewLog = useCallback((record: MesRecord) => {
    setSelectedRecord(record);
    setLogDialogOpen(true);
  }, []);

  // 重置篩選
  const handleReset = useCallback(() => {
    setSearchText("");
    setResultFilter("ALL");
    setStationFilter("ALL");
    setModelFilter("ALL");
  }, []);

  // 處理匯出
  const handleExport = useCallback(() => {
    console.log("Export triggered");
  }, []);

  // 處理重新整理
  const handleRefresh = useCallback(() => {
    window.location.reload();
  }, []);

  const stations = Array.from(new Set(mockData.map(record => record.station)));
  const models = Array.from(new Set(mockData.map(record => record.model)));

  return (
    <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
      {/* 頁面標題 */}
      <Box mb={3}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
          📋 測試數據表格
        </Typography>
        <Typography variant="body1" color="text.secondary">
          現代化數據表格檢視與管理系統
        </Typography>
      </Box>

      {/* 篩選控制區 */}
      <Paper elevation={1} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Box mb={2}>
          <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <FilterListIcon />
            數據篩選
          </Typography>
        </Box>

        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="搜尋序號、工單、站別..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: "action.active" }} />,
              }}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel>結果篩選</InputLabel>
              <Select
                value={resultFilter}
                label="結果篩選"
                onChange={(e) => setResultFilter(e.target.value)}
              >
                <MenuItem value="ALL">全部結果</MenuItem>
                <MenuItem value="PASS">僅 PASS</MenuItem>
                <MenuItem value="FAIL">僅 FAIL</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel>站別</InputLabel>
              <Select
                value={stationFilter}
                label="站別"
                onChange={(e) => setStationFilter(e.target.value)}
              >
                <MenuItem value="ALL">全部站別</MenuItem>
                {stations.map(station => (
                  <MenuItem key={station} value={station}>{station}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel>機種</InputLabel>
              <Select
                value={modelFilter}
                label="機種"
                onChange={(e) => setModelFilter(e.target.value)}
              >
                <MenuItem value="ALL">全部機種</MenuItem>
                {models.map(model => (
                  <MenuItem key={model} value={model}>{model}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel>每頁顯示</InputLabel>
              <Select
                value={pageSize}
                label="每頁顯示"
                onChange={(e) => setPageSize(Number(e.target.value))}
              >
                <MenuItem value={10}>10 筆</MenuItem>
                <MenuItem value={25}>25 筆</MenuItem>
                <MenuItem value={50}>50 筆</MenuItem>
                <MenuItem value={100}>100 筆</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 1 }}>
            <Button
              fullWidth
              variant="outlined"
              onClick={handleReset}
            >
              重置
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* 主表格 */}
      <Paper elevation={1} sx={{ borderRadius: 2 }}>
        <Box sx={{ height: 600, width: "100%" }}>
          <DataGrid
            rows={filteredData}
            columns={columns}
            initialState={{
              pagination: {
                paginationModel: { pageSize: pageSize },
              },
            }}
            pageSizeOptions={[10, 25, 50, 100]}
            checkboxSelection
            disableRowSelectionOnClick
            slots={{
              toolbar: CustomToolbar,
            }}
            slotProps={{
              toolbar: {
                onRefresh: handleRefresh,
                onExport: handleExport,
              },
            }}
            sx={{
              border: "none",
              "& .MuiDataGrid-cell": {
                borderBottom: `1px solid ${theme.palette.divider}`,
              },
              "& .MuiDataGrid-columnHeaders": {
                backgroundColor: theme.palette.grey[50],
                borderBottom: `2px solid ${theme.palette.divider}`,
              },
              "& .MuiDataGrid-row:hover": {
                backgroundColor: theme.palette.action.hover,
              },
            }}
          />
        </Box>
      </Paper>

      {/* LOG 查看對話框 */}
      <Dialog
        open={logDialogOpen}
        onClose={() => setLogDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          LOG 檔案內容
          {selectedRecord && (
            <Typography variant="body2" color="text.secondary">
              序號: {selectedRecord.serial} | 時間: {selectedRecord.datetime}
            </Typography>
          )}
        </DialogTitle>
        <DialogContent>
          <Box
            sx={{
              height: 400,
              backgroundColor: "grey.100",
              p: 2,
              borderRadius: 1,
              fontFamily: "monospace",
              fontSize: "0.75rem",
              overflow: "auto",
            }}
          >
            <Typography component="pre">
              {selectedRecord ?
`LOG 檔案內容模擬...

測試記錄詳情:
序號: ${selectedRecord.serial}
站別: ${selectedRecord.station}
機種: ${selectedRecord.model}
結果: ${selectedRecord.result}
時間: ${selectedRecord.datetime}
工單: ${selectedRecord.workOrder}
測試員: ${selectedRecord.Tester}
治具編號: ${selectedRecord.FN}

測試項目:
[INFO] 開始測試流程...
[INFO] 檢查治具連線... OK
[INFO] 載入測試參數... OK
[${selectedRecord.result === "PASS" ? "PASS" : "FAIL"}] 主要測試項目
[INFO] 測試完成

詳細 LOG 內容將在實際系統中顯示...`
                : ""
              }
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLogDialogOpen(false)}>關閉</Button>
          <Button variant="contained" startIcon={<DownloadIcon />}>
            下載 LOG
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}