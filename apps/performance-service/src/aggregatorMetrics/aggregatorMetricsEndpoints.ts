import { RequestHandler, Router } from "express";
import { validateInstitutionServiceAudience } from "../middlewares/validationMiddleware";
import { getAggregatorMetrics } from "./aggregatorMetricsHandlers";
import { validateAggregatorRequestSchema } from "@repo/backend-utils";

const router = Router();

router.get(
  "/metrics/aggregators",
  [validateInstitutionServiceAudience, validateAggregatorRequestSchema],
  getAggregatorMetrics as RequestHandler,
);

export default router;
