import React from "react";
import { Stack, Typography } from "@mui/material";
import TimeFrameSelect, {
  useTimeFrameSelect,
} from "../../shared/components/Forms/TimeFrameSelect";
import {
  useGetAggregatorDurationGraphDataQuery,
  useGetAggregatorSuccessGraphDataQuery,
} from "./api";
import { oneDayOption } from "../../shared/components/Forms/constants";
import TrendsChart from "./TrendsChart";

const Trends = () => {
  const { handleTimeFrameChange, timeFrame } = useTimeFrameSelect();

  const shouldUseHourlyTicks = timeFrame === oneDayOption.value;

  const { data: successData, isFetching: isFetchingSuccess } =
    useGetAggregatorSuccessGraphDataQuery({
      timeFrame,
    });

  const { data: durationData, isFetching: isFetchingDuration } =
    useGetAggregatorDurationGraphDataQuery({
      timeFrame,
    });

  return (
    <Stack spacing={3}>
      <Typography variant="h5">Trends</Typography>
      <Stack direction="column" spacing={2}>
        <TimeFrameSelect onChange={handleTimeFrameChange} value={timeFrame} />
      </Stack>
      <Stack direction="row" spacing={3}>
        <TrendsChart
          data={successData}
          isFetching={isFetchingSuccess}
          shouldUseHourlyTicks={shouldUseHourlyTicks}
          title="Average Success Rate"
          tooltipTitle="The percentage of connection attempts that are successful. All dates and times are in U.S. Eastern Time."
          valueMultiplier={100}
          valuePostfix="%"
          yAxisMax={1}
        />
        <TrendsChart
          data={durationData}
          isFetching={isFetchingDuration}
          shouldUseHourlyTicks={shouldUseHourlyTicks}
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
