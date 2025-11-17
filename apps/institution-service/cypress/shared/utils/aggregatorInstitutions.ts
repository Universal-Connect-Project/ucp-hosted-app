import { PORT } from "../../../src/shared/const";
import { SUPER_USER_ACCESS_TOKEN_ENV } from "../constants/accessTokens";
import { createAuthorizationHeader } from "./authorization";
import {
  AGGREGATOR_INSTITUTIONS_ROUTE,
  AGGREGATOR_INSTITUTIONS_SYNC_ROUTE,
} from "../../../src/shared/consts/routes";

export const syncAggregatorInstitutions = ({
  accessTokenEnv = SUPER_USER_ACCESS_TOKEN_ENV,
  aggregatorName,
  failOnStatusCode = true,
  shouldWaitForCompletion = false,
  timeout = 5000,
}: {
  accessTokenEnv?: string;
  aggregatorName: string;
  failOnStatusCode?: boolean;
  shouldWaitForCompletion?: boolean;
  timeout?: number;
}) => {
  const syncUrl = `http://localhost:${PORT}${AGGREGATOR_INSTITUTIONS_SYNC_ROUTE}`;

  return cy.request({
    body: {
      aggregatorName,
      shouldWaitForCompletion,
    },
    url: syncUrl,
    method: "POST",
    headers: {
      Authorization: createAuthorizationHeader(accessTokenEnv),
    },
    failOnStatusCode,
    timeout,
  });
};

export const getAggregatorInstitutions = ({
  accessTokenEnv = SUPER_USER_ACCESS_TOKEN_ENV,
  qs,
}: {
  accessTokenEnv?: string;
  qs: Record<string, string>;
}) => {
  const url = `http://localhost:${PORT}${AGGREGATOR_INSTITUTIONS_ROUTE}`;

  return cy.request({
    url,
    method: "GET",
    headers: {
      Authorization: createAuthorizationHeader(accessTokenEnv),
    },
    qs,
  });
};

export const createInstitutionAndLink = ({
  accessTokenEnv,
  body,
  failOnStatusCode = true,
}: {
  accessTokenEnv?: string;
  body: Record<string, unknown>;
  failOnStatusCode?: boolean;
}) => {
  const url = `http://localhost:${PORT}${AGGREGATOR_INSTITUTIONS_ROUTE}/createInstitutionAndLink`;

  return cy.request({
    url,
    method: "POST",
    headers: {
      Authorization: createAuthorizationHeader(accessTokenEnv),
    },
    body,
    failOnStatusCode,
  });
};
