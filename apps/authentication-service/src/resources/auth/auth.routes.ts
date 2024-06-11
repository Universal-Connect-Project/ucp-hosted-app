import authRoutesV1 from "@/resources/auth/auth.routes.v1";
import express, { Application } from "express";

const authRouterV1 = express.Router();

function authRoutes(app: Application): void {
  app.use("/v1/auth", authRouterV1);
  authRoutesV1(authRouterV1);
}

export default authRoutes;
