import React, { useState } from "react";
import { InfoOutlined, MailOutline } from "@mui/icons-material";
import { useAuth0 } from "@auth0/auth0-react";
import { UserRoles } from "../shared/constants/roles";
import {
  Button,
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
import { SUPPORT_EMAIL } from "../shared/constants/support";
import {
  API_KEY_TOOLTIP_TEST_ID,
  API_KEY_TOOLTIP_TEXT,
  API_KEYS_CARD_TITLE_TEXT,
  API_KEYS_REQUEST_ACCESS_TITLE_TEXT,
  REQUEST_API_KEY_ACCESS_BUTTON_TEXT,
} from "./constants";
import styles from "./apiKeys.module.css";
import { useGetApiKeysQuery } from "./api";

const newLine = "%0D%0A";

const ApiKeys = () => {
  const { user } = useAuth0();

  const userRoles = user?.["ucw/roles"] as Array<string>;

  const hasApiKeyAccess = userRoles?.includes(UserRoles.WidgetHost);

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
        <CardContent>
          {!hasApiKeyAccess && (
            <Stack spacing={0.5}>
              <Typography variant="h5">
                {API_KEYS_REQUEST_ACCESS_TITLE_TEXT}
              </Typography>
              <Typography className={styles.secondaryColor} variant="body1">
                To access UCP services, you will need API keys. To request your
                keys, please email us at {SUPPORT_EMAIL}. We will process your
                request promptly. Once your access is approved, you can return
                here to generate your keys. If you have already submitted a
                request, please check back later.
              </Typography>
            </Stack>
          )}
          {canUserGenerateApiKeys && (
            <Stack spacing={0.5}>
              <Typography variant="h5">
                Your API keys are ready to be generated
              </Typography>
              <Typography className={styles.secondaryColor} variant="body1">
                Generate your Client ID and Client Secret below.
              </Typography>
            </Stack>
          )}
        </CardContent>
        <CardActions className={styles.cardActions}>
          {!hasApiKeyAccess && (
            <Button
              href={`mailto:${SUPPORT_EMAIL}?subject=API Keys Request for ${user?.email}&body=${newLine}${newLine}----------Do not edit anything below this line----------${newLine}User Email: ${user?.email}`}
              size="large"
              startIcon={<MailOutline />}
              variant="contained"
            >
              {REQUEST_API_KEY_ACCESS_BUTTON_TEXT}
            </Button>
          )}
          {canUserGenerateApiKeys && (
            <Button size="large" variant="contained">
              GENERATE API KEYS
            </Button>
          )}
        </CardActions>
      </Card>
    </Stack>
  );
};

export default ApiKeys;