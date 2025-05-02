import React from "react";
import { AggregatorPerformanceByJobTypeResponse } from "../api";
import { CustomTableRow, NoDataCell, PaddingCell } from "./SharedComponents";
import classNames from "classnames";
import styles from "./jobTypePerformance.module.css";
import { supportsJobTypeMap } from "../../../shared/constants/jobTypes";
import { TableCell } from "@mui/material";

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
          <NoDataCell
            className={styles.performanceCell}
            hasData={!noData}
            key={aggregator.id}
          >
            {`${avgSuccessRate || 0}% | ${avgDuration || 0}s`}
          </NoDataCell>
        );
      })}
      <PaddingCell />
    </CustomTableRow>
  );
};

export default JobTypePerformance;
