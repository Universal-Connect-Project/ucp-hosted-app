import { AUTH0_WIDGET_AUDIENCE } from "@repo/shared-utils";
import { RequestHandler, Router } from "express";
import { auth, requiredScopes } from "express-oauth2-jwt-bearer";
import {
  createInstitution,
  getInstitutionCachedList,
} from "../controllers/institutionController";

const validateWidgetAccessToken = auth({
  audience: AUTH0_WIDGET_AUDIENCE,
  issuerBaseURL: `https://${process.env.AUTH0_DOMAIN}`,
  tokenSigningAlg: "RS256",
});

const router = Router();

router.get(
  "/cacheList",
  [validateWidgetAccessToken],
  requiredScopes("read:widget-endpoints"),
  getInstitutionCachedList as RequestHandler,
);

router.post("/", createInstitution as RequestHandler);

export default router;
