import { RequestHandler } from "express";
import { auth } from "express-oauth2-jwt-bearer";

import envs from "@/config";
import { AUTH0_CLIENT_AUDIENCE } from "@repo/shared-utils";

export const validateAccessToken: RequestHandler = auth({
  audience: AUTH0_CLIENT_AUDIENCE,
  issuerBaseURL: `https://${envs.AUTH0_DOMAIN}`,
  tokenSigningAlg: "RS256",
});
