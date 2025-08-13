import { Box, Stack, Tab, Tabs, Typography } from "@mui/material";
import React, { useState } from "react";
import ByJobType from "./ByJobType/ByJobType";
import styles from "./aggregatorInsights.module.css";
import { ByInstitution } from "./ByInstitution/ByInstitution";
import { BY_JOB_TYPE_TAB_TEXT } from "./constants";

const byJobTypeTabValue = "byJobType";

const byInstitutionTabValue = "byInstitution";

export const BY_INSTITUTION_TAB_TEXT = "BY INSTITUTION";

const AggregatorInsights = () => {
  const [tab, setTab] = useState(byInstitutionTabValue);

  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    setTab(newValue);
  };

  return (
    <div className={styles.container}>
      <Stack spacing={3}>
        <Typography variant="h5">Aggregator Insights</Typography>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs onChange={handleTabChange} value={tab}>
            <Tab
              label={BY_INSTITUTION_TAB_TEXT}
              value={byInstitutionTabValue}
            />
            <Tab label={BY_JOB_TYPE_TAB_TEXT} value={byJobTypeTabValue} />
          </Tabs>
        </Box>
      </Stack>
      <div className={styles.tabContent}>
        {tab === byInstitutionTabValue && <ByInstitution />}
        {tab === byJobTypeTabValue && <ByJobType />}
      </div>
    </div>
  );
};

export default AggregatorInsights;
