import React from "react";
import { AggregatorGraphMetricsResponse } from "@repo/shared-utils";
import TrendsChart from "./TrendsChart";
import { SUCCESS_RATE_TRENDS_CHART_TITLE } from "./successRateTrendsChartConsts";

export const SuccessRateTrendsChart = ({
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
    timeFrame={timeFrame}
    title={SUCCESS_RATE_TRENDS_CHART_TITLE}
    tooltipTitle="The percentage of connection attempts that are successful. All dates and times are in U.S. Eastern Time."
    valueMultiplier={100}
    valuePostfix="%"
    yAxisMax={1}
  />
);
