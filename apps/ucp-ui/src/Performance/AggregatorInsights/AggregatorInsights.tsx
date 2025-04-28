import { Box, Stack, Tab, Tabs, Typography } from "@mui/material";
import React, { useState } from "react";
import { useGetAggregatorPerformanceByJobTypeQuery } from "./api";

const AggregatorInsights = () => {
  const [tab, setTab] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
  };

  useGetAggregatorPerformanceByJobTypeQuery();

  return (
    <Stack spacing={3}>
      <Typography variant="h5">Aggregator Insights</Typography>
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs onChange={handleTabChange} value={tab}>
          <Tab label="BY JOB TYPE" />
        </Tabs>
      </Box>
    </Stack>
  );
};

export default AggregatorInsights;
