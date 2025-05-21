import React from "react";
import { Aggregator, useGetAggregatorPerformanceByJobTypeQuery } from "../api";
import {
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
import {
  SkeletonIfLoading,
  TextSkeletonIfLoading,
} from "../../../shared/components/Skeleton";
import FetchError from "../../../shared/components/FetchError";
import {
  AGGREGATOR_PERFORMANCE_BY_JOB_TYPE_ERROR_TEXT,
  BY_JOB_TYPE_TABLE_TITLE,
} from "./constants";
import TimeFrameSelect, {
  useTimeFrameSelect,
} from "../../../shared/components/Forms/TimeFrameSelect";

const loadingAggregator = {
  displayName: "Test name",
  logo: "",
  avgSuccessRate: 50,
  avgDuration: 100,
};

const loadingAggregators = new Array(4).fill(0).map((current, index) => ({
  ...loadingAggregator,
  id: index,
})) as Aggregator[];

const OverallPerformanceCell = ({
  appendText,
  isLoading,
  value,
}: {
  appendText: string;
  isLoading: boolean;
  value: number | null;
}) => {
  const noData = value === null;

  return (
    <NoDataCell
      hasData={!noData}
      isLoading={isLoading}
    >{`${formatMaxTwoDecimals(value || 0)}${appendText}`}</NoDataCell>
  );
};

const ByJobType = () => {
  const { handleTimeFrameChange, timeFrame } = useTimeFrameSelect();

  const {
    data: aggregatorsWithPerformanceByJobType,
    isError,
    isFetching,
    refetch,
  } = useGetAggregatorPerformanceByJobTypeQuery({ timeFrame });

  const aggregators =
    isFetching && !aggregatorsWithPerformanceByJobType
      ? loadingAggregators
      : aggregatorsWithPerformanceByJobType?.aggregators;

  const numberOfPaddingCells = 2;
  const numberOfColumns = (aggregators?.length || 0) + 1 + numberOfPaddingCells;

  const { filteredJobTypeCombinations, selectedJobTypes, setSelectedJobTypes } =
    useJobTypeFilter();

  return (
    <>
      <TimeFrameSelect onChange={handleTimeFrameChange} value={timeFrame} />
      <Paper className={styles.tablePaper} variant="outlined">
        {isError ? (
          <FetchError
            description={AGGREGATOR_PERFORMANCE_BY_JOB_TYPE_ERROR_TEXT}
            refetch={() => void refetch()}
          />
        ) : (
          <TableContainer className={styles.tableContainer}>
            <Table stickyHeader>
              <TableHead>
                <TableRowWithPaddingCells>
                  <TableCell>{BY_JOB_TYPE_TABLE_TITLE}</TableCell>
                  {aggregators?.map(({ displayName, id, logo }) => (
                    <TableCell key={id}>
                      <div className={styles.aggregatorCell}>
                        <SkeletonIfLoading isLoading={isFetching}>
                          <div className={styles.aggregatorLogoContainer}>
                            <img src={logo} />
                          </div>
                        </SkeletonIfLoading>
                        <TextSkeletonIfLoading isLoading={isFetching}>
                          <div>{displayName}</div>
                        </TextSkeletonIfLoading>
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
                      isLoading={isFetching}
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
                      isLoading={isFetching}
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
                    aggregators={aggregators}
                    isLastRow={index === allJobTypes.length - 1}
                    isLoading={isFetching}
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
                    aggregators={aggregators}
                    isLastRow={index === filteredJobTypeCombinations.length - 1}
                    isLoading={isFetching}
                    jobTypes={jobType}
                    key={jobType}
                  />
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </>
  );
};

export default ByJobType;
