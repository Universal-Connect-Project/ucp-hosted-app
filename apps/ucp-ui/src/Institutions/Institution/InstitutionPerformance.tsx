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
import {
  useGetInstitutionDurationGraphDataQuery,
  useGetInstitutionSuccessGraphDataQuery,
} from "./api";
import { SuccessRateTrendsChart } from "../../shared/components/SuccessRateTrendsChart";
import { DurationTrendsChart } from "../../shared/components/DurationTrendsChart";
import { JobTypesSelectFlexContainer } from "../../shared/components/Forms/JobTypesSelectFlexContainer";

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
        <JobTypesSelectFlexContainer>
          <JobTypesSelect onChange={handleJobTypesChange} value={jobTypes} />
        </JobTypesSelectFlexContainer>
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
