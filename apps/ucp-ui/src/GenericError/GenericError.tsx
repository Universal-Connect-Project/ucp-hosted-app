import React from "react";
import { Button, Typography } from "@mui/material";
import { ChevronRight } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

import PageContent from "../shared/components/PageContent";
import HeroImage from "./HeroImage";
import PageTitle from "../shared/components/PageTitle";
import styles from "./genericError.module.css";
import { GENERIC_ERROR_BUTTON_TEXT } from "./constants";

const GenericError = () => {
  const navigate = useNavigate();

  return (
    <>
      <PageContent>
        <div className={styles.pageContent}>
          <div className={styles.contentGrid}>
            <PageTitle>Oops, something went wrong.</PageTitle>
            <div className={styles.description}>
              <Typography variant="body1">
                It looks like the page you&apos;re looking for doesn&apos;t
                exist or something&apos;s broken on our end.
              </Typography>
              <Button
                endIcon={<ChevronRight />}
                variant="contained"
                color="primary"
                onClick={() => navigate("/")}
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
