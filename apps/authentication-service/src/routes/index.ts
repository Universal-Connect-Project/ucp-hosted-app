import { Application } from "express";
import authRoutes from "@/routes/auth";

export function initRoutes(app: Application): void {
  authRoutes(app);
}

export default initRoutes;
