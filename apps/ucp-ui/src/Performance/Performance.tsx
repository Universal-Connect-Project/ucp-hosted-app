import React from "react";
import PageContent from "../shared/components/PageContent";
import PageTitle from "../shared/components/PageTitle";
import AggregatorInsights from "./AggregatorInsights/AggregatorInsights";
import { Stack } from "@mui/material";
import styles from "./performance.module.css";

const Performance = () => {
  return (
    <PageContent shouldDisableVerticalOverflow>
      <Stack className={styles.stack} spacing={4}>
        <PageTitle>Performance</PageTitle>
        <AggregatorInsights />
      </Stack>
    </PageContent>
  );
};

export default Performance;
