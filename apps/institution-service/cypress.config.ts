import { defineConfig } from "cypress";
import "dotenv/config";

export default defineConfig({
  env: {
    AGGREGATOR_ADMIN_USERNAME: process.env.AGGREGATOR_ADMIN_USERNAME,
    AGGREGATOR_ADMIN_PASSWORD: process.env.AGGREGATOR_ADMIN_PASSWORD,
    AUTH0_DOMAIN: process.env.AUTH0_DOMAIN,
    E2E_INSTITUTION_USERNAME: process.env.E2E_INSTITUTION_USERNAME,
    E2E_INSTITUTION_PASSWORD: process.env.E2E_INSTITUTION_PASSWORD,
    SUPER_ADMIN_USERNAME: process.env.SUPER_ADMIN_USERNAME,
    SUPER_ADMIN_PASSWORD: process.env.SUPER_ADMIN_PASSWORD,
    WEB_UI_CLIENT_ID: process.env.WEB_UI_CLIENT_ID,
  },
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
