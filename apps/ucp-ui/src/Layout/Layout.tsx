import React from "react";
import Snackbars from "./Snackbars";
import SideNav from "./SideNav";
import styles from "./layout.module.css";
import { Outlet } from "react-router-dom";

const Layout = () => {
  return (
    <>
      <Snackbars />
      <div className={styles.container}>
        <SideNav />
        <div className={styles.pageContentContainer}>
          <Outlet />
        </div>
      </div>
    </>
  );
};

export default Layout;
