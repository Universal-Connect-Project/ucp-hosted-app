import React from "react";
import { Button, Typography } from "@mui/material";
import { ChevronRight } from "@mui/icons-material";

import PageContent from "../shared/components/PageContent";
import HeroImage from "./HeroImage";
import PageTitle from "../shared/components/PageTitle";
import styles from "./genericError.module.css";

const GenericError = () => {
  return (
    <>
      <PageContent>
        <div className={styles.pageContent}>
          <div className={styles.contentGrid}>
            <PageTitle>Oops, something went wrong.</PageTitle>
            <br />
            <Typography variant="body1">
              It looks like the page you&apos;re looking for doesn&apos;t exist
              or something&apos;s broken on our end.
            </Typography>
            <br />
            <br />
            <Button
              endIcon={<ChevronRight />}
              variant="contained"
              color="primary"
              href="/"
            >
              Go Home
            </Button>
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
