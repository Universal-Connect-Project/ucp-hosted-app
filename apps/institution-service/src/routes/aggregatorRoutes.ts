import { RequestHandler, Router } from "express";
import { getAggregators } from "../controllers/aggregatorController";
import { validateUIAudience } from "../shared/utils/permissionValidation";

const router = Router();

router.get("/", [validateUIAudience], getAggregators as RequestHandler);

export default router;
