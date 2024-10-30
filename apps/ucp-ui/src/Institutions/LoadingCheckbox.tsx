import React from "react";
import styles from "./loadingCheckbox.module.css";
import { Skeleton } from "../shared/components/Skeleton";

const LoadingCheckbox = () => (
  <div className={styles.container}>
    <Skeleton height="18px" width="18px" />
    <Skeleton height="14px" width="80px" />
  </div>
);

export default LoadingCheckbox;
