import React from "react";
import PageContent from "../shared/components/PageContent";
import PageTitle from "../shared/components/PageTitle";
import AggregatorInsights from "./AggregatorInsights/AggregatorInsights";
import { Stack } from "@mui/material";
import styles from "./performance.module.css";
import { PERFORMANCE_PAGE_TITLE } from "./constants";
import Trends from "./Trends/Trends";

const Performance = () => {
  return (
    <PageContent>
      <Stack className={styles.stack} spacing={4}>
        <PageTitle>{PERFORMANCE_PAGE_TITLE}</PageTitle>
        <Trends />
        <AggregatorInsights />
      </Stack>
    </PageContent>
  );
};

export default Performance;
