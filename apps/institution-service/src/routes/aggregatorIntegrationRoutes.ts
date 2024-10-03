import { UiUserPermissions } from "@repo/shared-utils";
import { RequestHandler, Router } from "express";
import { scopeIncludesAny } from "express-oauth2-jwt-bearer";
import { updateAggregatorIntegration } from "../controllers/aggregatorIntegrationController";
import {
  aggregatorIntegrationUpdateSchema,
  validate,
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

export default router;
