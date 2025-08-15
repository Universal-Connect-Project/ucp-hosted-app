import React from "react";
import {
  TableContainer as MuiTableContainer,
  TableContainerOwnProps,
} from "@mui/material";
import styles from "./tableContainer.module.css";

interface TableContainerProps extends TableContainerOwnProps {
  children: React.ReactNode;
}

export const TableContainer = React.forwardRef<
  HTMLDivElement,
  TableContainerProps
>(({ children, ...rest }, ref) => {
  return (
    <MuiTableContainer ref={ref} className={styles.tableContainer} {...rest}>
      {children}
    </MuiTableContainer>
  );
});

TableContainer.displayName = "TableContainer";
