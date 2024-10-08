import { RequestHandler, Router } from "express";
import { validateUIAudience } from "../shared/utils/permissionValidation";
import { getPermissions } from "../controllers/permissionController";

const router = Router();

router.get("/", [validateUIAudience], getPermissions as RequestHandler);

export default router;
