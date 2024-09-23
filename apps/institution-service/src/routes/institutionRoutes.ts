import { UiUserPermissions, WidgetHostPermissions } from "@repo/shared-utils";
import { RequestHandler, Router } from "express";
import { requiredScopes, scopeIncludesAny } from "express-oauth2-jwt-bearer";
import {
  createInstitution,
  getInstitutionCachedList,
  updateInstitution,
} from "../controllers/institutionController";
import {
  institutionSchema,
  validate,
  validateUserCanEditInstitution,
} from "../middlewares/validationMiddleware";
import {
  validateUIAudience,
  validateWidgetAudience,
} from "../shared/utils/permissionValidation";

const router = Router();

router.get(
  "/cacheList",
  [validateWidgetAudience],
  requiredScopes(WidgetHostPermissions.READ_WIDGET_ENDPOINTS),
  getInstitutionCachedList as RequestHandler,
);

router.post(
  "/",
  [validateUIAudience, validate(institutionSchema)],
  scopeIncludesAny(
    `${UiUserPermissions.CREATE_INSTITUTION} ${UiUserPermissions.CREATE_INSTITUTION_AGGREGATOR}`,
  ),
  createInstitution as RequestHandler,
);

router.put(
  "/:id",
  [
    validateUIAudience,
    validateUserCanEditInstitution,
    validate(institutionSchema),
  ],
  scopeIncludesAny(
    `${UiUserPermissions.UPDATE_INSTITUTION} ${UiUserPermissions.UPDATE_INSTITUTION_AGGREGATOR}`,
  ),
  updateInstitution as RequestHandler,
);

export default router;
