import express, { Application, RequestHandler } from "express";

import { validateAccessToken } from "@/middleware/authMiddleware";
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
    [validateAccessToken],
    clientsCreate as RequestHandler,
  );
  clientsRouterV1.get(
    "/keys",
    [validateAccessToken],
    clientsGet as RequestHandler,
  );
  clientsRouterV1.delete(
    "/keys",
    [validateAccessToken],
    clientsDelete as RequestHandler,
  );

  clientsRouterV1.post(
    "/keys/rotate",
    [validateAccessToken],
    clientsRotateSecrets as RequestHandler,
  );
};
