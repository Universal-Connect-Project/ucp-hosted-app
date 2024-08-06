import { WidgetHostPermissions } from "@/shared/enums";
import express, { Application, RequestHandler } from "express";

import {
  checkPermission,
  validateAccessToken,
} from "@/middleware/authMiddleware";
import {
  clientsCreate,
  clientsDelete,
  clientsGet,
  clientsRotateSecrets,
} from "@/resources/clients/clientsRoutesHandlersV1";

const clientsRouterV1 = express.Router();

export const clientsRoutes = (app: Application): void => {
  app.use("/v1/clients", clientsRouterV1);

  clientsRouterV1.post(
    "/keys",
    [validateAccessToken, checkPermission(WidgetHostPermissions.CREATE_KEYS)],
    clientsCreate as RequestHandler,
  );
  clientsRouterV1.get(
    "/keys",
    [validateAccessToken, checkPermission(WidgetHostPermissions.READ_KEYS)],
    clientsGet as RequestHandler,
  );
  clientsRouterV1.delete(
    "/keys",
    [validateAccessToken, checkPermission(WidgetHostPermissions.DELETE_KEYS)],
    clientsDelete as RequestHandler,
  );

  clientsRouterV1.post(
    "/keys/rotate",
    [validateAccessToken, checkPermission(WidgetHostPermissions.ROTATE_KEYS)],
    clientsRotateSecrets as RequestHandler,
  );
};
