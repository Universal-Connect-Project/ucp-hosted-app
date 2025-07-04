import { createRequestBodySchemaValidator } from "@repo/backend-utils";
import { WidgetHostPermissions } from "@repo/shared-utils";
import { RequestHandler, Router } from "express";
import { requiredScopes } from "express-oauth2-jwt-bearer";
import {
  createStartEvent,
  updateConnectionPause,
  updateConnectionResume,
  updateSuccessEvent,
} from "../controllers/eventController";
import {
  validateConnectionId,
  validateWidgetAudience,
} from "../middlewares/validationMiddleware";
import { ComboJobTypes } from "@repo/shared-utils";
import Joi from "joi";

const router = Router();

const startEventSchema = Joi.object({
  jobTypes: Joi.array()
    .items(Joi.string().valid(...Object.values(ComboJobTypes)))
    .required(),
  institutionId: Joi.string().required(),
  aggregatorId: Joi.string().required(),
  recordDuration: Joi.boolean().optional(),
});

export const validateStartEventRequest =
  createRequestBodySchemaValidator(startEventSchema);

router.post(
  "/:connectionId/connectionStart",
  [validateWidgetAudience, validateStartEventRequest],
  requiredScopes(WidgetHostPermissions.WRITE_WIDGET_ENDPOINTS),
  createStartEvent as RequestHandler,
);

router.put(
  "/:connectionId/connectionPause",
  [validateWidgetAudience, validateConnectionId],
  requiredScopes(WidgetHostPermissions.WRITE_WIDGET_ENDPOINTS),
  updateConnectionPause as RequestHandler,
);

router.put(
  "/:connectionId/connectionResume",
  [validateWidgetAudience, validateConnectionId],
  requiredScopes(WidgetHostPermissions.WRITE_WIDGET_ENDPOINTS),
  updateConnectionResume as RequestHandler,
);

router.put(
  "/:connectionId/connectionSuccess",
  [validateWidgetAudience, validateConnectionId],
  requiredScopes(WidgetHostPermissions.WRITE_WIDGET_ENDPOINTS),
  updateSuccessEvent as RequestHandler,
);

export default router;
