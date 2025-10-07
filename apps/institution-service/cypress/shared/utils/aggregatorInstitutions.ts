import { PORT } from "../../../src/shared/const";
import { SUPER_USER_ACCESS_TOKEN_ENV } from "../constants/accessTokens";
import { createAuthorizationHeader } from "./authorization";
import { AGGREGATOR_INSTITUTIONS_SYNC_ROUTE } from "../../../src/shared/consts/routes";

export const syncAggregatorInstitutions = ({
  accessTokenEnv = SUPER_USER_ACCESS_TOKEN_ENV,
  failOnStatusCode = true,
  shouldWaitForCompletion = false,
  timeout = 5000,
} = {}) => {
  const syncUrl = `http://localhost:${PORT}${AGGREGATOR_INSTITUTIONS_SYNC_ROUTE}`;

  return cy.request({
    body: shouldWaitForCompletion ? { shouldWaitForCompletion: true } : {},
    url: syncUrl,
    method: "POST",
    headers: {
      Authorization: createAuthorizationHeader(accessTokenEnv),
    },
    failOnStatusCode,
    timeout,
  });
};
