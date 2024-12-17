import { defineConfig } from "cypress";
import "dotenv/config";

export default defineConfig({
  env: {
    AUTH0_DOMAIN: process.env.AUTH0_DOMAIN,
  },
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
