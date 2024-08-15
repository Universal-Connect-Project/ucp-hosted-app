import {
  Button,
  CardActions,
  CardContent,
  Stack,
  Typography,
} from "@mui/material";
import React from "react";
import {
  API_KEYS_REQUEST_ACCESS_TITLE_TEXT,
  REQUEST_API_KEY_ACCESS_BUTTON_TEXT,
} from "./constants";
import styles from "./apiKeys.module.css";
import { SUPPORT_EMAIL } from "../shared/constants/support";
import { useAuth0 } from "@auth0/auth0-react";
import { MailOutline } from "@mui/icons-material";

const newLine = "%0D%0A";

const RequestAPIKeyAccess = () => {
  const { user } = useAuth0();

  return (
    <>
      <CardContent>
        <Stack spacing={0.5}>
          <Typography variant="h5">
            {API_KEYS_REQUEST_ACCESS_TITLE_TEXT}
          </Typography>
          <Typography className={styles.secondaryColor} variant="body1">
            To access UCP services, you will need API keys. Please email us to
            request your keys and we will process your request promptly. Once
            your access is approved, you can return here to generate your keys.
            If you have already submitted a request, please check back later.
          </Typography>
        </Stack>
      </CardContent>
      <CardActions className={styles.cardActions}>
        <Button
          href={`mailto:${SUPPORT_EMAIL}?subject=API Keys Request for ${user?.email}&body=${newLine}${newLine}----------Do not edit anything below this line----------${newLine}User Email: ${user?.email}`}
          size="large"
          startIcon={<MailOutline />}
          variant="contained"
        >
          {REQUEST_API_KEY_ACCESS_BUTTON_TEXT}
        </Button>
      </CardActions>
    </>
  );
};

export default RequestAPIKeyAccess;
