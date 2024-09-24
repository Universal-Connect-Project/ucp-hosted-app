import React, { ReactNode } from "react";
import styles from "./drawerContent.module.css";

const DrawerContent = ({ children }: { children: ReactNode }) => {
  return <div className={styles.container}>{children}</div>;
};

export default DrawerContent;
