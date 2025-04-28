import React from "react";
import PageContent from "../shared/components/PageContent";
import PageTitle from "../shared/components/PageTitle";
import AggregatorInsights from "./AggregatorInsights/AggregatorInsights";
import { Stack } from "@mui/material";

const Performance = () => {
  return (
    <PageContent>
      <Stack spacing={4}>
        <PageTitle>Performance</PageTitle>
        <AggregatorInsights />
      </Stack>
    </PageContent>
  );
};

export default Performance;
