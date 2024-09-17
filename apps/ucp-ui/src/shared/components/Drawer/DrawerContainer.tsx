import React, { ReactNode } from "react";
import styles from "./drawerContainer.module.css";

const DrawerContainer = ({
  children,
  closeButton,
}: {
  children: ReactNode;
  closeButton: ReactNode;
}) => {
  return (
    <div className={styles.container}>
      <div className={styles.closeButtonContainer}>{closeButton}</div>
      {children}
    </div>
  );
};

export default DrawerContainer;
