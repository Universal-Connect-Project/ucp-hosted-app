import React, { useState } from "react";
import { InfoOutlined } from "@mui/icons-material";
import { useAuth0 } from "@auth0/auth0-react";
import { UserRoles } from "../shared/constants/roles";
import { LoadingButton } from "@mui/lab";
import {
  Card,
  CardActions,
  CardContent,
  CardHeader,
  ClickAwayListener,
  Divider,
  IconButton,
  Snackbar,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  API_KEY_TOOLTIP_TEST_ID,
  API_KEY_TOOLTIP_TEXT,
  API_KEYS_CARD_TITLE_TEXT,
  API_KEYS_CLIENT_ID_LABEL_TEXT,
  API_KEYS_GENERATE_API_KEYS_BUTTON_TEXT,
  API_KEYS_GENERATE_API_KEYS_FAILURE_TEXT,
  API_KEYS_GENERATE_API_KEYS_SUCCESS_TEXT,
  API_KEYS_GET_KEYS_FAILURE_TEXT,
} from "./constants";
import styles from "./apiKeys.module.css";
import { useCreateApiKeysMutation, useGetApiKeysQuery } from "./api";
import FormSubmissionErrorAlert from "../shared/components/FormSubmissionErrorAlert";
import RequestAPIKeyAccess from "./RequestAPIKeyAccess";
import FetchError from "../shared/components/FetchError";
import useSuccessSnackbar from "../shared/hooks/useSuccessSnackbar";

const generateKeysFormId = "generateKeys";

const ApiKeys = () => {
  const { user } = useAuth0();

  const userRoles = user?.["ucw/roles"] as Array<string>;

  const hasApiKeyAccess = userRoles?.includes(UserRoles.WidgetHost);

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

  const {
    data: keysData,
    error: apiKeysError,
    isError: isGetApiKeysError,
    // isLoading: isGetApiKeysLoading,
    refetch: refetchApiKeys,
  } = useGetApiKeysQuery(undefined, {
    skip: !hasApiKeyAccess,
  });

  const isUserMissingApiKeys =
    isGetApiKeysError && (apiKeysError as number) === 404;

  const shouldShowGetApiKeysError = isGetApiKeysError && !isUserMissingApiKeys;

  const canUserGenerateApiKeys = isUserMissingApiKeys && hasApiKeyAccess;

  const hasKeys = !!keysData;

  const { clientId } = keysData || {};

  const [isTooltipOpen, setIsTooltipOpen] = useState(false);

  const handleOpenTooltip = () => setIsTooltipOpen(true);
  const handleCloseTooltip = () => setIsTooltipOpen(false);

  return (
    <Stack className={styles.pageContainer} spacing={3.5}>
      <Snackbar {...successSnackbarProps} />
      <Typography variant="h3">Account</Typography>
      <Card className={styles.apiKeysCard} variant="outlined">
        <CardHeader
          title={
            <Stack alignItems="center" direction="row">
              <ClickAwayListener onClickAway={handleCloseTooltip}>
                <Tooltip open={isTooltipOpen} title={API_KEY_TOOLTIP_TEXT}>
                  <IconButton
                    color="primary"
                    data-testid={API_KEY_TOOLTIP_TEST_ID}
                    onClick={handleOpenTooltip}
                  >
                    <InfoOutlined />
                  </IconButton>
                </Tooltip>
              </ClickAwayListener>
              {API_KEYS_CARD_TITLE_TEXT}
            </Stack>
          }
          titleTypographyProps={{
            variant: "h6",
          }}
        />
        <Divider />
        {!hasApiKeyAccess && <RequestAPIKeyAccess />}
        {shouldShowGetApiKeysError && (
          <CardContent>
            <FetchError
              description={API_KEYS_GET_KEYS_FAILURE_TEXT}
              refetch={() => void refetchApiKeys()}
              title="Something went wrong"
            />
          </CardContent>
        )}
        {hasKeys && (
          <CardContent>
            <TextField
              InputProps={{
                readOnly: true,
              }}
              label={API_KEYS_CLIENT_ID_LABEL_TEXT}
              type="password"
              value={clientId}
            />
          </CardContent>
        )}
        {canUserGenerateApiKeys && (
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
                  <FormSubmissionErrorAlert
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
        )}
      </Card>
    </Stack>
  );
};

export default ApiKeys;
