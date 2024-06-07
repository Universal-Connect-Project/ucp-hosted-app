import express from "express";

import envs from "./config";
import { initExpress } from "./init";
import Auth from "@/resources/auth/auth.service";
import { HttpService } from "@/shared/http/https.model";
import Http from "@/shared/http/http.service";

export const SERVICE_NAME = "ucp-authentication-service";
const PORT = parseInt(envs.PORT, 10);

const app = express();
let httpInstance: HttpService;

initExpress(app);

app.listen(PORT, () => {
  httpInstance = Http.getInstance();
  const auth0Service = Auth.getInstance();
  void auth0Service
    .getAccessToken()
    .then(() => {
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

process.on("SIGINT", () => {
  console.log("\nGracefully shutting down from SIGINT (Ctrl-C)");
  httpInstance.unregisterInterceptor();
  process.exit(0);
});
