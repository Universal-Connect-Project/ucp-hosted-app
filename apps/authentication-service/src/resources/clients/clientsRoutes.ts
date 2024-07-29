import express, { Application, RequestHandler } from "express";

import { validateAccessToken } from "@/middleware/authMiddleware";
import {
  clientsCreateV1,
  clientsDeleteV1,
  clientsGetV1,
} from "@/resources/clients/clientsRoutesHandlers";

const clientsRouter = express.Router();

export const clientsRoutes = (app: Application): void => {
  // Clients v1
  app.use("/v1/clients", clientsRouter);

  clientsRouter.post(
    "/keys",
    [validateAccessToken],
    clientsCreateV1 as RequestHandler,
  );
  clientsRouter.get(
    "/keys",
    [validateAccessToken],
    clientsGetV1 as RequestHandler,
  );
  clientsRouter.delete(
    "/keys",
    [validateAccessToken],
    clientsDeleteV1 as RequestHandler,
  );
};
