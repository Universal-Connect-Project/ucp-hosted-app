import { defineConfig } from "cypress";

export default defineConfig({
  env: {
    PORT: 8089,
    CLIENT_ORIGIN_URL: "http://localhost:3000",
    AUTH0_AUDIENCE: "http://localhost:3000",
    AUTH0_DOMAIN: "http://localhost:3000",
  },
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
