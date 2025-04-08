import { RequestHandler, Router } from "express";
import {
  getAggregators,
  getAggregatorsWithPerformance,
} from "../controllers/aggregatorController";
import { validateUIAudience } from "../shared/utils/permissionValidation";
import { validateAggregatorRequestSchema } from "@repo/backend-utils";

const router = Router();

router.get("/", [validateUIAudience], getAggregators as RequestHandler);

router.get(
  "/performance",
  [validateUIAudience, validateAggregatorRequestSchema],
  getAggregatorsWithPerformance as RequestHandler,
);

export default router;
