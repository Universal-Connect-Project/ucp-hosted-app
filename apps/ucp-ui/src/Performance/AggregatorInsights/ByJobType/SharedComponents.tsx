import React from "react";
import { TableCell, TableRow, TableRowProps } from "@mui/material";
import classNames from "classnames";
import styles from "./sharedComponents.module.css";

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
