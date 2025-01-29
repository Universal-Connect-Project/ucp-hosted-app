import { validateAccessToken } from "@repo/backend-utils";
import { AUTH0_CLIENT_AUDIENCE } from "@repo/shared-utils";
import envs from "../config";

export const validateUIAudience = validateAccessToken({
  audience: AUTH0_CLIENT_AUDIENCE,
  auth0Domain: envs.AUTH0_DOMAIN,
});
