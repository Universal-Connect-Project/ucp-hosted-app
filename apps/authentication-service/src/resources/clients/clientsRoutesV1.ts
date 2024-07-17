import { Router } from "express";

import { validateAccessToken } from "@/middleware/authMiddleware";
import {
  routeClientCreate,
  routeClientDelete,
  routeClientGet,
} from "@/resources/clients/clientsRoutesHandlers";

// TODO: Extract route handlers to a separate file
export const clientsRoutesV1 = (router: Router): void => {
  router.post("/", [validateAccessToken], routeClientCreate);
  router.get("/", [validateAccessToken], routeClientGet);
  router.delete("/", [validateAccessToken], routeClientDelete);
};
