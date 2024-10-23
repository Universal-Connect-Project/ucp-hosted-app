import React from "react";
import styles from "./nameLogo.module.css";
import { Typography } from "@mui/material";

const NameLogo = ({
  label,
  logo,
  name,
}: {
  label: string;
  logo?: string;
  name?: string;
}) => {
  return (
    <div className={styles.container}>
      <img className={styles.logo} src={logo} />
      <div>
        <Typography className={styles.label} variant="caption">
          {label}
        </Typography>
        <Typography variant="body1">{name}</Typography>
      </div>
    </div>
  );
};

export default NameLogo;
