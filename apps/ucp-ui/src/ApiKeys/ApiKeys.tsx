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
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  API_KEY_TOOLTIP_TEST_ID,
  API_KEY_TOOLTIP_TEXT,
  API_KEYS_CARD_TITLE_TEXT,
} from "./constants";
import styles from "./apiKeys.module.css";
import { useCreateApiKeysMutation, useGetApiKeysQuery } from "./api";
import FormSubmissionErrorAlert from "../shared/components/FormSubmissionErrorAlert";
import RequestAPIKeyAccess from "./RequestAPIKeyAccess";

const generateKeysFormId = "generateKeys";

const ApiKeys = () => {
  const { user } = useAuth0();

  const userRoles = user?.["ucw/roles"] as Array<string>;

  const hasApiKeyAccess = userRoles?.includes(UserRoles.WidgetHost);

  const [
    createApiKeys,
    { isError: isCreateApiKeysError, isLoading: isCreateApiKeysLoading },
  ] = useCreateApiKeysMutation();

  const {
    //data,
    error,
    isError,
    //  isLoading
  } = useGetApiKeysQuery(undefined, {
    skip: !hasApiKeyAccess,
  });

  const isUserMissingApiKeys = isError && (error as number) === 404;

  const canUserGenerateApiKeys = isUserMissingApiKeys && hasApiKeyAccess;

  const [isTooltipOpen, setIsTooltipOpen] = useState(false);

  const handleOpenTooltip = () => setIsTooltipOpen(true);
  const handleCloseTooltip = () => setIsTooltipOpen(false);

  return (
    <Stack className={styles.pageContainer} spacing={3.5}>
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
                    description="We couldn’t load your API keys. Please try again in a few
                  moments. If the problem persists, contact us for support."
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
                  GENERATE API KEYS
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
