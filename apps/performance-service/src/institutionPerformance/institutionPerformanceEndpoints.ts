import { RequestHandler, Router } from "express";
import { validateUIAudience } from "../middlewares/validationMiddleware";
import { getInstitutionSuccessGraph } from "./getInstitutionSuccessGraph";

const router = Router();

router.get(
  "/metrics/institution/:institutionId/successGraph",
  [validateUIAudience],
  getInstitutionSuccessGraph as RequestHandler,
);

export default router;
