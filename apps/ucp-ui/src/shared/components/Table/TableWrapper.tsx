import React from "react";
import { ReactNode } from "react";
import styles from "./tableWrapper.module.css";
import classnames from "classnames";

export const TableWrapper = ({
  children,
  className,
  height,
}: {
  children: ReactNode;
  className?: string;
  height: number;
}) => {
  return (
    <div
      className={classnames(styles.tableWrapper, className)}
      style={{ height }}
    >
      {children}
    </div>
  );
};
