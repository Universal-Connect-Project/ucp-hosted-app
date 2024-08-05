import { defineConfig } from "cypress";
import "dotenv/config";

export default defineConfig({
  env: {
    PORT: process.env.PORT || 8088,
  },
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
