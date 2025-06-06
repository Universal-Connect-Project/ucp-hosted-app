import { Box, Stack, Tab, Tabs, Typography } from "@mui/material";
import React, { useState } from "react";
import ByJobType from "./ByJobType/ByJobType";
import styles from "./aggregatorInsights.module.css";

const byJobTypeTabValue = "byJobType";

export const BY_JOB_TYPE_TAB_TEXT = "BY JOB TYPE";

const AggregatorInsights = () => {
  const [tab] = useState(byJobTypeTabValue);

  return (
    <div className={styles.container}>
      <Stack spacing={3}>
        <Typography variant="h5">Aggregator Insights</Typography>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs value={tab}>
            <Tab label={BY_JOB_TYPE_TAB_TEXT} value={byJobTypeTabValue} />
          </Tabs>
        </Box>
      </Stack>
      <div className={styles.tabContent}>
        {tab === byJobTypeTabValue && <ByJobType />}
      </div>
    </div>
  );
};

export default AggregatorInsights;
