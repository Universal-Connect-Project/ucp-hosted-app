import { UiUserPermissions } from "@repo/shared-utils";
import { RequestHandler, Router } from "express";
import { scopeIncludesAny } from "express-oauth2-jwt-bearer";
import {
  createAggregatorIntegration,
  updateAggregatorIntegration,
} from "../controllers/aggregatorIntegrationController";
import {
  aggregatorIntegrationCreateSchema,
  aggregatorIntegrationUpdateSchema,
  validate,
  validateUserCanCreateAggregatorIntegration,
  validateUserCanEditAggregatorIntegration,
} from "../middlewares/validationMiddleware";
import { validateUIAudience } from "../shared/utils/permissionValidation";

const router = Router();

router.put(
  "/:id",
  [
    validateUIAudience,
    validateUserCanEditAggregatorIntegration,
    validate(aggregatorIntegrationUpdateSchema),
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
    validate(aggregatorIntegrationCreateSchema),
    validateUserCanCreateAggregatorIntegration,
  ],
  scopeIncludesAny(
    `${UiUserPermissions.CREATE_AGGREGATOR_INTEGRATION} ${UiUserPermissions.CREATE_AGGREGATOR_INTEGRATION_AS_AGGREGATOR}`,
  ),
  createAggregatorIntegration as RequestHandler,
);

export default router;
