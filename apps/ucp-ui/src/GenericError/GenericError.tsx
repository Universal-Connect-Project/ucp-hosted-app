import React from "react";
import { Button, Typography } from "@mui/material";
import { ChevronRight } from "@mui/icons-material";
import { Link } from "react-router-dom";

import PageContent from "../shared/components/PageContent";
import HeroImage from "./HeroImage";
import PageTitle from "../shared/components/PageTitle";
import styles from "./genericError.module.css";
import {
  GENERIC_ERROR_BUTTON_TEXT,
  GENERIC_ERROR_PARAGRAPH_TEXT,
  GENERIC_ERROR_TITLE_TEXT,
} from "./constants";

const GenericError = () => {
  return (
    <>
      <PageContent>
        <div className={styles.pageContent}>
          <div className={styles.contentGrid}>
            <PageTitle>{GENERIC_ERROR_TITLE_TEXT}</PageTitle>
            <div className={styles.description}>
              <Typography variant="body1">
                {GENERIC_ERROR_PARAGRAPH_TEXT}
              </Typography>
              <Button
                component={Link}
                to="/"
                endIcon={<ChevronRight />}
                variant="contained"
                color="primary"
              >
                {GENERIC_ERROR_BUTTON_TEXT}
              </Button>
            </div>
          </div>
          <div className={styles.contentGrid}>
            <HeroImage />
          </div>
        </div>
      </PageContent>
    </>
  );
};

export default GenericError;
