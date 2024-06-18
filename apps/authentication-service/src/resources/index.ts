import { Application } from "express";
import { clientsRoutes } from "@/resources/clients/clientsRoutes";

export const initRoutes = (app: Application): void => {
  clientsRoutes(app);
};
