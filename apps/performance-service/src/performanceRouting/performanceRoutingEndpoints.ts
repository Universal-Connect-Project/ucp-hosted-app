import { WidgetHostPermissions } from "@repo/shared-utils";
import { RequestHandler, Router } from "express";
import { requiredScopes } from "express-oauth2-jwt-bearer";
import { validateWidgetAudience } from "../middlewares/validationMiddleware";
import { getPerformanceRoutingJson } from "./performanceRoutingHandlers";

const router = Router();

router.get(
  "/metrics/allPerformanceData",
  [validateWidgetAudience],
  requiredScopes(WidgetHostPermissions.READ_WIDGET_ENDPOINTS),
  getPerformanceRoutingJson as RequestHandler,
);

export default router;
