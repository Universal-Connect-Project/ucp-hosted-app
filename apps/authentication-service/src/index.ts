import express from "express";

import "./config";
import { initExpress } from "./init";
import { getAccessToken } from "./shared/auth/authService";
import { ConsoleColors, PORT } from "./shared/consts";

export const SERVICE_NAME = "ucp-authentication-service";

const app = express();

initExpress(app);

const listeningPort = process.env.PORT || PORT;

app.listen(listeningPort, () => {
  void getAccessToken()
    .then(() => {
      console.log(
        `\n${ConsoleColors.FgMagenta}${SERVICE_NAME} is listening on PORT ${listeningPort};`,
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
  process.exit(0);
});
