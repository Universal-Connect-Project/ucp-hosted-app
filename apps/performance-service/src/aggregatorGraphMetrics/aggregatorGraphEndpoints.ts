import { RequestHandler, Router } from "express";

import { validateInstitutionServiceAudience } from "../middlewares/validationMiddleware";
import {
  getAggregatorSuccessGraphData,
  getAggregatorDurationGraphData,
} from "./aggregatorGraphHandlers";
import { validateAggregatorGraphRequestSchema } from "@repo/backend-utils";

const router = Router();

router.get(
  "/metrics/aggregatorSuccessGraph",
  [validateInstitutionServiceAudience, validateAggregatorGraphRequestSchema],
  getAggregatorSuccessGraphData as RequestHandler,
);

router.get(
  "/metrics/aggregatorDurationGraph",
  [validateInstitutionServiceAudience, validateAggregatorGraphRequestSchema],
  getAggregatorDurationGraphData as RequestHandler,
);

export default router;
