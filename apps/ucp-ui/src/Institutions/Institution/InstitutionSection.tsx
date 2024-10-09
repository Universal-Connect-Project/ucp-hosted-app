import React, { ReactNode } from "react";
import styles from "./institutionSection.module.css";
import { Typography } from "@mui/material";

const InstitutionSection = ({
  children,
  title,
}: {
  children: ReactNode;
  title: string;
}) => (
  <div className={styles.container}>
    <Typography variant="overline">{title}</Typography>
    {children}
  </div>
);

export default InstitutionSection;
