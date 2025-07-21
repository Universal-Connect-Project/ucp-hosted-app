import { Aggregator } from "models/aggregator";
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

export const expectLooksLikeAggregators = (
  response: Cypress.Response<{ aggregators: Aggregator[] }>,
) => {
  expect(response.status).to.eq(200);

  expect(response.body.aggregators.length).to.be.greaterThan(0);
  response.body.aggregators.forEach((aggregator) => {
    ["id", "name", "displayName", "logo", "createdAt", "updatedAt"].forEach(
      (attribute) => {
        expect(aggregator).to.haveOwnProperty(attribute);
      },
    );
  });
};
