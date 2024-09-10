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
  Tooltip,
} from "@mui/material";
import {
  API_KEY_TOOLTIP_TEST_ID,
  API_KEY_TOOLTIP_TEXT,
  API_KEYS_CARD_TITLE_TEXT,
  API_KEYS_CLIENT_ID_LABEL_TEXT,
  API_KEYS_CLIENT_SECRET_LABEL_TEXT,
  API_KEYS_GET_KEYS_FAILURE_TEXT,
} from "./constants";
import styles from "./apiKeys.module.css";
import { useGetApiKeysQuery } from "./api";
import RequestAPIKeyAccess from "./RequestAPIKeyAccess";
import FetchError from "../shared/components/FetchError";
import GenerateKeys from "./GenerateKeys";
import ApiKey from "./ApiKey";
import ManageApiKeys from "./ManageApiKeys";
import PageTitle from "../shared/components/PageTitle";

const ApiKeys = () => {
  const { user } = useAuth0();

  const userRoles = user?.["ucw/roles"] as Array<string>;

  const hasApiKeyAccess = userRoles?.includes(UserRoles.WidgetHost);

  const {
    data: keysData,
    error: apiKeysError,
    isError: isGetApiKeysError,
    isFetching: isGetApiKeysFetching,
    refetch: refetchApiKeys,
  } = useGetApiKeysQuery(undefined, {
    skip: !hasApiKeyAccess,
  });

  const isUserMissingApiKeys =
    isGetApiKeysError && (apiKeysError as number) === 404;

  const shouldShowGetApiKeysError = isGetApiKeysError && !isUserMissingApiKeys;

  const canUserGenerateApiKeys = isUserMissingApiKeys && hasApiKeyAccess;

  const { clientId, clientSecret } = keysData || {};

  const shouldShowManageButton =
    isGetApiKeysFetching || (clientId && clientSecret);

  const [isTooltipOpen, setIsTooltipOpen] = useState(false);

  const handleOpenTooltip = () => setIsTooltipOpen(true);
  const handleCloseTooltip = () => setIsTooltipOpen(false);

  let cardBody;

  if (!hasApiKeyAccess) {
    cardBody = <RequestAPIKeyAccess />;
  } else if (canUserGenerateApiKeys) {
    cardBody = <GenerateKeys />;
  } else if (shouldShowGetApiKeysError) {
    cardBody = (
      <CardContent>
        <FetchError
          description={API_KEYS_GET_KEYS_FAILURE_TEXT}
          refetch={() => void refetchApiKeys()}
          title="Something went wrong"
        />
      </CardContent>
    );
  } else {
    cardBody = (
      <CardContent>
        <Stack spacing={1.5}>
          <ApiKey
            isLoading={isGetApiKeysFetching}
            label={API_KEYS_CLIENT_ID_LABEL_TEXT}
            value={clientId}
          />
          <ApiKey
            isLoading={isGetApiKeysFetching}
            label={API_KEYS_CLIENT_SECRET_LABEL_TEXT}
            value={clientSecret}
          />
        </Stack>
      </CardContent>
    );
  }

  return (
    <Stack spacing={3.5}>
      <PageTitle>Widget Management</PageTitle>
      <Card className={styles.apiKeysCard} variant="outlined">
        <CardHeader
          title={
            <Stack alignItems="center" direction="row" spacing={0.5}>
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
              <div className={styles.cardTitle}>{API_KEYS_CARD_TITLE_TEXT}</div>
              {shouldShowManageButton && (
                <ManageApiKeys isLoading={isGetApiKeysFetching} />
              )}
            </Stack>
          }
          titleTypographyProps={{
            variant: "h6",
          }}
        />
        <Divider />
        {cardBody}
      </Card>
    </Stack>
  );
};

export default ApiKeys;
