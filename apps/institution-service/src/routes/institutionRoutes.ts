import { Router } from "express";
import { auth, requiredScopes } from "express-oauth2-jwt-bearer";
import { getInstitutionCachedList } from "../controllers/institutionController";

const validateAccessToken = auth({
  audience: process.env.AUTH0_WIDGET_AUDIENCE,
  issuerBaseURL: `https://${process.env.AUTH0_DOMAIN}`,
  tokenSigningAlg: "RS256",
});

const router = Router();

router.get(
  "/cacheList",
  [validateAccessToken],
  requiredScopes("read:widget-endpoints"),
  getInstitutionCachedList
);

export default router;