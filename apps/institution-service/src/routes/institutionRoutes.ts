import {
  AUTH0_CLIENT_AUDIENCE,
  AUTH0_WIDGET_AUDIENCE,
  UiUserPermissions,
} from "@repo/shared-utils";
import { RequestHandler, Router } from "express";
import { auth, requiredScopes } from "express-oauth2-jwt-bearer";
import {
  createInstitution,
  getInstitutionCachedList,
} from "../controllers/institutionController";

const validateAccessToken = (audience: string | undefined) =>
  auth({
    audience: audience,
    issuerBaseURL: `https://${process.env.AUTH0_DOMAIN}`,
    tokenSigningAlg: "RS256",
  });

const router = Router();

router.get(
  "/cacheList",
  [validateAccessToken(AUTH0_WIDGET_AUDIENCE as string)],
  requiredScopes("read:widget-endpoints"),
  getInstitutionCachedList as RequestHandler,
);

router.post(
  "/",
  [validateAccessToken(AUTH0_CLIENT_AUDIENCE as string)],
  requiredScopes(UiUserPermissions.CREATE_INSTITUTION),
  createInstitution as RequestHandler,
);

export default router;
