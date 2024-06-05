import { Application } from "express";
import authRoutes from "@/resources/auth/auth.routes";
import clientsRoutes from "@/resources/clients/clients.routes";

export function initRoutes(app: Application): void {
  authRoutes(app);
  clientsRoutes(app);
}

export default initRoutes;
