import clientsV1Routes from "@/resources/clients/clients.v1.routes";
import express, { Application } from "express";

const clientsRouterV1 = express.Router();

function clientsRoutes(app: Application): void {
  app.use("/v1/clients", clientsV1Routes);
  clientsV1Routes(clientsRouterV1);
}

export default clientsRoutes;
