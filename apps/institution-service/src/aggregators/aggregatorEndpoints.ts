import { RequestHandler, Router } from "express";
import { validateUIAudience } from "../shared/utils/permissionValidation";
import {
  validatePerformanceGraphRequestSchema,
  validateAggregatorRequestSchema,
} from "@repo/backend-utils";
import { getAggregators } from "./getAggregators";
import { getAggregatorsWithPerformance } from "./getAggregatorsWithPerformance";
import { getAggregatorSuccessGraph } from "./getAggregatorSuccessGraph";
import { getAggregatorDurationGraph } from "./getAggregatorDurationGraph";

const router = Router();

router.get("/", [validateUIAudience], getAggregators as RequestHandler);

router.get(
  "/performance",
  [validateUIAudience, validateAggregatorRequestSchema],
  getAggregatorsWithPerformance as RequestHandler,
);

router.get(
  "/successGraph",
  [validateUIAudience, validatePerformanceGraphRequestSchema],
  getAggregatorSuccessGraph as RequestHandler,
);

router.get(
  "/durationGraph",
  [validateUIAudience, validatePerformanceGraphRequestSchema],
  getAggregatorDurationGraph as RequestHandler,
);

export default router;
