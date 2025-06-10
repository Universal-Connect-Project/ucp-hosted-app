import { createRequestBodySchemaValidator } from "@repo/backend-utils";
import { UiUserPermissions, WidgetHostPermissions } from "@repo/shared-utils";
import { RequestHandler, Router } from "express";
import { requiredScopes, scopeIncludesAny } from "express-oauth2-jwt-bearer";
import {
  createInstitution,
  deleteInstitution,
  getInstitution,
  getInstitutionCachedList,
  getPaginatedInstitutions,
  updateInstitution,
} from "../controllers/institutionController";
import {
  institutionSchema,
  validateUserCanDeleteInstitution,
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

router.get(
  "/cacheList/download",
  [validateUIAudience],
  getInstitutionCachedList as RequestHandler,
);

router.get(
  "/",
  [validateUIAudience],
  getPaginatedInstitutions as RequestHandler,
);

router.post(
  "/",
  [validateUIAudience, createRequestBodySchemaValidator(institutionSchema)],
  scopeIncludesAny(
    `${UiUserPermissions.CREATE_INSTITUTION} ${UiUserPermissions.CREATE_INSTITUTION_AGGREGATOR}`,
  ),
  createInstitution as RequestHandler,
);

router.get("/:id", [validateUIAudience], getInstitution as RequestHandler);

router.put(
  "/:id",
  [
    validateUIAudience,
    validateUserCanEditInstitution,
    createRequestBodySchemaValidator(institutionSchema),
  ],
  scopeIncludesAny(
    `${UiUserPermissions.UPDATE_INSTITUTION} ${UiUserPermissions.UPDATE_INSTITUTION_AGGREGATOR}`,
  ),
  updateInstitution as RequestHandler,
);

router.delete(
  "/:id",
  [validateUIAudience, validateUserCanDeleteInstitution],
  scopeIncludesAny(
    `${UiUserPermissions.DELETE_INSTITUTION} ${UiUserPermissions.DELETE_INSTITUTION_AGGREGATOR}`,
  ),
  deleteInstitution as RequestHandler,
);

export default router;
