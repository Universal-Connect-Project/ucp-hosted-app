import { defineConfig } from "cypress";
import "./src/dotEnv";
import { PORT } from "./src/shared/const";

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
      // implement node event listeners here
    },
  },
});
