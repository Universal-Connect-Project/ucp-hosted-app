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
  TableRowProps,
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

const CustomTableRow = ({ className, ...props }: TableRowProps) => (
  <TableRow {...props} className={classNames(styles.tableRow, className)} />
);

const PaddingCell = () => (
  <TableCell className={styles.paddingCell} padding="none" />
);

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
  isLastRow,
  jobTypes,
}: {
  aggregatorsWithPerformanceByJobType?: AggregatorPerformanceByJobTypeResponse;
  isLastRow?: boolean;
  jobTypes: string;
}) => {
  const jobTypesArray = jobTypes.split("|");
  const numberOfJobTypes = jobTypesArray.length;

  const rowLabel = `${numberOfJobTypes > 1 ? `(${numberOfJobTypes}) ` : ""} ${jobTypesArray.map((jobType) => supportsJobTypeMap[jobType].displayName).join(" + ")}`;

  return (
    <CustomTableRow
      className={classNames(styles.performanceByJobTypeRow, {
        [styles.lastPerformanceDataRow]: isLastRow,
      })}
    >
      <PaddingCell />
      <TableCell>{rowLabel}</TableCell>
      {aggregatorsWithPerformanceByJobType?.aggregators?.map((aggregator) => {
        const { avgDuration, avgSuccessRate } =
          aggregator.jobTypes?.[jobTypes] || {};

        const noData =
          avgDuration === undefined && avgSuccessRate === undefined;

        return (
          <TableCell
            className={classNames(styles.performanceCell, {
              [styles.noData]: noData,
            })}
            key={aggregator.id}
          >
            {noData
              ? "No data"
              : `${avgSuccessRate || 0}% | ${avgDuration || 0}s`}
          </TableCell>
        );
      })}
      <PaddingCell />
    </CustomTableRow>
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
      <CustomTableRow>
        <TableCell
          className={styles.sectionHeaderRow}
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
      </CustomTableRow>
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

  const numberOfPaddingCells = 2;
  const numberOfColumns = (aggregators?.length || 0) + 1 + numberOfPaddingCells;

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
      <Paper className={styles.tablePaper} variant="outlined">
        <TableContainer className={styles.tableContainer}>
          <Table stickyHeader>
            <TableHead>
              <CustomTableRow>
                <PaddingCell />
                <TableCell>Aggregator Performance</TableCell>
                {aggregators?.map(({ displayName, id, logo }) => (
                  <TableCell key={id}>
                    <div className={styles.aggregatorCell}>
                      <img src={logo} />
                      {displayName}
                    </div>
                  </TableCell>
                ))}
                <PaddingCell />
              </CustomTableRow>
            </TableHead>
            <TableBody>
              <CustomTableRow>
                <PaddingCell />
                <TableCell>Overall Average Success Rate</TableCell>
                {aggregators?.map(({ avgSuccessRate, id }) => (
                  <OverallPerformanceCell
                    appendText="%"
                    key={id}
                    value={avgSuccessRate}
                  />
                ))}
                <PaddingCell />
              </CustomTableRow>
              <CustomTableRow>
                <PaddingCell />
                <TableCell>Overall Average Speed</TableCell>
                {aggregators?.map(({ avgDuration, id }) => (
                  <OverallPerformanceCell
                    appendText="s"
                    key={id}
                    value={avgDuration}
                  />
                ))}
                <PaddingCell />
              </CustomTableRow>
              <SectionHeaderRow
                numberOfColumns={numberOfColumns}
                title="Performance by Single Job Type"
              />
              {allJobTypes.map((jobType, index) => (
                <JobTypePerformance
                  aggregatorsWithPerformanceByJobType={
                    aggregatorsWithPerformanceByJobType
                  }
                  isLastRow={index === allJobTypes.length - 1}
                  jobTypes={jobType}
                  key={jobType}
                />
              ))}
              <SectionHeaderRow
                numberOfColumns={numberOfColumns}
                title="Performance by Combo Job Types"
              />
              {jobTypesCombinationsWithMoreThanOne.map((jobType, index) => (
                <JobTypePerformance
                  aggregatorsWithPerformanceByJobType={
                    aggregatorsWithPerformanceByJobType
                  }
                  isLastRow={
                    index === jobTypesCombinationsWithMoreThanOne.length - 1
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
