import React from "react";
import { AggregatorGraphMetricsResponse } from "@repo/shared-utils";
import TrendsChart from "./TrendsChart";

export const DurationTrendsChart = ({
  data,
  isError,
  isFetching,
  refetch,
  timeFrame,
}: {
  data: AggregatorGraphMetricsResponse | undefined;
  isError: boolean;
  isFetching: boolean;
  refetch: () => void;
  timeFrame: string;
}) => (
  <TrendsChart
    data={data}
    isError={isError}
    isFetching={isFetching}
    refetch={() => void refetch()}
    shouldReverseYAxis
    timeFrame={timeFrame}
    title="Average Time To Connect"
    tooltipTitle="The average time (in seconds) it takes to make a connection. All dates and times are in U.S. Eastern Time."
    valueMultiplier={1 / 1000}
    valuePostfix="s"
  />
);
