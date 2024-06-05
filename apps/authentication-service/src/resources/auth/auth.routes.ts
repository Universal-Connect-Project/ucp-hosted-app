import authV1Routes from "@/resources/auth/auth.v1.routes";
import express, { Application } from "express";

const authRouterV1 = express.Router();

function authRoutes(app: Application): void {
  app.use("/v1/auth", authRouterV1);
  authV1Routes(authRouterV1);
}

export default authRoutes;
