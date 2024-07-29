import express, { Application, RequestHandler } from "express";

import { validateAccessToken } from "@/middleware/authMiddleware";
import {
  clientsCreateV1,
  clientsDeleteV1,
  clientsGetV1,
  clientsRotateSecretsV1,
} from "@/resources/clients/clientsRoutesHandlersV1";

const clientsRouterV1 = express.Router();

export const clientsRoutes = (app: Application): void => {
  app.use("/v1/clients", clientsRouterV1);

  clientsRouterV1.post(
    "/keys",
    [validateAccessToken],
    clientsCreateV1 as RequestHandler,
  );
  clientsRouterV1.get(
    "/keys",
    [validateAccessToken],
    clientsGetV1 as RequestHandler,
  );
  clientsRouterV1.delete(
    "/keys",
    [validateAccessToken],
    clientsDeleteV1 as RequestHandler,
  );

  clientsRouterV1.post(
    "/keys/rotate",
    [validateAccessToken],
    clientsRotateSecretsV1 as RequestHandler,
  );
};
