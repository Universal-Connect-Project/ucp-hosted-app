import { RequestHandler, Router } from "express";
import { validateUIAudience } from "../shared/utils/permissionValidation";
import { getAggregators } from "./getAggregators";

const router = Router();

router.get("/", [validateUIAudience], getAggregators as RequestHandler);

export default router;
