import React, { ReactNode } from "react";
import { TableCell, TableRow, TableRowProps } from "@mui/material";
import classNames from "classnames";
import styles from "./sharedComponents.module.css";

export const CustomTableRow = ({ className, ...props }: TableRowProps) => (
  <TableRow {...props} className={classNames(styles.tableRow, className)} />
);

export const PaddingCell = () => (
  <TableCell className={styles.paddingCell} padding="none" />
);

export const NoDataCell = ({
  children,
  className,
  hasData,
}: {
  children: ReactNode;
  className?: string;
  hasData: boolean;
}) => {
  return (
    <TableCell
      className={classNames(className, {
        [styles.noData]: !hasData,
      })}
    >
      {!hasData ? "No data" : children}
    </TableCell>
  );
};
