import React from "react";
import styles from "./institutionField.module.css";
import { InfoOutlined } from "@mui/icons-material";
import { Tooltip, Typography } from "@mui/material";
import { TextSkeletonIfLoading } from "../../shared/components/Skeleton";

const InstitutionField = ({
  isLoading,
  name,
  shouldDisableValueTooltip,
  tooltip,
  tooltipTestId,
  value,
}: {
  isLoading: boolean;
  name: string;
  shouldDisableValueTooltip?: boolean;
  tooltip: string;
  tooltipTestId: string;
  value?: string;
}) => (
  <div className={styles.container}>
    <div className={styles.header}>
      <Tooltip title={tooltip}>
        <InfoOutlined
          color="action"
          data-testid={tooltipTestId}
          fontSize="inherit"
        />
      </Tooltip>
      <Typography variant="subtitle2">{name}</Typography>
    </div>
    <Tooltip title={shouldDisableValueTooltip ? "" : value}>
      <Typography className={styles.value} variant="body2">
        {isLoading ? <TextSkeletonIfLoading isLoading /> : value}
      </Typography>
    </Tooltip>
  </div>
);

export default InstitutionField;
