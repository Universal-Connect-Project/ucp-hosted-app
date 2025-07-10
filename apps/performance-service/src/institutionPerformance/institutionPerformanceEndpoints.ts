import { RequestHandler, Router } from "express";
import { validateUIAudience } from "../middlewares/validationMiddleware";
import { getInstitutionSuccessGraph } from "./getInstitutionSuccessGraph";
import { validatePerformanceGraphRequestSchema } from "@repo/backend-utils";
import { getInstitutionDurationGraph } from "./getInstitutionDurationGraph";

const router = Router();

router.get(
  "/metrics/institution/:institutionId/successGraph",
  [validateUIAudience, validatePerformanceGraphRequestSchema],
  getInstitutionSuccessGraph as RequestHandler,
);

router.get(
  "/metrics/institution/:institutionId/durationGraph",
  [validateUIAudience, validatePerformanceGraphRequestSchema],
  getInstitutionDurationGraph as RequestHandler,
);

export default router;
