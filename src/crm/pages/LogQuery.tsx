import * as React from "react";
import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import ClearRoundedIcon from "@mui/icons-material/ClearRounded";
import QuickFilters, { FilterOptions } from "../../components/QuickFilters";
import { useLanguage } from "../../contexts/LanguageContext";

export default function LogQuery() {
  const { t } = useLanguage();
  const [searchParams, setSearchParams] = React.useState({
    workOrder: "",
    serialNumber: "",
    station: "",
    model: "",
    dateFrom: "",
    dateTo: "",
  });
  const [quickFilters, setQuickFilters] = useState<FilterOptions>({});

  // 模擬站別和機種數據
  const stations = ["FA_FT01", "FA_FT02", "ICT_01", "ICT_02", "FINAL_01"];
  const models = ["WA3", "WA4", "CH5", "DH6"];

  const handleInputChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchParams(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleQuickFilterChange = (filters: FilterOptions) => {
    setQuickFilters(filters);
    // 將快速篩選結果自動更新到搜尋參數
    const updatedParams = { ...searchParams };

    if (filters.station && filters.station !== 'all') {
      updatedParams.station = filters.station;
    }
    if (filters.model && filters.model !== 'all') {
      updatedParams.model = filters.model;
    }

    setSearchParams(updatedParams);
    console.log("Quick filters applied:", filters);
  };

  const handleSearch = () => {
    // TODO: Implement search functionality
    const combinedParams = {
      ...searchParams,
      quickFilters
    };
    console.log("Searching with params:", combinedParams);
  };

  const handleClear = () => {
    setSearchParams({
      workOrder: "",
      serialNumber: "",
      station: "",
      model: "",
      dateFrom: "",
      dateTo: "",
    });
    setQuickFilters({});
  };

  return (
    <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
      <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
        {t('log.query.title')}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {t('log.query.desc')}
      </Typography>

      {/* 快速篩選組件 */}
      <QuickFilters
        onFilterChange={handleQuickFilterChange}
        stations={stations}
        models={models}
        showAdvanced={true}
      />

      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <TextField
                fullWidth
                label={t('work.order')}
                value={searchParams.workOrder}
                onChange={handleInputChange("workOrder")}
                placeholder="e.g., 6210018423-00010"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <TextField
                fullWidth
                label={t('serial.number')}
                value={searchParams.serialNumber}
                onChange={handleInputChange("serialNumber")}
                placeholder="e.g., CH510339000056304"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <TextField
                fullWidth
                label={t('station')}
                value={searchParams.station}
                onChange={handleInputChange("station")}
                placeholder="e.g., 36_FA_FT01"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <TextField
                fullWidth
                label={t('model')}
                value={searchParams.model}
                onChange={handleInputChange("model")}
                placeholder="e.g., WA3"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <TextField
                fullWidth
                type="date"
                label={t('date.from')}
                value={searchParams.dateFrom}
                onChange={handleInputChange("dateFrom")}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <TextField
                fullWidth
                type="date"
                label={t('date.to')}
                value={searchParams.dateTo}
                onChange={handleInputChange("dateTo")}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid size={12}>
              <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
                <Button
                  variant="outlined"
                  startIcon={<ClearRoundedIcon />}
                  onClick={handleClear}
                >
                  {t('clear')}
                </Button>
                <Button
                  variant="contained"
                  startIcon={<SearchRoundedIcon />}
                  onClick={handleSearch}
                >
                  {t('search')}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card variant="outlined">
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {t('search.results')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('no.results')}
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}