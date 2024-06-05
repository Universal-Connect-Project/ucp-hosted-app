import express from "express";
import envs from "./config";
import { initExpress } from "./init";
import Auth0Service from "@/resources/auth/auth.service";

export const SERVICE_NAME = "ucp-authentication-service";
const PORT = parseInt(envs.PORT, 10);

const app = express();

initExpress(app);

app.listen(PORT, () => {
  const auth0Service = Auth0Service.getInstance();
  void auth0Service.getAccessToken();
  console.log(`${SERVICE_NAME} is listening on port ${PORT}`);
});
