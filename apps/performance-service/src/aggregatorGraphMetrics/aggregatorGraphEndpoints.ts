import { RequestHandler, Router } from "express";

import { validateInstitutionServiceAudience } from "../middlewares/validationMiddleware";
import {
  getAggregatorSuccessGraphData,
  getAggregatorDurationGraphData,
} from "./aggregatorGraphHandlers";
import { validatePerformanceGraphRequestSchema } from "@repo/backend-utils";

const router = Router();

router.get(
  "/metrics/aggregatorSuccessGraph",
  [validateInstitutionServiceAudience, validatePerformanceGraphRequestSchema],
  getAggregatorSuccessGraphData as RequestHandler,
);

router.get(
  "/metrics/aggregatorDurationGraph",
  [validateInstitutionServiceAudience, validatePerformanceGraphRequestSchema],
  getAggregatorDurationGraphData as RequestHandler,
);

export default router;
