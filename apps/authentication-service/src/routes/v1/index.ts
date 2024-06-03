import { Application } from "express";
import apiRoutes from "./auth0.route";

export function initRoutes(app: Application): void {
  apiRoutes(app);
}

export default initRoutes;
