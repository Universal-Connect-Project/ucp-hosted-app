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
