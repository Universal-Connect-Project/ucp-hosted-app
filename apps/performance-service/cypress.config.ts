import { defineConfig } from "cypress";
import "./src/dotEnv";
import { PORT } from "./src/shared/consts/port";
import { createM2MTokenHandler } from "@repo/backend-utils";
import { AUTH0_WIDGET_AUDIENCE } from "@repo/shared-utils";

export default defineConfig({
  env: {
    AUTH0_DOMAIN: process.env.AUTH0_DOMAIN,
  },
  e2e: {
    baseUrl: `http://localhost:${PORT}`,
    retries: {
      runMode: 1,
      openMode: 0,
    },
    setupNodeEvents(on, config) {
      const clientId = config.env.WIDGET_CLIENT_ID;
      const clientSecret = config.env.WIDGET_CLIENT_SECRET;
      const domain = config.env.AUTH0_DOMAIN;

      const widgetM2MTokenHandler = createM2MTokenHandler({
        audience: AUTH0_WIDGET_AUDIENCE,
        clientId,
        clientSecret,
        domain,
        fileName: "performanceServiceWidgetM2ME2E",
      });

      on("task", {
        getWidgetM2MToken: widgetM2MTokenHandler.getToken,
      });
    },
  },
});
