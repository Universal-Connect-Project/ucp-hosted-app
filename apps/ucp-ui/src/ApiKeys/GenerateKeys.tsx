import {
  CardActions,
  CardContent,
  Snackbar,
  Stack,
  Typography,
} from "@mui/material";
import React from "react";
import styles from "./apiKeys.module.css";
import FormSubmissionError from "../shared/components/FormSubmissionError";
import {
  API_KEYS_GENERATE_API_KEYS_BUTTON_TEXT,
  API_KEYS_GENERATE_API_KEYS_FAILURE_TEXT,
  API_KEYS_GENERATE_API_KEYS_SUCCESS_TEXT,
} from "./constants";
import { LoadingButton } from "@mui/lab";
import { useCreateApiKeysMutation } from "./api";
import useSuccessSnackbar from "../shared/hooks/useSuccessSnackbar";

const GenerateKeys = () => {
  const generateKeysFormId = "generateKeys";

  const [
    mutateCreateApiKeys,
    { isError: isCreateApiKeysError, isLoading: isCreateApiKeysLoading },
  ] = useCreateApiKeysMutation();

  const { handleOpenSuccessSnackbarWithMessage, successSnackbarProps } =
    useSuccessSnackbar();

  const createApiKeys = () => {
    mutateCreateApiKeys()
      .unwrap()
      .then(() => {
        handleOpenSuccessSnackbarWithMessage(
          API_KEYS_GENERATE_API_KEYS_SUCCESS_TEXT,
        );
      })
      .catch(() => {});
  };

  return (
    <>
      <Snackbar {...successSnackbarProps} />
      <CardContent>
        <Stack spacing={1.5}>
          <Stack spacing={0.5}>
            <Typography variant="h5">
              Your API keys are ready to be generated
            </Typography>
            <Typography className={styles.secondaryColor} variant="body1">
              Generate your Client ID and Client Secret below.
            </Typography>
          </Stack>
          {isCreateApiKeysError && (
            <FormSubmissionError
              description={API_KEYS_GENERATE_API_KEYS_FAILURE_TEXT}
              formId={generateKeysFormId}
              title="Something went wrong"
            />
          )}
        </Stack>
      </CardContent>
      <CardActions className={styles.cardActions}>
        <form
          id={generateKeysFormId}
          onSubmit={(event) => {
            event.preventDefault();
            void createApiKeys();
          }}
        >
          <LoadingButton
            loading={isCreateApiKeysLoading}
            size="large"
            type="submit"
            variant="contained"
          >
            {API_KEYS_GENERATE_API_KEYS_BUTTON_TEXT}
          </LoadingButton>
        </form>
      </CardActions>
    </>
  );
};

export default GenerateKeys;