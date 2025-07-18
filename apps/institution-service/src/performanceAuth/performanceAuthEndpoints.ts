import { RequestHandler, Router } from "express";
import { validatePerformanceServiceAudience } from "../shared/utils/permissionValidation";
import { getAggregators } from "../aggregators/getAggregators";

const router = Router();

router.get(
  "/aggregators",
  [validatePerformanceServiceAudience],
  getAggregators as RequestHandler,
);

export default router;
