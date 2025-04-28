import { Box, Stack, Tab, Tabs, Typography } from "@mui/material";
import React, { useState } from "react";
import ByJobType from "./ByJobType";

const byJobTypeTabValue = "byJobType";

const AggregatorInsights = () => {
  const [tab] = useState(byJobTypeTabValue);

  return (
    <Stack spacing={3}>
      <Typography variant="h5">Aggregator Insights</Typography>
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs value={tab}>
          <Tab label="BY JOB TYPE" value={byJobTypeTabValue} />
        </Tabs>
      </Box>
      {tab === byJobTypeTabValue && <ByJobType />}
    </Stack>
  );
};

export default AggregatorInsights;
