import { defineConfig } from "cypress";
import "dotenv/config";

export default defineConfig({
  env: {
    AUTH0_DOMAIN: process.env.AUTH0_DOMAIN,
    AUTH0_WIDGET_AUDIENCE: process.env.AUTH0_WIDGET_AUDIENCE,
    E2E_INSTITUTION_USERNAME: process.env.E2E_INSTITUTION_USERNAME,
    E2E_INSTITUTION_PASSWORD: process.env.E2E_INSTITUTION_PASSWORD,
    WEB_UI_CLIENT_ID: process.env.WEB_UI_CLIENT_ID,
  },
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
