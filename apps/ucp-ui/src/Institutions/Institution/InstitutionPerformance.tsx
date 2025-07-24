import { Stack, Typography } from "@mui/material";
import React from "react";
import TimeFrameSelect, {
  useTimeFrameSelect,
} from "../../shared/components/Forms/TimeFrameSelect";
import AggregatorSelect, {
  useAggregatorSelect,
} from "../../shared/components/Forms/AggregatorSelect";
import JobTypesSelect, {
  useJobTypesSelect,
} from "../../shared/components/Forms/JobTypesSelect";
import jobTypesStyles from "../../shared/styles/performanceJobTypeFilter.module.css";
import {
  useGetInstitutionDurationGraphDataQuery,
  useGetInstitutionSuccessGraphDataQuery,
} from "./api";
import { SuccessRateTrendsChart } from "../../shared/components/SuccessRateTrendsChart";
import { DurationTrendsChart } from "../../shared/components/DurationTrendsChart";

export const InstitutionPerformance = ({
  institutionId,
}: {
  institutionId: string;
}) => {
  const { handleTimeFrameChange, timeFrame } = useTimeFrameSelect();
  const { aggregators, handleAggregatorsChange } = useAggregatorSelect();
  const { jobTypes, handleJobTypesChange } = useJobTypesSelect();

  const {
    data: successData,
    isError: isErrorSuccess,
    isFetching: isFetchingSuccess,
    refetch: refetchSuccess,
  } = useGetInstitutionSuccessGraphDataQuery(
    {
      aggregators,
      institutionId,
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
  } = useGetInstitutionDurationGraphDataQuery(
    {
      aggregators,
      institutionId,
      jobTypes,
      timeFrame,
    },
    { refetchOnMountOrArgChange: true },
  );

  return (
    <Stack spacing={2}>
      <Typography variant="overline">Performance</Typography>
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
        <DurationTrendsChart
          data={durationData}
          isError={isErrorDuration}
          isFetching={isFetchingDuration}
          refetch={() => void refetchDuration()}
          timeFrame={timeFrame}
        />
      </Stack>
    </Stack>
  );
};
