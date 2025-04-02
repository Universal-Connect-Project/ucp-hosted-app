import { RequestHandler, Router } from "express";
import { getAggregators } from "../controllers/aggregatorController";
import { validateUIAudience } from "../shared/utils/permissionValidation";
import { validateAggregatorRequestSchema } from "@repo/backend-utils";

const router = Router();

router.get(
  "/",
  [validateUIAudience, validateAggregatorRequestSchema],
  getAggregators as RequestHandler,
);

export default router;
