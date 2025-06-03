import { RequestHandler, Router } from "express";
import { validateUIAudience } from "../shared/utils/permissionValidation";
import { validateAggregatorRequestSchema } from "@repo/backend-utils";
import { getAggregators } from "./getAggregators";
import { getAggregatorsWithPerformance } from "./getAggregatorsWithPerformance";

const router = Router();

router.get("/", [validateUIAudience], getAggregators as RequestHandler);

router.get(
  "/performance",
  [validateUIAudience, validateAggregatorRequestSchema],
  getAggregatorsWithPerformance as RequestHandler,
);

export default router;
