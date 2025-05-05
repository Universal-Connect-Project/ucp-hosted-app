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
import { allJobTypes } from "../../../shared/constants/jobTypes";
import { TableRowWithPaddingCells, NoDataCell } from "./SharedComponents";
import JobTypePerformance from "./JobTypePerformance";
import SectionHeaderRow from "./SectionHeaderRow";
import JobTypeFilter, { useJobTypeFilter } from "./JobTypeFilter";
import { formatMaxTwoDecimals } from "../../../shared/utils/format";

const OverallPerformanceCell = ({
  appendText,
  value,
}: {
  appendText: string;
  value: number | null;
}) => {
  const noData = value === null;

  return (
    <NoDataCell
      hasData={!noData}
    >{`${formatMaxTwoDecimals(value || 0)}${appendText}`}</NoDataCell>
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

  const { filteredJobTypeCombinations, selectedJobTypes, setSelectedJobTypes } =
    useJobTypeFilter();

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
              <TableRowWithPaddingCells>
                <TableCell>Aggregator Performance</TableCell>
                {aggregators?.map(({ displayName, id, logo }) => (
                  <TableCell key={id}>
                    <div className={styles.aggregatorCell}>
                      <img src={logo} />
                      {displayName}
                    </div>
                  </TableCell>
                ))}
              </TableRowWithPaddingCells>
            </TableHead>
            <TableBody>
              <TableRowWithPaddingCells>
                <TableCell>Overall Average Success Rate</TableCell>
                {aggregators?.map(({ avgSuccessRate, id }) => (
                  <OverallPerformanceCell
                    appendText="%"
                    key={id}
                    value={avgSuccessRate}
                  />
                ))}
              </TableRowWithPaddingCells>
              <TableRowWithPaddingCells>
                <TableCell>Overall Average Speed</TableCell>
                {aggregators?.map(({ avgDuration, id }) => (
                  <OverallPerformanceCell
                    appendText="s"
                    key={id}
                    value={avgDuration}
                  />
                ))}
              </TableRowWithPaddingCells>
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
              >
                <JobTypeFilter
                  selectedJobTypes={selectedJobTypes}
                  setSelectedJobTypes={setSelectedJobTypes}
                />
              </SectionHeaderRow>
              {filteredJobTypeCombinations.map((jobType, index) => (
                <JobTypePerformance
                  aggregatorsWithPerformanceByJobType={
                    aggregatorsWithPerformanceByJobType
                  }
                  isLastRow={index === filteredJobTypeCombinations.length - 1}
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
