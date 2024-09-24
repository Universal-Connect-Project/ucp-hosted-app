import React, { ReactNode } from "react";
import styles from "./drawerStickyFooter.module.css";

const DrawerStickyFooter = ({ children }: { children: ReactNode }) => {
  return <div className={styles.container}>{children}</div>;
};

export default DrawerStickyFooter;
