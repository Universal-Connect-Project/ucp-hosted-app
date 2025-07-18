import { RequestHandler, Router } from "express";
import { validateUIAudience } from "../middlewares/validationMiddleware";
import { getAggregatorMetrics } from "./aggregatorMetricsHandlers";
import { validateAggregatorRequestSchema } from "@repo/backend-utils";

const router = Router();

router.get(
  "/metrics/aggregators",
  [validateUIAudience, validateAggregatorRequestSchema],
  getAggregatorMetrics as RequestHandler,
);

export default router;
