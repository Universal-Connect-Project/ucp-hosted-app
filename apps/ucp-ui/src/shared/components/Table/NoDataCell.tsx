import React from "react";
import { TableCell } from "@mui/material";
import classNames from "classnames";
import { ReactNode } from "react";
import { TextSkeletonIfLoading } from "../Skeleton";
import styles from "./noDataCell.module.css";
import { NO_DATA_CELL_TEXT } from "./noDataCellConstants";

export const NoDataCell = ({
  children,
  className,
  hasData,
  isLoading,
}: {
  children: ReactNode;
  className?: string;
  hasData: boolean;
  isLoading: boolean;
}) => {
  return (
    <TableCell
      className={classNames(className, {
        [styles.noData]: !hasData,
      })}
    >
      <TextSkeletonIfLoading isLoading={isLoading}>
        <div>{!hasData ? NO_DATA_CELL_TEXT : children}</div>
      </TextSkeletonIfLoading>
    </TableCell>
  );
};
