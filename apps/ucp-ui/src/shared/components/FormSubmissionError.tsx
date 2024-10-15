import { Alert, AlertTitle, Button } from "@mui/material";
import React, { useEffect, useRef } from "react";
import { TRY_AGAIN_BUTTON_TEXT } from "./constants";
import styles from "./errorAlert.module.css";

interface Props {
  description: string;
  formId: string;
  title: string;
}

const FormSubmissionError = ({ description, formId, title }: Props) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ref?.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, []);

  return (
    <Alert
      action={
        <Button color="inherit" form={formId} type="submit">
          {TRY_AGAIN_BUTTON_TEXT}
        </Button>
      }
      className={styles.dontWrapAlertAction}
      ref={ref}
      severity="error"
    >
      <AlertTitle>{title}</AlertTitle>
      {description}
    </Alert>
  );
};

export default FormSubmissionError;
