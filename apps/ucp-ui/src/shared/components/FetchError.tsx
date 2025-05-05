import { Alert, AlertTitle, Button } from "@mui/material";
import React from "react";
import { TRY_AGAIN_BUTTON_TEXT } from "./constants";
import styles from "./errorAlert.module.css";

const FetchError = ({
  description,
  refetch,
  title = "Something went wrong",
}: {
  description: string;
  refetch: VoidFunction;
  title?: string;
}) => {
  return (
    <Alert
      action={
        <Button color="inherit" onClick={refetch}>
          {TRY_AGAIN_BUTTON_TEXT}
        </Button>
      }
      className={styles.dontWrapAlertAction}
      severity="error"
    >
      <AlertTitle>{title}</AlertTitle>
      {description}
    </Alert>
  );
};

export default FetchError;
