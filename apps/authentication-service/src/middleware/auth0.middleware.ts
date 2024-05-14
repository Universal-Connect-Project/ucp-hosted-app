import * as dotenv from "dotenv";
import { auth } from "express-oauth2-jwt-bearer";

dotenv.config();

export const validateAccessToken = auth({
  audience: process.env.AUTH0_AUDIENCE,
  issuerBaseURL: `https://${process.env.AUTH0_DOMAIN}`,
  tokenSigningAlg: "RS256",
});
