import { ConsoleColors } from "@/shared/enums";
import express from "express";

import envs from "./config";
import { initExpress } from "./init";
import { AuthService } from "@/shared/auth/authService";

export const SERVICE_NAME = "ucp-authentication-service";
const PORT = parseInt(envs.PORT, 10);

const app = express();

initExpress(app);

app.listen(PORT, () => {
  const Auth = AuthService.getInstance();

  void Auth.init()
    .then((token: string) => {
      if (envs.ENV === "dev") {
        console.log(`\nToken: ${ConsoleColors.FgGray}${token}`);
      }
      console.log(
        `\n${ConsoleColors.FgMagenta}${SERVICE_NAME} is listening on PORT ${PORT}; ENV=${envs.ENV}`,
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
