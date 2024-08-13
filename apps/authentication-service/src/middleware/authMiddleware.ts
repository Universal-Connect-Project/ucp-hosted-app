import { RequestHandler } from "express";
import { auth, claimCheck, JWTPayload } from "express-oauth2-jwt-bearer";

import envs from "@/config";

type ClaimCheck = JWTPayload & { permissions: string[] };

export const validateAccessToken: RequestHandler = auth({
  audience: envs.AUTH0_CLIENT_AUDIENCE,
  issuerBaseURL: `https://${envs.AUTH0_DOMAIN}`,
  tokenSigningAlg: "RS256",
});

export const checkPermission = (permission: string): RequestHandler => {
  console.log("----> checkPermission", permission);

  return claimCheck((token: JWTPayload) => {
    console.log("----> token in checkPermission", token);
    return (token as ClaimCheck)?.permissions.includes(permission);
  }, "Insufficient Permissions");
};
