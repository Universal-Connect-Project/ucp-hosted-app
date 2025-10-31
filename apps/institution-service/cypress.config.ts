import { defineConfig } from "cypress";
import "./src/dotEnv";
import { PORT } from "./src/shared/const";
import { AggregatorInstitution } from "./src/models/aggregatorInstitution";
import { AggregatorIntegration } from "./src/models/aggregatorIntegration";

const createAggregatorInstitutions = async (
  aggregatorInstitutions: AggregatorInstitution[],
) => {
  return await AggregatorInstitution.bulkCreate(aggregatorInstitutions);
};

const clearAggregatorInstitutions = async () => {
  return await AggregatorInstitution.destroy({
    where: {},
    truncate: true,
    force: true,
  });
};

const clearAggregatorIntegrations = async () => {
  return await AggregatorIntegration.destroy({
    where: {},
    truncate: true,
    force: true,
  });
};

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
      on("task", {
        clearAggregatorInstitutions,
        clearAggregatorIntegrations,
        createAggregatorInstitutions,
      });
    },
  },
});
