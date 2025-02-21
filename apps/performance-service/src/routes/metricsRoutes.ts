import { RequestHandler, Router } from "express";
import { validateWidgetAudience } from "../middlewares/validationMiddleware";
import { requiredScopes } from "express-oauth2-jwt-bearer";
import { WidgetHostPermissions } from "@repo/shared-utils";
import { getPerformanceRoutingJson } from "../controllers/metricsController";

const router = Router();

router.get(
  "/allPerformanceData",
  [validateWidgetAudience],
  requiredScopes(WidgetHostPermissions.READ_WIDGET_ENDPOINTS),
  getPerformanceRoutingJson as RequestHandler,
);

export default router;
