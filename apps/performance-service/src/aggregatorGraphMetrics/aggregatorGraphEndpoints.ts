import { RequestHandler, Router } from "express";

import { validateUIAudience } from "../middlewares/validationMiddleware";
import {
  getAggregatorSuccessGraphData,
  getAggregatorDurationGraphData,
} from "./aggregatorGraphHandlers";
import { validatePerformanceGraphRequestSchema } from "@repo/backend-utils";

const router = Router();

router.get(
  "/metrics/aggregatorSuccessGraph",
  [validateUIAudience, validatePerformanceGraphRequestSchema],
  getAggregatorSuccessGraphData as RequestHandler,
);

router.get(
  "/metrics/aggregatorDurationGraph",
  [validateUIAudience, validatePerformanceGraphRequestSchema],
  getAggregatorDurationGraphData as RequestHandler,
);

export default router;
