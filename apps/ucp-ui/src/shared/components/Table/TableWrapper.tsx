import React from "react";
import { ReactNode } from "react";
import styles from "./tableWrapper.module.css";
import classnames from "classnames";

export const TableWrapper = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  return (
    <div className={classnames(styles.tableWrapper, className)}>{children}</div>
  );
};
