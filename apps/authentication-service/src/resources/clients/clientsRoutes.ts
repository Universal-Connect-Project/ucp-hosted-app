import express, { Application, RequestHandler } from "express";

import { UiClientPermissions } from "@repo/shared-utils";
import { validateAccessToken } from "@/middleware/authMiddleware";
import {
  clientsCreate,
  clientsDelete,
  clientsGet,
  clientsRotateSecrets,
} from "@/resources/clients/clientsRoutesHandlersV1";
import { requiredScopes } from "express-oauth2-jwt-bearer";

const clientsRouterV1 = express.Router();

export const clientsRoutes = (app: Application): void => {
  app.use("/v1/clients", clientsRouterV1);

  clientsRouterV1.post(
    "/keys",
    [validateAccessToken, requiredScopes(UiClientPermissions.CREATE_KEYS)],
    [
      validateAccessToken,
      requiredScopes(
        (UiClientPermissions as Record<string, string>).CREATE_KEYS,
      ),
    ],
    clientsCreate as RequestHandler,
  );
  clientsRouterV1.get(
    "/keys",
    [validateAccessToken, requiredScopes(UiClientPermissions.READ_KEYS)],
    clientsGet as RequestHandler,
  );
  clientsRouterV1.delete(
    "/keys",
    [validateAccessToken, requiredScopes(UiClientPermissions.DELETE_KEYS)],
    clientsDelete as RequestHandler,
  );
  clientsRouterV1.post(
    "/keys/rotate",
    [validateAccessToken, requiredScopes(UiClientPermissions.ROTATE_KEYS)],
    clientsRotateSecrets as RequestHandler,
  );
};
