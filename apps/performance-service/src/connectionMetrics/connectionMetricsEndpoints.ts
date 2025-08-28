import { RequestHandler, Router } from "express";

import { validateUIAudience } from "../middlewares/validationMiddleware";
import { getConnectionPerformanceData } from "./connectionMetricsHandlers";

const router = Router();

router.get(
  "/metrics/connection/:connectionId",
  [validateUIAudience],
  getConnectionPerformanceData as RequestHandler,
);

export default router;
