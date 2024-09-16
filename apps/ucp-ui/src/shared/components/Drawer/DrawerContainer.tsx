import React, { ReactNode } from "react";
import styles from "./drawerContainer.module.css";

const DrawerContainer = ({ children }: { children: ReactNode }) => {
  return <div className={styles.container}>{children}</div>;
};

export default DrawerContainer;
