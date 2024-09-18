import React from "react";
import styles from "./sectionHeader.module.css";
import { Tooltip, Typography } from "@mui/material";
import { InfoOutlined } from "@mui/icons-material";

const SectionHeader = ({
  sectionTitle,
  tooltipTitle,
  typographyProps,
}: {
  sectionTitle: string;
  tooltipTitle: string;
  typographyProps?: object;
}) => {
  return (
    <div className={styles.container}>
      <Typography variant="body1" {...typographyProps}>
        {sectionTitle}
      </Typography>
      <Tooltip title={tooltipTitle}>
        <InfoOutlined color="action" fontSize="small" />
      </Tooltip>
    </div>
  );
};

export default SectionHeader;
