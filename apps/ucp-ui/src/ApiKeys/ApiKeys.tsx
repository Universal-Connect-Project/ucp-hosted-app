import React from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { UserRoles } from "../shared/constants/roles";
import { Button } from "@mui/material";
import { SUPPORT_EMAIL } from "../shared/constants/support";
import { REQUEST_API_KEY_ACCESS_BUTTON_TEXT } from "./constants";

const newLine = "%0D%0A";

const ApiKeys = () => {
  const { user } = useAuth0();

  const userRoles = user?.["ucw/roles"] as Array<string>;

  const hasApiKeyAccess = userRoles?.includes(UserRoles.WidgetHost);

  return !hasApiKeyAccess ? (
    <Button
      href={`mailto:${SUPPORT_EMAIL}?subject=API Keys Request for ${user?.email}&body=${newLine}${newLine}----------Do not edit anything below this line----------${newLine}User Email: ${user?.email}`}
      variant="contained"
    >
      {REQUEST_API_KEY_ACCESS_BUTTON_TEXT}
    </Button>
  ) : null;
};

export default ApiKeys;
