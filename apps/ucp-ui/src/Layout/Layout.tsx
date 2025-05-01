import React from "react";
import { withAuthenticationRequired } from "@auth0/auth0-react";
import Snackbars from "./Snackbars";
import SideNav from "./SideNav";
import styles from "./layout.module.css";
import { Outlet } from "react-router-dom";

export const UnauthenticatedLayout = ({
  shouldShowLoggedOutExperience,
}: {
  shouldShowLoggedOutExperience?: boolean;
}) => {
  return (
    <>
      <Snackbars />
      <div className={styles.container}>
        <SideNav
          shouldShowLoggedOutExperience={shouldShowLoggedOutExperience}
        />
        <div className={styles.pageContentContainer}>
          <Outlet />
        </div>
      </div>
    </>
  );
};

export default withAuthenticationRequired(UnauthenticatedLayout);
