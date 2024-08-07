import envs from "@/config";
import { auth, claimCheck, JWTPayload } from "express-oauth2-jwt-bearer";

type ClaimCheck = JWTPayload & { permissions: string[] };

export const validateAccessToken = auth({
  audience: envs.AUTH0_CLIENT_AUDIENCE,
  issuerBaseURL: `https://${envs.AUTH0_DOMAIN}`,
  tokenSigningAlg: "RS256",
});

export const checkPermission = (permission: string) =>
  claimCheck(
    (token: JWTPayload) =>
      (token as ClaimCheck).permissions.includes(permission),
    "Insufficient permissions",
  );
