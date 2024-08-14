import { Alert, AlertTitle, Button } from "@mui/material";
import React from "react";
import { TRY_AGAIN_BUTTON_TEXT } from "./constants";
import styles from "./formSubmissionErrorAlert.module.css";

interface Props {
  description: string;
  formId: string;
  title: string;
}

const FormSubmissionErrorAlert = ({ description, formId, title }: Props) => {
  return (
    <Alert
      action={
        <Button color="inherit" form={formId} type="submit">
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

export default FormSubmissionErrorAlert;
