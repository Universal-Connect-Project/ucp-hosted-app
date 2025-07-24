import React from "react";
import { Stack, Typography } from "@mui/material";
import TimeFrameSelect, {
  useTimeFrameSelect,
} from "../../shared/components/Forms/TimeFrameSelect";
import {
  useGetAggregatorDurationGraphDataQuery,
  useGetAggregatorSuccessGraphDataQuery,
} from "./api";
import TrendsChart from "../../shared/components/TrendsChart";
import AggregatorSelect, {
  useAggregatorSelect,
} from "../../shared/components/Forms/AggregatorSelect";
import JobTypesSelect, {
  useJobTypesSelect,
} from "../../shared/components/Forms/JobTypesSelect";
import jobTypesStyles from "../../shared/styles/performanceJobTypeFilter.module.css";
import { SuccessRateTrendsChart } from "../../shared/components/SuccessRateTrendsChart";

const Trends = () => {
  const { handleTimeFrameChange, timeFrame } = useTimeFrameSelect();
  const { aggregators, handleAggregatorsChange } = useAggregatorSelect();
  const { jobTypes, handleJobTypesChange } = useJobTypesSelect();

  const {
    data: successData,
    isError: isErrorSuccess,
    isFetching: isFetchingSuccess,
    refetch: refetchSuccess,
  } = useGetAggregatorSuccessGraphDataQuery(
    {
      aggregators,
      jobTypes,
      timeFrame,
    },
    { refetchOnMountOrArgChange: true },
  );

  const {
    data: durationData,
    isError: isErrorDuration,
    isFetching: isFetchingDuration,
    refetch: refetchDuration,
  } = useGetAggregatorDurationGraphDataQuery(
    {
      aggregators,
      jobTypes,
      timeFrame,
    },
    { refetchOnMountOrArgChange: true },
  );

  return (
    <Stack spacing={3}>
      <Typography variant="h5">Trends</Typography>
      <Stack alignItems="flex-end" direction="row" spacing={2}>
        <TimeFrameSelect onChange={handleTimeFrameChange} value={timeFrame} />
        <AggregatorSelect
          onChange={handleAggregatorsChange}
          value={aggregators}
        />
        <div className={jobTypesStyles.jobTypeSelectRelativeContainer}>
          <div className={jobTypesStyles.jobTypeSelectAbsoluteContainer}>
            <JobTypesSelect
              className={jobTypesStyles.jobTypeSelect}
              onChange={handleJobTypesChange}
              value={jobTypes}
            />
          </div>
        </div>
      </Stack>
      <Stack direction="row" spacing={3}>
        <SuccessRateTrendsChart
          data={successData}
          isError={isErrorSuccess}
          isFetching={isFetchingSuccess}
          refetch={() => void refetchSuccess()}
          timeFrame={timeFrame}
        />
        <TrendsChart
          data={durationData}
          isError={isErrorDuration}
          isFetching={isFetchingDuration}
          refetch={() => void refetchDuration()}
          shouldReverseYAxis
          timeFrame={timeFrame}
          title="Average Time To Connect"
          tooltipTitle="The average time (in seconds) it takes to make a connection. All dates and times are in U.S. Eastern Time."
          valueMultiplier={1 / 1000}
          valuePostfix="s"
        />
      </Stack>
    </Stack>
  );
};

export default Trends;
