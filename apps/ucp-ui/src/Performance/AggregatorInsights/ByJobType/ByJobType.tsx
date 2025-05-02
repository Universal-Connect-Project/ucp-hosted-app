import React, { ChangeEvent, useState } from "react";
import { useGetAggregatorPerformanceByJobTypeQuery } from "../api";
import TextField from "../../../shared/components/Forms/TextField";
import {
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
} from "@mui/material";
import styles from "./byJobType.module.css";
import {
  allJobTypeCombinations,
  allJobTypes,
} from "../../../shared/constants/jobTypes";
import { CustomTableRow, NoDataCell, PaddingCell } from "./SharedComponents";
import JobTypePerformance from "./JobTypePerformance";
import SectionHeaderRow from "./SectionHeaderRow";

const jobTypesCombinationsWithMoreThanOne = allJobTypeCombinations
  .filter((jobTypes) => jobTypes.length > 1)
  .map((jobTypes) => jobTypes.join("|"))
  .sort();

const OverallPerformanceCell = ({
  appendText,
  value,
}: {
  appendText: string;
  value: number | null;
}) => {
  const noData = value === null;

  return <NoDataCell hasData={!noData}>{`${value}${appendText}`}</NoDataCell>;
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
