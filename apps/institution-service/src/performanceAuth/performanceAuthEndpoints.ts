import { RequestHandler, Router } from "express";
import { validatePerformanceServiceAudience } from "../shared/utils/permissionValidation";
import { getAggregators } from "../aggregators/getAggregators";
import { createLimiter, getShouldUseRateLimiting } from "../useRateLimiting";

const router = Router();

const performanceAuthAfterAuthenticationLimiter = createLimiter({
  requestLimit: 500,
});

const validatePerformanceServiceAudienceAndRateLimitMiddleware: RequestHandler[] =
  [
    validatePerformanceServiceAudience,
    ...(getShouldUseRateLimiting()
      ? [performanceAuthAfterAuthenticationLimiter]
      : []),
  ];

router.get(
  "/aggregators",
  validatePerformanceServiceAudienceAndRateLimitMiddleware,
  getAggregators as RequestHandler,
);

export default router;
