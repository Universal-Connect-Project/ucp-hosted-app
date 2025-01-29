import "../dotEnv";
import { validateAccessToken } from "@repo/backend-utils";
import { AUTH0_WIDGET_AUDIENCE } from "@repo/shared-utils";

export const validateWidgetAudience = validateAccessToken({
  audience: AUTH0_WIDGET_AUDIENCE,
  auth0Domain: process.env.AUTH0_DOMAIN as string,
});
