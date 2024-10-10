import { Aggregator } from "models/aggregator";
import { PORT } from "../../src/shared/const";
import {
  AGGREGATOR_USER_ACCESS_TOKEN_ENV,
  SUPER_USER_ACCESS_TOKEN_ENV,
  USER_ACCESS_TOKEN_ENV,
} from "../shared/constants/accessTokens";
import { createAuthorizationHeader } from "../shared/utils/authorization";

const getAggregators = (token: string) => {
  return cy.request({
    url: `http://localhost:${PORT}/aggregators`,
    method: "GET",
    headers: {
      Authorization: createAuthorizationHeader(token),
    },
  });
};

describe("/aggregators GET", () => {
  it("returns a list of aggregators for a super admin", () => {
    getAggregators(SUPER_USER_ACCESS_TOKEN_ENV).then(
      (response: Cypress.Response<{ aggregators: Aggregator[] }>) => {
        expect(response.status).to.eq(200);

        expect(response.body.aggregators.length).to.be.greaterThan(0);
        response.body.aggregators.forEach((aggregator) => {
          [
            "id",
            "name",
            "displayName",
            "logo",
            "createdAt",
            "updatedAt",
          ].forEach((attribute) => {
            expect(aggregator).to.haveOwnProperty(attribute);
          });
        });
      },
    );
  });

  it("returns a list of aggregators for a aggregator admin", () => {
    getAggregators(AGGREGATOR_USER_ACCESS_TOKEN_ENV).then(
      (response: Cypress.Response<{ aggregators: Aggregator[] }>) => {
        expect(response.status).to.eq(200);

        expect(response.body.aggregators.length).to.be.greaterThan(0);
        response.body.aggregators.forEach((aggregator) => {
          [
            "id",
            "name",
            "displayName",
            "logo",
            "createdAt",
            "updatedAt",
          ].forEach((attribute) => {
            expect(aggregator).to.haveOwnProperty(attribute);
          });
        });
      },
    );
  });

  it("returns a list of aggregators for a regular user", () => {
    getAggregators(USER_ACCESS_TOKEN_ENV).then(
      (response: Cypress.Response<{ aggregators: Aggregator[] }>) => {
        expect(response.status).to.eq(200);

        expect(response.body.aggregators.length).to.be.greaterThan(0);
        response.body.aggregators.forEach((aggregator) => {
          [
            "id",
            "name",
            "displayName",
            "logo",
            "createdAt",
            "updatedAt",
          ].forEach((attribute) => {
            expect(aggregator).to.haveOwnProperty(attribute);
          });
        });
      },
    );
  });
});
