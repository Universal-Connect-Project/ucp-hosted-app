import React from "react";
import {
  TableContainer as MuiTableContainer,
  TableContainerOwnProps,
} from "@mui/material";
import styles from "./tableContainer.module.css";

interface TableContainerProps extends TableContainerOwnProps {
  children: React.ReactNode;
  maxHeight: number;
}

export const TableContainer = React.forwardRef<
  HTMLDivElement,
  TableContainerProps
>(({ children, maxHeight, ...rest }, ref) => {
  return (
    <MuiTableContainer
      ref={ref}
      className={styles.tableContainer}
      sx={{ height: maxHeight, maxHeight }}
      {...rest}
    >
      {children}
    </MuiTableContainer>
  );
});

TableContainer.displayName = "TableContainer";
