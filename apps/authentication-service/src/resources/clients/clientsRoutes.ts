import { clientsRoutesV1 } from "@/resources/clients/clientsRoutesV1";
import express, { Application } from "express";

const clientsRouter = express.Router();

export const clientsRoutes = (app: Application): void => {
  app.use("/v1/clients", clientsRouter);
  clientsRoutesV1(clientsRouter);
};
