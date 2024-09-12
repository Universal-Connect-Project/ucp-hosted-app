import { UiUserPermissions } from "@repo/shared-utils";
import { RequestHandler, Router } from "express";
import { requiredScopes } from "express-oauth2-jwt-bearer";
import {
  createInstitution,
  getInstitutionCachedList,
} from "../controllers/institutionController";
import {
  validateUIAudience,
  validateWidgetAudience,
} from "../shared/utils/permissionValidation";

const router = Router();

router.get(
  "/cacheList",
  [validateWidgetAudience],
  requiredScopes("read:widget-endpoints"),
  getInstitutionCachedList as RequestHandler,
);

router.post(
  "/",
  [validateUIAudience],
  requiredScopes(UiUserPermissions.CREATE_INSTITUTION),
  createInstitution as RequestHandler,
);

export default router;
