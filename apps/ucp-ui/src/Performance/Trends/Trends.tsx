import React from "react";
import { Stack, Typography } from "@mui/material";
import TimeFrameSelect, {
  useTimeFrameSelect,
} from "../../shared/components/Forms/TimeFrameSelect";
import {
  useGetAggregatorDurationGraphDataQuery,
  useGetAggregatorSuccessGraphDataQuery,
} from "./api";
import TrendsChart from "./TrendsChart";
import AggregatorSelect, {
  useAggregatorSelect,
} from "../../shared/components/Forms/AggregatorSelect";

const Trends = () => {
  const { handleTimeFrameChange, timeFrame } = useTimeFrameSelect();
  const { aggregators, handleAggregatorsChange } = useAggregatorSelect();

  const {
    data: successData,
    isError: isErrorSuccess,
    isFetching: isFetchingSuccess,
    refetch: refetchSuccess,
  } = useGetAggregatorSuccessGraphDataQuery({
    aggregators,
    timeFrame,
  });

  const {
    data: durationData,
    isError: isErrorDuration,
    isFetching: isFetchingDuration,
    refetch: refetchDuration,
  } = useGetAggregatorDurationGraphDataQuery({
    aggregators,
    timeFrame,
  });

  return (
    <Stack spacing={3}>
      <Typography variant="h5">Trends</Typography>
      <Stack direction="row" spacing={2}>
        <AggregatorSelect
          onChange={handleAggregatorsChange}
          value={aggregators}
        />
        <TimeFrameSelect onChange={handleTimeFrameChange} value={timeFrame} />
      </Stack>
      <Stack direction="row" spacing={3}>
        <TrendsChart
          data={successData}
          isError={isErrorSuccess}
          isFetching={isFetchingSuccess}
          refetch={() => void refetchSuccess()}
          timeFrame={timeFrame}
          title="Average Success Rate"
          tooltipTitle="The percentage of connection attempts that are successful. All dates and times are in U.S. Eastern Time."
          valueMultiplier={100}
          valuePostfix="%"
          yAxisMax={1}
        />
        <TrendsChart
          data={durationData}
          isError={isErrorDuration}
          isFetching={isFetchingDuration}
          refetch={() => void refetchDuration()}
          timeFrame={timeFrame}
          title="Average Speed"
          tooltipTitle="The average time (in seconds) it takes make a connection. All dates and times are in U.S. Eastern Time."
          valueMultiplier={1 / 1000}
          valuePostfix="s"
        />
      </Stack>
    </Stack>
  );
};

export default Trends;
