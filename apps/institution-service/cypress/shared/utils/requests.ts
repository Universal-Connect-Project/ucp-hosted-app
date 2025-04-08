import { USER_ACCESS_TOKEN_ENV } from "../constants/accessTokens";
import { createAuthorizationHeader } from "./authorization";

export const getAggregators = () => {
  return cy.request({
    url: "aggregators",
    method: "GET",
    failOnStatusCode: false,
    headers: {
      Authorization: createAuthorizationHeader(USER_ACCESS_TOKEN_ENV),
    },
  });
};

export const getAggregatorsWithPerformance = ({
  timeFrame,
}: {
  timeFrame?: string;
}) => {
  return cy.request({
    url: "aggregators/performance",
    method: "GET",
    failOnStatusCode: false,
    qs: {
      timeFrame,
    },
    headers: {
      Authorization: createAuthorizationHeader(USER_ACCESS_TOKEN_ENV),
    },
  });
};
