import React from "react";
import styles from "./institutionField.module.css";
import { InfoOutlined } from "@mui/icons-material";
import { Tooltip, Typography } from "@mui/material";

const InstitutionField = ({
  name,
  tooltip,
  value,
}: {
  name: string;
  tooltip: string;
  value: string;
}) => (
  <div>
    <div className={styles.header}>
      <Tooltip title={tooltip}>
        <InfoOutlined color="action" fontSize="inherit" />
      </Tooltip>
      <Typography>{name}</Typography>
    </div>
    <Typography variant="body2">{value}</Typography>
  </div>
);

export default InstitutionField;
