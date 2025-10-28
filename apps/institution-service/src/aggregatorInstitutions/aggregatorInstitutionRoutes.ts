import { UiUserPermissions } from "@repo/shared-utils";
import { RequestHandler, Router } from "express";
import { requiredScopes } from "express-oauth2-jwt-bearer";
import { validateUIAudience } from "../shared/utils/permissionValidation";
import { syncInstitutions } from "./sync/syncInstitutions";
import { AGGREGATOR_INSTITUTIONS_SYNC_CHILD_ROUTE } from "../shared/consts/routes";

const router = Router();

router.post(
  AGGREGATOR_INSTITUTIONS_SYNC_CHILD_ROUTE,
  [validateUIAudience],
  requiredScopes(UiUserPermissions.SYNC_AGGREGATOR_INSTITUTIONS),
  syncInstitutions as RequestHandler,
);

export default router;
