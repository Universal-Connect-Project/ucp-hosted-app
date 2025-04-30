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
  allJobTypes,
  supportsJobTypeMap,
} from "../../shared/constants/jobTypes";
import classNames from "classnames";

const jobTypesCombinationsWithMoreThanOne = allJobTypeCombinations
  .filter((jobTypes) => jobTypes.length > 1)
  .map((jobTypes) => jobTypes.join("|"))
  .sort();

const RectangleDivider = ({ numberOfColumns }: { numberOfColumns: number }) => {
  return (
    <TableRow className={styles.rectangleDivider}>
      <TableCell colSpan={numberOfColumns} padding="none" />
    </TableRow>
  );
};

const OverallPerformanceCell = ({
  appendText,
  value,
}: {
  appendText: string;
  value: number | null;
}) => {
  const noData = value === null;

  return (
    <TableCell
      className={classNames({
        [styles.noData]: noData,
      })}
    >
      {noData ? "No data" : `${value}${appendText}`}
    </TableCell>
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

        const noData =
          avgDuration === undefined && avgSuccessRate === undefined;

        return (
          <TableCell
            className={classNames(
              styles.halfTopAndBottomPadding,
              styles.performanceCell,
              {
                [styles.noData]: noData,
              },
            )}
            key={aggregator.id}
          >
            {noData
              ? "No data"
              : `${avgSuccessRate || 0}% | ${avgDuration || 0}s`}
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
            <Typography variant="subtitle1">{title}</Typography>
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
      <Paper className={styles.tablePaper}>
        <TableContainer className={styles.tableContainer}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Aggregator Performance</TableCell>
                {aggregators?.map(({ displayName, id, logo }) => (
                  <TableCell key={id}>
                    <div className={styles.aggregatorCell}>
                      <img src={logo} />
                      {displayName}
                    </div>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>Overall Average Success Rate</TableCell>
                {aggregators?.map(({ avgSuccessRate, id }) => (
                  <OverallPerformanceCell
                    appendText="%"
                    key={id}
                    value={avgSuccessRate}
                  />
                ))}
              </TableRow>
              <TableRow>
                <TableCell>Overall Average Speed</TableCell>
                {aggregators?.map(({ avgDuration, id }) => (
                  <OverallPerformanceCell
                    appendText="s"
                    key={id}
                    value={avgDuration}
                  />
                ))}
              </TableRow>
              <SectionHeaderRow
                numberOfColumns={numberOfColumns}
                title="Performance by Single Job Type"
              />
              {allJobTypes.map((jobType) => (
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
