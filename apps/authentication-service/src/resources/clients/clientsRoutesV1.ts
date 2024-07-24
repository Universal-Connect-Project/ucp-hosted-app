import { RequestHandler, Router } from "express";

import { validateAccessToken } from "@/middleware/authMiddleware";
import {
  clientsCreateV1,
  clientsDeleteV1,
  clientsGetV1,
} from "@/resources/clients/clientsRoutesHandlers";

export const clientsRoutesV1 = (router: Router): void => {
  router.post("/", [validateAccessToken], clientsCreateV1 as RequestHandler);
  router.get("/", [validateAccessToken], clientsGetV1 as RequestHandler);
  router.delete("/", [validateAccessToken], clientsDeleteV1 as RequestHandler);
};
