import { defineConfig } from "cypress";
import "dotenv/config";

export default defineConfig({
  env: {
    CLIENT_ORIGIN_URL: process.env.CLIENT_ORIGIN_URL,
    AUTH0_DOMAIN: process.env.AUTH0_DOMAIN,
    AUTH0_M2M_AUDIENCE: process.env.AUTH0_M2M_AUDIENCE,
    AUTH0_CLIENT_AUDIENCE: process.env.AUTH0_CLIENT_AUDIENCE,
    AUTH0_CLIENT_ID: process.env.AUTH0_CLIENT_ID,
    AUTH0_CLIENT_SECRET: process.env.AUTH0_CLIENT_SECRET,
    E2E_CLIENT_ID: process.env.E2E_CLIENT_ID,
    E2E_CLIENT_SECRET: process.env.E2E_CLIENT_SECRET,
    E2E_USERNAME: process.env.E2E_USERNAME,
    E2E_PASSWORD: process.env.E2E_PASSWORD,
  },
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
