import React, { ChangeEvent, useState } from "react";
import {
  AggregatorPerformanceByJobTypeResponse,
  useGetAggregatorPerformanceByJobTypeQuery,
} from "./api";
import TextField from "../../shared/components/Forms/TextField";
import {
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import styles from "./byJobType.module.css";
import {
  allJobTypeCombinations,
  supportsJobTypeMap,
} from "../../shared/constants/jobTypes";

const jobTypesCombinationsWithMoreThanOne = allJobTypeCombinations
  .filter((jobTypes) => jobTypes.length > 1)
  .map((jobTypes) => jobTypes.join("|"));

const RectangleDivider = ({ numberOfColumns }: { numberOfColumns: number }) => {
  return (
    <TableRow className={styles.rectangleDivider}>
      <TableCell colSpan={numberOfColumns} padding="none" />
    </TableRow>
  );
};

const JobTypePerformance = ({
  aggregatorsWithPerformanceByJobType,
  jobTypes,
}: {
  aggregatorsWithPerformanceByJobType?: AggregatorPerformanceByJobTypeResponse;
  jobTypes: string;
}) => {
  const jobTypesArray = jobTypes.split("|");
  const numberOfJobTypes = jobTypesArray.length;

  const rowLabel = `${numberOfJobTypes > 1 ? `(${numberOfJobTypes}) ` : ""} ${jobTypesArray.map((jobType) => supportsJobTypeMap[jobType].displayName).join(" + ")}`;

  return (
    <TableRow>
      <TableCell className={styles.halfTopAndBottomPadding}>
        {rowLabel}
      </TableCell>
      {aggregatorsWithPerformanceByJobType?.aggregators?.map((aggregator) => {
        const { avgDuration, avgSuccessRate } =
          aggregator.jobTypes?.[jobTypes] || {};

        return (
          <TableCell
            className={styles.halfTopAndBottomPadding}
            key={aggregator.id}
          >
            {`${avgSuccessRate || 0}% | ${(avgDuration || 0) / 1000}s`}
          </TableCell>
        );
      })}
    </TableRow>
  );
};

const SectionHeaderRow = ({
  numberOfColumns,
  title,
}: {
  numberOfColumns: number;
  title: string;
}) => {
  return (
    <>
      <RectangleDivider numberOfColumns={numberOfColumns} />
      <TableRow>
        <TableCell
          className={styles.halfTopAndBottomPadding}
          colSpan={numberOfColumns}
        >
          <Stack>
            <Typography variant="body1">{title}</Typography>
            <Typography
              className={styles.sectionHeaderCaption}
              variant="caption"
            >
              Success Rate (%), Speed (s)
            </Typography>
          </Stack>
        </TableCell>
      </TableRow>
    </>
  );
};

const ByJobType = () => {
  const thirtyDays = "30d";

  const timeFrameOptions = [
    {
      label: "Last 1 Day",
      value: "1d",
    },
    {
      label: "Last 7 Days",
      value: "1w",
    },
    {
      label: "Last 30 Days",
      value: thirtyDays,
    },
    {
      label: "Last 180 Days",
      value: "180d",
    },
    {
      label: "Last 365 Days",
      value: "1y",
    },
  ];

  const [timeFrame, setTimeFrame] = useState(thirtyDays);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setTimeFrame(event.target.value);
  };

  const { data: aggregatorsWithPerformanceByJobType } =
    useGetAggregatorPerformanceByJobTypeQuery({ timeFrame });

  const aggregators = aggregatorsWithPerformanceByJobType?.aggregators;

  const numberOfColumns = (aggregators?.length || 0) + 1;

  return (
    <>
      <TextField
        className={styles.timeFrameSelect}
        label="Time Frame"
        onChange={handleChange}
        select
        value={timeFrame}
      >
        {timeFrameOptions.map(({ label, value }) => (
          <MenuItem key={value} value={value}>
            {label}
          </MenuItem>
        ))}
      </TextField>
      <Paper>
        <TableContainer>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Aggregator Performance</TableCell>
                {aggregators?.map(({ displayName, id }) => (
                  <TableCell key={id}>{displayName}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>Overall Average Success Rate</TableCell>
                {aggregators?.map(({ avgSuccessRate, id }) => (
                  <TableCell key={id}>{`${avgSuccessRate || 0}%`}</TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell>Overall Average Speed</TableCell>
                {aggregators?.map(({ avgDuration, id }) => (
                  <TableCell
                    key={id}
                  >{`${(avgDuration || 0) / 1000}s`}</TableCell>
                ))}
              </TableRow>
              <SectionHeaderRow
                numberOfColumns={numberOfColumns}
                title="Performance by Single Job Type"
              />
              {Object.keys(supportsJobTypeMap).map((jobType) => (
                <JobTypePerformance
                  aggregatorsWithPerformanceByJobType={
                    aggregatorsWithPerformanceByJobType
                  }
                  jobTypes={jobType}
                  key={jobType}
                />
              ))}
              <SectionHeaderRow
                numberOfColumns={numberOfColumns}
                title="Performance by Combo Job Types"
              />
              {jobTypesCombinationsWithMoreThanOne.map((jobType) => (
                <JobTypePerformance
                  aggregatorsWithPerformanceByJobType={
                    aggregatorsWithPerformanceByJobType
                  }
                  jobTypes={jobType}
                  key={jobType}
                />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </>
  );
};

export default ByJobType;
