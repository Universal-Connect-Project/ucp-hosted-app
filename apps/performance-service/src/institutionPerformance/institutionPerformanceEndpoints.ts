import { RequestHandler, Router } from "express";
import { validateInstitutionServiceAudience } from "../middlewares/validationMiddleware";
import { getInstitutionSuccessGraph } from "./getInstitutionSuccessGraph";
import { validatePerformanceGraphRequestSchema } from "@repo/backend-utils";
import { getInstitutionDurationGraph } from "./getInstitutionDurationGraph";

const router = Router();

router.get(
  "/metrics/institution/:institutionId/successGraph",
  [validateInstitutionServiceAudience, validatePerformanceGraphRequestSchema],
  getInstitutionSuccessGraph as RequestHandler,
);

router.get(
  "/metrics/institution/:institutionId/durationGraph",
  [validateInstitutionServiceAudience, validatePerformanceGraphRequestSchema],
  getInstitutionDurationGraph as RequestHandler,
);

export default router;
