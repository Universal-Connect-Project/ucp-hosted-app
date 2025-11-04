import { UiUserPermissions } from "@repo/shared-utils";
import { RequestHandler, Router } from "express";
import { requiredScopes } from "express-oauth2-jwt-bearer";
import { validateUIAudience } from "../shared/utils/permissionValidation";
import { syncInstitutions } from "./sync/syncInstitutions";
import { AGGREGATOR_INSTITUTIONS_SYNC_CHILD_ROUTE } from "../shared/consts/routes";
import { getPaginatedAggregatorInstitutionsHandler } from "./getPaginatedAggregatorInstitutionsHandler";
import {
  createRequestBodySchemaValidator,
  createRequestQueryParamSchemaValidator,
} from "@repo/backend-utils";
import Joi from "joi";
import { getAggregatorInstitution } from "./getAggregatorInstitution";
import { linkAggregatorInstitution } from "./linkAggregatorInstitution";
import { validateUserCanCreateAggregatorIntegration } from "../middlewares/validationMiddleware";

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
      search: Joi.string().optional(),
      shouldIncludeMatched: Joi.boolean().required(),
      sortBy: Joi.string()
        .pattern(/^(\w+):(ASC|DESC)$/)
        .messages({
          "string.pattern.base":
            'Sort parameter must be in the format "columnName:ORDER", where ORDER is ASC or DESC (e.g., name:ASC).',
        }),
    }),
  );

export const linkAggregatorInstitutionBodyValidator =
  createRequestBodySchemaValidator(
    Joi.object({
      aggregatorId: Joi.number().required(),
      aggregatorInstitutionId: Joi.string().required(),
      institutionId: Joi.string().required(),
    }),
  );

router.get(
  "/",
  validateUIAudience,
  getPaginatedAggregatorInstitutionsQueryParamValidator,
  getPaginatedAggregatorInstitutionsHandler as RequestHandler,
);

router.post(
  "/link",
  [
    validateUIAudience,
    linkAggregatorInstitutionBodyValidator,
    validateUserCanCreateAggregatorIntegration,
  ],
  linkAggregatorInstitution as RequestHandler,
);

router.get(
  "/:aggregatorId/:id",
  validateUIAudience,
  getAggregatorInstitution as RequestHandler,
);

export default router;
