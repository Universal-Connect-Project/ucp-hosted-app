import { Aggregator } from "models/aggregator";
import { PORT } from "../../src/shared/const";
import { USER_ACCESS_TOKEN_ENV } from "../shared/constants/accessTokens";
import { createAuthorizationHeader } from "../shared/utils/authorization";
import { runTokenInvalidCheck } from "../support/utils";

describe("/aggregators GET", () => {
  it("returns a list of aggregators for a valid token", () => {
    cy.request({
      url: `http://localhost:${PORT}/aggregators`,
      method: "GET",
      headers: {
        Authorization: createAuthorizationHeader(USER_ACCESS_TOKEN_ENV),
      },
    }).then((response: Cypress.Response<{ aggregators: Aggregator[] }>) => {
      expect(response.status).to.eq(200);

      expect(response.body.aggregators.length).to.be.greaterThan(0);
      response.body.aggregators.forEach((aggregator) => {
        ["id", "name", "displayName", "logo", "createdAt", "updatedAt"].forEach(
          (attribute) => {
            expect(aggregator).to.haveOwnProperty(attribute);
          },
        );
      });
    });
  });

  runTokenInvalidCheck({
    url: `http://localhost:${PORT}/aggregators`,
    method: "GET",
  });
});
