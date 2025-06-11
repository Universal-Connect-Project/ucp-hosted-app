import { RequestHandler, Router } from "express";
import { validateUIAudience } from "../shared/utils/permissionValidation";
import {
  validateAggregatorGraphRequestSchema,
  validateAggregatorRequestSchema,
} from "@repo/backend-utils";
import { getAggregators } from "./getAggregators";
import { getAggregatorsWithPerformance } from "./getAggregatorsWithPerformance";
import { getAggregatorSuccessGraph } from "./getAggregatorSuccessGraph";

const router = Router();

router.get("/", [validateUIAudience], getAggregators as RequestHandler);

router.get(
  "/performance",
  [validateUIAudience, validateAggregatorRequestSchema],
  getAggregatorsWithPerformance as RequestHandler,
);

router.get(
  "/successGraph",
  [validateUIAudience, validateAggregatorGraphRequestSchema],
  getAggregatorSuccessGraph as RequestHandler,
);

export default router;
