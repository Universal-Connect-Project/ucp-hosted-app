import envs from "@/config";
import { auth } from "express-oauth2-jwt-bearer";

export const validateAccessToken = auth({
  audience: envs.AUTH0_AUDIENCE,
  issuerBaseURL: `https://${envs.AUTH0_DOMAIN}`,
  tokenSigningAlg: "RS256",
});
