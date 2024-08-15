import React, { useState } from "react";
import { InfoOutlined } from "@mui/icons-material";
import { useAuth0 } from "@auth0/auth0-react";
import { UserRoles } from "../shared/constants/roles";
import {
  Card,
  CardContent,
  CardHeader,
  ClickAwayListener,
  Divider,
  IconButton,
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
  API_KEYS_GET_KEYS_FAILURE_TEXT,
} from "./constants";
import styles from "./apiKeys.module.css";
import { useGetApiKeysQuery } from "./api";
import RequestAPIKeyAccess from "./RequestAPIKeyAccess";
import FetchError from "../shared/components/FetchError";
import GenerateKeys from "./GenerateKeys";

const ApiKeys = () => {
  const { user } = useAuth0();

  const userRoles = user?.["ucw/roles"] as Array<string>;

  const hasApiKeyAccess = userRoles?.includes(UserRoles.WidgetHost);

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
        {canUserGenerateApiKeys && <GenerateKeys />}
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
      </Card>
    </Stack>
  );
};

export default ApiKeys;
