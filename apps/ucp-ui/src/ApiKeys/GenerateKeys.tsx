import { CardActions, CardContent, Stack, Typography } from "@mui/material";
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
import { useAppDispatch } from "../shared/utils/redux";
import { displaySnackbar } from "../shared/reducers/snackbar";

const GenerateKeys = () => {
  const generateKeysFormId = "generateKeys";

  const dispatch = useAppDispatch();

  const [
    mutateCreateApiKeys,
    { isError: isCreateApiKeysError, isLoading: isCreateApiKeysLoading },
  ] = useCreateApiKeysMutation();

  const createApiKeys = () => {
    mutateCreateApiKeys()
      .unwrap()
      .then(() => {
        dispatch(displaySnackbar(API_KEYS_GENERATE_API_KEYS_SUCCESS_TEXT));
      })
      .catch(() => {});
  };

  return (
    <>
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
