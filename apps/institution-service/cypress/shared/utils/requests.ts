import { USER_ACCESS_TOKEN_ENV } from "../constants/accessTokens";
import { createAuthorizationHeader } from "./authorization";

export const getAggregators = ({ timeFrame }: { timeFrame?: string }) => {
  return cy.request({
    url: `aggregators`,
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
