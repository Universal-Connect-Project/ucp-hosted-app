import React from "react";
import styles from "./institutionField.module.css";
import { InfoOutlined } from "@mui/icons-material";
import { Tooltip, Typography } from "@mui/material";

const InstitutionField = ({
  name,
  shouldDisableValueTooltip,
  tooltip,
  value,
}: {
  name: string;
  shouldDisableValueTooltip?: boolean;
  tooltip: string;
  value: string;
}) => (
  <div className={styles.container}>
    <div className={styles.header}>
      <Tooltip title={tooltip}>
        <InfoOutlined color="action" fontSize="inherit" />
      </Tooltip>
      <Typography>{name}</Typography>
    </div>
    <Tooltip title={shouldDisableValueTooltip ? "" : value}>
      <Typography className={styles.value} variant="body2">
        {value}
      </Typography>
    </Tooltip>
  </div>
);

export default InstitutionField;
