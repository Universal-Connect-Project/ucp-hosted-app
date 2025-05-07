import React, { ReactNode } from "react";
import { TableCell, TableRow, TableRowProps } from "@mui/material";
import classNames from "classnames";
import styles from "./sharedComponents.module.css";
import { TextSkeletonIfLoading } from "../../../shared/components/Skeleton";

const PaddingCell = () => (
  <TableCell className={styles.paddingCell} padding="none" />
);

export const TableRowWithPaddingCells = ({
  className,
  children,
  ...props
}: TableRowProps) => (
  <TableRow {...props} className={classNames(styles.tableRow, className)}>
    <PaddingCell />
    {children}
    <PaddingCell />
  </TableRow>
);

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
        <div>{!hasData ? "No data" : children}</div>
      </TextSkeletonIfLoading>
    </TableCell>
  );
};
