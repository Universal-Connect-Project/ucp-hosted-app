import express from "express";

import envs from "./config";
import { initExpress } from "./init";
import AuthService from "@/resources/auth/auth.service";

export const SERVICE_NAME = "ucp-authentication-service";
const PORT = parseInt(envs.PORT, 10);

const app = express();

initExpress(app);

app.listen(PORT, () => {
  const auth0Service = AuthService.getInstance();
  void auth0Service
    .getAccessToken()
    .then((token: string) => {
      console.log(auth0Service.isTokenExpired(token));
      console.log(`${SERVICE_NAME} is listening on port ${PORT}`);
      console.log("Service is initialized and ready to roll");
    })
    .catch(() => {
      console.error(
        "Could not initialize service. Unable to get access token. Exiting...",
      );
      process.exit(1);
    });
});
