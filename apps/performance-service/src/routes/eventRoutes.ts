import { validateRequestBody } from "@repo/backend-utils";
import { WidgetHostPermissions } from "@repo/shared-utils";
import { RequestHandler, Router } from "express";
import { requiredScopes } from "express-oauth2-jwt-bearer";
import {
  createStartEvent,
  updateConnectionPause,
  updateConnectionResume,
  updateSuccessEvent,
} from "../controllers/eventController";
import { validateWidgetAudience } from "../middlewares/validationMiddleware";
import { JobTypes } from "@repo/shared-utils";
import Joi from "joi";

const router = Router();

export const startEventSchema = Joi.object({
  jobType: Joi.array()
    .items(Joi.string().valid(...Object.values(JobTypes)))
    .required(),
  institutionId: Joi.string().required(),
  aggregatorId: Joi.string().required(),
  clientId: Joi.string().required(),
});

router.post(
  "/:id/connectionStart",
  [validateWidgetAudience, validateRequestBody(startEventSchema)],
  requiredScopes(WidgetHostPermissions.WRITE_WIDGET_ENDPOINTS),
  createStartEvent as RequestHandler,
);

router.put(
  "/:id/connectionPause",
  [validateWidgetAudience],
  requiredScopes(WidgetHostPermissions.WRITE_WIDGET_ENDPOINTS),
  updateConnectionPause as RequestHandler,
);

router.put(
  "/:id/connectionResume",
  [validateWidgetAudience],
  requiredScopes(WidgetHostPermissions.WRITE_WIDGET_ENDPOINTS),
  updateConnectionResume as RequestHandler,
);

router.put(
  "/:id/connectionSuccess",
  [validateWidgetAudience],
  requiredScopes(WidgetHostPermissions.WRITE_WIDGET_ENDPOINTS),
  updateSuccessEvent as RequestHandler,
);

export default router;
