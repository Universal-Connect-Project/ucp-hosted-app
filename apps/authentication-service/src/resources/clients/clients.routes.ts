import clientsRoutesV1 from "@/resources/clients/clients.routes.v1";
import express, { Application } from "express";

const clientsRouter = express.Router();

function clientsRoutes(app: Application): void {
  app.use("/v1/clients", clientsRouter);
  clientsRoutesV1(clientsRouter);
}

export default clientsRoutes;
