import { defineConfig } from "cypress";
import dotenv from "dotenv";
import path from "path";

dotenv.config({
  path: [
    path.join(__dirname, "./env/secretStaging.env"),
    path.join(__dirname, "./env/staging.env"),
  ],
});

export default defineConfig({
  env: {
    AUTH0_DOMAIN: process.env.AUTH0_DOMAIN,
    AUTH0_CLIENT_ID: process.env.AUTH0_CLIENT_ID,
    AUTH0_CLIENT_SECRET: process.env.AUTH0_CLIENT_SECRET,
  },
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
