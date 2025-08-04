import React, { ReactNode } from "react";
import styles from "./tableAlertContainer.module.css";

export const TableAlertContainer = ({ children }: { children: ReactNode }) => {
  return <div className={styles.tableAlertContainer}>{children}</div>;
};
