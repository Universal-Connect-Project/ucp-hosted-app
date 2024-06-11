import { ConsoleColors } from "@/shared/enums";
import express from "express";

import envs from "./config";
import { initExpress } from "./init";
import AuthService from "@/shared/auth/auth.service";
import { IHttpService } from "@/shared/http/https.model";
import HttpService from "@/shared/http/http.service";

export const SERVICE_NAME = "ucp-authentication-service";
const PORT = parseInt(envs.PORT, 10);

const app = express();
let Http: IHttpService;

initExpress(app);

app.listen(PORT, () => {
  Http = HttpService.getInstance();
  const Auth = AuthService.getInstance();

  void Auth.getAccessToken()
    .then(() => {
      console.log(
        `\n${ConsoleColors.FgMagenta}${SERVICE_NAME} is listening on port ${PORT}`,
      );
      console.log(
        `${ConsoleColors.FgGreen}Service is initialized and ready to roll${ConsoleColors.Reset}`,
      );
    })
    .catch(() => {
      console.error(
        `${ConsoleColors.FgRed}Could not initialize service. Unable to get access token. Exiting...${ConsoleColors.Reset}`,
      );
      process.exit(1);
    });
});

process.on("SIGINT", () => {
  console.log(
    `\n${ConsoleColors.FgYellow}Gracefully shutting down from SIGINT (Ctrl-C)${ConsoleColors.Reset}`,
  );
  Http.unregisterInterceptor();
  process.exit(0);
});
