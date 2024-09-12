import {
  AUTH0_CLIENT_AUDIENCE,
  AUTH0_WIDGET_AUDIENCE,
} from "@repo/shared-utils";
import { auth } from "express-oauth2-jwt-bearer";

const validateAccessToken = (audience: string | undefined) =>
  auth({
    audience: audience,
    issuerBaseURL: `https://${process.env.AUTH0_DOMAIN}`,
    tokenSigningAlg: "RS256",
  });

export const validateUIAudience = validateAccessToken(AUTH0_CLIENT_AUDIENCE);

export const validateWidgetAudience = validateAccessToken(
  AUTH0_WIDGET_AUDIENCE,
);
