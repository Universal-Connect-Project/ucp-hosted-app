import { Application, Request } from "express";
import rateLimit from "express-rate-limit";
import {
  CACHE_LIST_ROUTE,
  PERFORMANCE_AUTH_ROUTE,
} from "./shared/consts/routes";

export const getShouldUseRateLimiting = () => {
  return process.env.DISABLE_RATE_LIMITING !== "true";
};

export const createLimiter = (options?: {
  requestLimit?: number;
  skip?: (req: Request) => boolean;
  skipSuccessfulRequests?: boolean;
  timeIntervalInMinutes?: number;
}) => {
  const {
    requestLimit = 100,
    timeIntervalInMinutes = 1,
    skip,
    skipSuccessfulRequests,
  } = options || {};

  return rateLimit({
    handler: (_req, res, _next, _options) =>
      res.status(429).json({ message: "Too many requests" }),
    limit: requestLimit,
    skip,
    skipSuccessfulRequests,
    windowMs: timeIntervalInMinutes * 60 * 1000,
  });
};

const defaultLimiter = createLimiter({
  skip: (req: Request) => {
    return (
      req.path.startsWith(PERFORMANCE_AUTH_ROUTE) ||
      req.path.startsWith(CACHE_LIST_ROUTE)
    );
  },
});

const cacheListLimiter = createLimiter({
  requestLimit: 3,
  timeIntervalInMinutes: 1,
});

const performanceAuthBeforeAuthLimiter = createLimiter({
  skipSuccessfulRequests: true,
});

export const useRateLimiting = (app: Application) => {
  if (getShouldUseRateLimiting()) {
    app.use(defaultLimiter);
    app.use(CACHE_LIST_ROUTE, cacheListLimiter);
    app.use(PERFORMANCE_AUTH_ROUTE, performanceAuthBeforeAuthLimiter);
  }
};
