import React from "react";
import { Aggregator } from "../api";
import { TableRowWithPaddingCells, NoDataCell } from "./SharedComponents";
import classNames from "classnames";
import styles from "./jobTypePerformance.module.css";
import { supportsJobTypeMap } from "../../../shared/constants/jobTypes";
import { TableCell } from "@mui/material";
import { formatMaxTwoDecimals } from "../../../shared/utils/format";

const JobTypePerformance = ({
  aggregators,
  isLastRow,
  isLoading,
  jobTypes,
}: {
  aggregators?: Aggregator[];
  isLastRow?: boolean;
  isLoading: boolean;
  jobTypes: string;
}) => {
  const jobTypesArray = jobTypes.split("|");
  const numberOfJobTypes = jobTypesArray.length;

  const rowLabel = `${numberOfJobTypes > 1 ? `(${numberOfJobTypes}) ` : ""} ${jobTypesArray.map((jobType) => supportsJobTypeMap[jobType].displayName).join(" + ")}`;

  return (
    <TableRowWithPaddingCells
      className={classNames(styles.performanceByJobTypeRow, {
        [styles.lastPerformanceDataRow]: isLastRow,
      })}
    >
      <TableCell>{rowLabel}</TableCell>
      {aggregators?.map((aggregator) => {
        const { avgDuration, avgSuccessRate } =
          aggregator.jobTypes?.[jobTypes] || {};
        const noData =
          avgDuration === undefined && avgSuccessRate === undefined;
        return (
          <NoDataCell
            className={styles.performanceCell}
            hasData={!noData}
            isLoading={isLoading}
            key={aggregator.id}
          >
            {`${formatMaxTwoDecimals(avgSuccessRate) || 0}% | ${formatMaxTwoDecimals(avgDuration) || 0}s`}
          </NoDataCell>
        );
      })}
    </TableRowWithPaddingCells>
  );
};

export default JobTypePerformance;
