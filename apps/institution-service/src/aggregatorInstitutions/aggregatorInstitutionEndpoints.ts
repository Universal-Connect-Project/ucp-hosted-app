import { UiUserPermissions } from "@repo/shared-utils";
import { RequestHandler, Router } from "express";
import { requiredScopes } from "express-oauth2-jwt-bearer";
import { validateUIAudience } from "../shared/utils/permissionValidation";
import { syncInstitutions } from "./sync/syncInstitutions";
import { AGGREGATOR_INSTITUTIONS_SYNC_CHILD_ROUTE } from "../shared/consts/routes";
import { getPaginatedAggregatorInstitutionsHandler } from "./getPaginatedAggregatorInstitutionsHandler";
import { createRequestQueryParamSchemaValidator } from "@repo/backend-utils";
import Joi from "joi";

const router = Router();

router.post(
  AGGREGATOR_INSTITUTIONS_SYNC_CHILD_ROUTE,
  [validateUIAudience],
  requiredScopes(UiUserPermissions.SYNC_AGGREGATOR_INSTITUTIONS),
  syncInstitutions as RequestHandler,
);

export const getPaginatedAggregatorInstitutionsQueryParamValidator =
  createRequestQueryParamSchemaValidator(
    Joi.object({
      aggregatorIds: Joi.string().optional(),
      page: Joi.number().integer().min(1).required(),
      pageSize: Joi.number().integer().min(1).max(100).required(),
      name: Joi.string().optional(),
      shouldIncludeMatched: Joi.boolean().required(),
      sortBy: Joi.string().optional(),
    }),
  );

router.get(
  "/",
  validateUIAudience,
  getPaginatedAggregatorInstitutionsQueryParamValidator, // Should this be super admin only?
  getPaginatedAggregatorInstitutionsHandler as RequestHandler,
);

export default router;
