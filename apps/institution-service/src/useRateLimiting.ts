import { Application, Request } from "express";
import rateLimit from "express-rate-limit";
import {
  CACHE_LIST_ROUTE,
  PERFORMANCE_AUTH_ROUTE,
} from "./shared/consts/routes";

const createLimiter = (options?: {
  requestLimit?: number;
  skip?: (req: Request) => boolean;
  timeIntervalInMinutes?: number;
}) => {
  const { requestLimit = 100, timeIntervalInMinutes = 1, skip } = options || {};

  return rateLimit({
    handler: (_req, res, _next, _options) =>
      res.status(429).json({ message: "Too many requests" }),
    limit: requestLimit, // Limit to 100 requests per windowMs
    skip,
    windowMs: timeIntervalInMinutes * 60 * 1000, // 1 minute
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

export const useRateLimiting = (app: Application) => {
  if (process.env.DISABLE_RATE_LIMITING !== "true") {
    app.use(defaultLimiter);
    app.use(CACHE_LIST_ROUTE, cacheListLimiter);
  }
};
