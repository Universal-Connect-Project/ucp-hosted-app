import { defineConfig } from "cypress";
import "dotenv/config";

export default defineConfig({
  env: {
    AUTH0_DOMAIN: process.env.AUTH0_DOMAIN,
    AUTH0_AUDIENCE: process.env.AUTH0_AUDIENCE,
    AUTH0_WIDGET_AUDIENCE: process.env.AUTH0_WIDGET_AUDIENCE,
    WIDGET_CLIENT_ID: process.env.WIDGET_CLIENT_ID,
    WIDGET_CLIENT_SECRET: process.env.WIDGET_CLIENT_SECRET,
    WEB_UI_CLIENT_ID: process.env.WEB_UI_CLIENT_ID,
    WEB_UI_CLIENT_SECRET: process.env.WEB_UI_CLIENT_SECRET,
    E2E_USERNAME: process.env.E2E_USERNAME,
    E2E_PASSWORD: process.env.E2E_PASSWORD,
  },
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
