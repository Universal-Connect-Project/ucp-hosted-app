import { RequestHandler, Router } from "express";
import { validateUIAudience } from "../middlewares/validationMiddleware";
import { getInstitutionSuccessGraph } from "./getInstitutionSuccessGraph";
import { validatePerformanceGraphRequestSchema } from "@repo/backend-utils";

const router = Router();

router.get(
  "/metrics/institution/:institutionId/successGraph",
  [validateUIAudience, validatePerformanceGraphRequestSchema],
  getInstitutionSuccessGraph as RequestHandler,
);

export default router;
