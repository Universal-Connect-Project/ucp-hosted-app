import React, { ReactNode } from "react";
import styles from "./jobTypesSelectFlexContainer.module.css";

export const JobTypesSelectFlexContainer = ({
  children,
}: {
  children: ReactNode;
}) => {
  return (
    <div className={styles.relativeContainer}>
      <div className={styles.absoluteContainer}>{children}</div>
    </div>
  );
};
