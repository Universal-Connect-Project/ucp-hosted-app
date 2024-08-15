import express, { Application, RequestHandler } from "express";

import { WidgetHostPermissions } from "@repo/shared-utils";
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
    [
      validateAccessToken,
      requiredScopes(WidgetHostPermissions.CREATE_KEYS as string),
    ],
    clientsCreate as RequestHandler,
  );
  clientsRouterV1.get(
    "/keys",
    [
      validateAccessToken,
      requiredScopes(WidgetHostPermissions.READ_KEYS as string),
    ],
    clientsGet as RequestHandler,
  );
  clientsRouterV1.delete(
    "/keys",
    [
      validateAccessToken,
      requiredScopes(WidgetHostPermissions.DELETE_KEYS as string),
    ],
    clientsDelete as RequestHandler,
  );
  clientsRouterV1.post(
    "/keys/rotate",
    [
      validateAccessToken,
      requiredScopes(WidgetHostPermissions.ROTATE_KEYS as string),
    ],
    clientsRotateSecrets as RequestHandler,
  );
};
