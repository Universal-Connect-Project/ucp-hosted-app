import { Application } from "express";
import apiRoutes from "./api";

export function initRoutes(app: Application): void {
  apiRoutes(app);
}

export default initRoutes;
