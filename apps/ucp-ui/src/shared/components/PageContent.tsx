import React, { ReactNode } from "react";
import styles from "./pageContent.module.css";

const PageContent = ({ children }: { children: ReactNode }) => (
  <div className={styles.container}>{children}</div>
);

export default PageContent;
