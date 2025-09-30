import * as React from "react";
import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import CustomizedDataGrid from "../../dashboard/components/CustomizedDataGrid";
import QuickFilters, { FilterOptions } from "../../components/QuickFilters";
import { useLanguage } from "../../contexts/LanguageContext";

export default function TestRecords() {
  const { t } = useLanguage();
  const [filters, setFilters] = useState<FilterOptions>({});

  // 模擬站別和機種數據
  const stations = ["FA_FT01", "FA_FT02", "ICT_01", "ICT_02", "FINAL_01"];
  const models = ["WA3", "WA4", "CH5", "DH6"];

  const handleFilterChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
    // 這裡可以將篩選條件傳遞給 CustomizedDataGrid 或處理數據篩選邏輯
    console.log('Applied filters:', newFilters);
  };

  return (
    <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
      <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
        {t('test.records.title')}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {t('test.records.desc')}
      </Typography>

      {/* 快速篩選組件 */}
      <QuickFilters
        onFilterChange={handleFilterChange}
        stations={stations}
        models={models}
        showAdvanced={true}
      />

      <Grid container spacing={2}>
        <Grid size={12}>
          <CustomizedDataGrid />
        </Grid>
      </Grid>
    </Box>
  );
}