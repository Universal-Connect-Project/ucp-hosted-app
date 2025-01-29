import { validateSchema } from "@repo/backend-utils";
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
  startEventSchema,
  validateWidgetAudience,
} from "../middlewares/validationMiddleware";

const router = Router();

router.post(
  "/:id/connectionStart",
  [validateWidgetAudience, validateSchema(startEventSchema)],
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
