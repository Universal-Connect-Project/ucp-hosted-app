import { createRequestBodySchemaValidator } from "@repo/backend-utils";
import { UiUserPermissions } from "@repo/shared-utils";
import { RequestHandler, Router } from "express";
import { scopeIncludesAny } from "express-oauth2-jwt-bearer";
import {
  createAggregatorIntegration,
  deleteAggregatorIntegration,
  updateAggregatorIntegration,
} from "../controllers/aggregatorIntegrationController";
import {
  aggregatorIntegrationCreateSchema,
  aggregatorIntegrationUpdateSchema,
  validateUserCanCreateAggregatorIntegration,
  validateUserCanDeleteAggregatorIntegration,
  validateUserCanEditAggregatorIntegration,
} from "../middlewares/validationMiddleware";
import { validateUIAudience } from "../shared/utils/permissionValidation";

const router = Router();

router.put(
  "/:id",
  [
    validateUIAudience,
    validateUserCanEditAggregatorIntegration,
    createRequestBodySchemaValidator(aggregatorIntegrationUpdateSchema),
  ],
  scopeIncludesAny(
    `${UiUserPermissions.UPDATE_AGGREGATOR_INTEGRATION} ${UiUserPermissions.UPDATE_AGGREGATOR_INTEGRATION_AS_AGGREGATOR}`,
  ),
  updateAggregatorIntegration as RequestHandler,
);

router.post(
  "/",
  [
    validateUIAudience,
    createRequestBodySchemaValidator(aggregatorIntegrationCreateSchema),
    validateUserCanCreateAggregatorIntegration,
  ],
  scopeIncludesAny(
    `${UiUserPermissions.CREATE_AGGREGATOR_INTEGRATION} ${UiUserPermissions.CREATE_AGGREGATOR_INTEGRATION_AS_AGGREGATOR}`,
  ),
  createAggregatorIntegration as RequestHandler,
);

router.delete(
  "/:id",
  [validateUIAudience, validateUserCanDeleteAggregatorIntegration],
  scopeIncludesAny(
    `${UiUserPermissions.DELETE_AGGREGATOR_INTEGRATION} ${UiUserPermissions.DELETE_AGGREGATOR_INTEGRATION_AS_AGGREGATOR}`,
  ),
  deleteAggregatorIntegration as RequestHandler,
);

export default router;
