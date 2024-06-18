import { Application } from "express";
import clientsRoutes from "@/resources/clients/clientsRoutes";

const initRoutes = (app: Application): void => {
  clientsRoutes(app);
};

export { initRoutes };
