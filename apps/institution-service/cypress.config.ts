import { defineConfig } from "cypress";
import "./src/dotEnv";
import { PORT } from "./src/shared/const";
import { AggregatorInstitution } from "./src/models/aggregatorInstitution";
import { AggregatorIntegration } from "./src/models/aggregatorIntegration";
import { Institution } from "./src/models/institution";
import { createM2MTokenHandler } from "@repo/backend-utils";
import {
  AUTH0_PERFORMANCE_SERVICE_AUDIENCE,
  AUTH0_WIDGET_AUDIENCE,
} from "@repo/shared-utils";

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

const clearInstitutions = async () => {
  return await Institution.truncate({
    cascade: true,
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
      const domain = config.env.AUTH0_DOMAIN;

      const widgetM2MTokenHandler = createM2MTokenHandler({
        audience: AUTH0_WIDGET_AUDIENCE,
        clientId: config.env.WIDGET_CLIENT_ID,
        clientSecret: config.env.WIDGET_CLIENT_SECRET,
        domain,
        fileName: "institutionServiceWidgetM2ME2E",
      });

      const performanceM2MTokenHandler = createM2MTokenHandler({
        audience: AUTH0_PERFORMANCE_SERVICE_AUDIENCE,
        clientId: config.env.PERFORMANCE_SERVICE_CLIENT_ID,
        clientSecret: config.env.PERFORMANCE_SERVICE_CLIENT_SECRET,
        domain,
        fileName: "institutionServicePerformanceM2ME2E",
      });

      on("task", {
        clearAggregatorInstitutions,
        clearAggregatorIntegrations,
        createAggregatorInstitutions,
        clearInstitutions,
        getPerformanceM2MToken: performanceM2MTokenHandler.getToken,
        getWidgetM2MToken: widgetM2MTokenHandler.getToken,
      });
    },
  },
});
