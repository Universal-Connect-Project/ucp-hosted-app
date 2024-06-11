import { Application } from "express";
import clientsRoutes from "@/resources/clients/clients.routes";

const initRoutes = (app: Application): void => {
  clientsRoutes(app);
};

export { initRoutes };
