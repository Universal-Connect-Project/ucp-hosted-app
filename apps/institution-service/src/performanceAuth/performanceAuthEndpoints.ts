import { RequestHandler, Router } from "express";
import { validatePerformanceServiceAudience } from "../shared/utils/permissionValidation";
import { getAggregators } from "../aggregators/getAggregators";
import { createLimiter, getShouldUseRateLimiting } from "../useRateLimiting";
import { getPerformanceAuthInstitutions } from "./getPerformanceAuthInstitutions";

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

router.get(
  "/institutions",
  validatePerformanceServiceAudienceAndRateLimitMiddleware,
  getPerformanceAuthInstitutions as RequestHandler,
);

export default router;
