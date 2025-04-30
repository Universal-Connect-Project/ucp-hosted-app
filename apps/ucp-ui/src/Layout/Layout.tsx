import React from "react";
import { withAuthenticationRequired } from "@auth0/auth0-react";
import Snackbars from "./Snackbars";
import SideNav from "./SideNav";
import styles from "./layout.module.css";
import { Outlet } from "react-router-dom";
import AuthenticationWrapper from "./AuthenticationWrapper";

const Layout = () => {
  return (
    <AuthenticationWrapper>
      <Snackbars />
      <div className={styles.container}>
        <SideNav />
        <div className={styles.pageContentContainer}>
          <Outlet />
        </div>
      </div>
    </AuthenticationWrapper>
  );
};

export default withAuthenticationRequired(Layout);
