import React from "react";
import styles from "./sectionHeader.module.css";
import { Tooltip, Typography } from "@mui/material";
import { InfoOutlined } from "@mui/icons-material";
import { SECTION_HEADER_INFO_ICON_TEST_ID } from "./constants";

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
        <InfoOutlined
          color="action"
          data-testid={SECTION_HEADER_INFO_ICON_TEST_ID}
          fontSize="inherit"
        />
      </Tooltip>
    </div>
  );
};

export default SectionHeader;
