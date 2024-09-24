import React, { ReactNode } from "react";
import styles from "./drawerContainer.module.css";

const DrawerContainer = ({
  children,
  closeButton,
  footer,
}: {
  children: ReactNode;
  closeButton: ReactNode;
  footer?: ReactNode;
}) => {
  return (
    <div className={styles.container}>
      <div className={styles.closeButtonContainer}>{closeButton}</div>
      {children}
      {footer}
    </div>
  );
};

export default DrawerContainer;
