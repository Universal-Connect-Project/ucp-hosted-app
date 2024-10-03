import { PORT } from "shared/const";
import {
  AGGREGATOR_USER_ACCESS_TOKEN_ENV,
  SUPER_USER_ACCESS_TOKEN_ENV,
} from "../shared/constants/accessTokens";
import { createAuthorizationHeader } from "../shared/utils/authorization";
import {
  runInvalidPermissionCheck,
  runTokenInvalidCheck,
} from "../support/utils";

interface AggregatorIntegration {
  id: number;
  aggregator_institution_id: string;
  supports_oauth: boolean;
  supports_identification: boolean;
  supports_verification: boolean;
  supports_aggregation: boolean;
  supports_history: boolean;
  isActive: boolean;
}
describe("PUT /aggregatorIntegrations/:id (AggregatorIntegration update)", () => {
  let testExampleBInstitutionAggregator: AggregatorIntegration;
  let testExampleAInstitutionAggregator: AggregatorIntegration;

  before(() => {
    cy.request({
      url: `http://localhost:${PORT}/institutions/7a909e62-98b6-4a34-8725-b2a6a63e830a`,
      method: "GET",
      headers: {
        Authorization: createAuthorizationHeader(SUPER_USER_ACCESS_TOKEN_ENV),
      },
    }).then(
      (
        response: Cypress.Response<{
          institution: {
            aggregatorIntegrations: AggregatorIntegration[];
          };
        }>,
      ) => {
        testExampleBInstitutionAggregator =
          response.body.institution.aggregatorIntegrations.find((aggInt) =>
            aggInt.aggregator_institution_id.includes("testExampleB"),
          );
        testExampleAInstitutionAggregator =
          response.body.institution.aggregatorIntegrations.find((aggInt) =>
            aggInt.aggregator_institution_id.includes("testExampleA"),
          );
      },
    );
  });

  it("updates an institution aggregator with updateable attributes", () => {
    [
      {
        attribute: "supports_oauth",
        value: false,
        status: 200,
      },
      {
        attribute: "supports_oauth",
        value: true,
        status: 200,
      },
      {
        attribute: "supports_identification",
        value: false,
        status: 200,
      },
      {
        attribute: "supports_identification",
        value: true,
        status: 200,
      },
      {
        attribute: "supports_verification",
        value: false,
        status: 200,
      },
      {
        attribute: "supports_verification",
        value: true,
        status: 200,
      },
      {
        attribute: "supports_aggregation",
        value: true,
        status: 200,
      },
      {
        attribute: "supports_aggregation",
        value: false,
        status: 200,
      },
      {
        attribute: "supports_history",
        value: false,
        status: 200,
      },
      {
        attribute: "supports_history",
        value: true,
        status: 200,
      },
      {
        attribute: "isActive",
        value: false,
        status: 200,
      },
      {
        attribute: "isActive",
        value: true,
        status: 200,
      },
      {
        attribute: "aggregator_institution_id",
        value: `testExampleB-${Math.floor(Math.random() * 100)}`,
        status: 200,
      },
      {
        attribute: "institution_id",
        value: "junk",
        status: 400,
      },
    ].forEach((testCase) => {
      const testBody = {};
      testBody[testCase.attribute] = testCase.value;

      cy.request({
        url: `http://localhost:${PORT}/aggregatorIntegrations/${testExampleBInstitutionAggregator.id}`,
        method: "PUT",
        headers: {
          Authorization: createAuthorizationHeader(SUPER_USER_ACCESS_TOKEN_ENV),
        },
        body: testBody,
        failOnStatusCode: false,
      }).then(
        (
          response: Cypress.Response<{
            aggregatorIntegration: AggregatorIntegration;
          }>,
        ) => {
          if (testCase.status === 200) {
            expect(response.status).to.eq(200);

            expect(
              response.body.aggregatorIntegration[testCase.attribute],
            ).to.eq(testCase.value);
          } else {
            expect(response.status).to.eq(testCase.status);
          }
        },
      );
    });
  });

  it("should prevent an aggregator from updating an aggregatorIntegration from a different aggregator", () => {
    cy.request({
      url: `http://localhost:${PORT}/aggregatorIntegrations/${testExampleBInstitutionAggregator.id}`,
      method: "PUT",
      headers: {
        Authorization: createAuthorizationHeader(
          AGGREGATOR_USER_ACCESS_TOKEN_ENV,
        ),
      },
      body: {
        supports_oauth: true,
      },
      failOnStatusCode: false,
    }).then(
      (
        response: Cypress.Response<{
          error: string;
          aggregatorIntegration: AggregatorIntegration;
        }>,
      ) => {
        expect(response.status).to.eq(403);

        expect(response.body.error).to.eq(
          "An Aggregator cannot edit an aggregatorIntegration belonging to another aggregator",
        );
      },
    );
  });

  it("should allow an aggregator to update an aggregatorIntegration from a their aggregator", () => {
    cy.request({
      url: `http://localhost:${PORT}/aggregatorIntegrations/${testExampleAInstitutionAggregator.id}`,
      method: "PUT",
      headers: {
        Authorization: createAuthorizationHeader(
          AGGREGATOR_USER_ACCESS_TOKEN_ENV,
        ),
      },
      body: {
        supports_oauth: true,
      },
      failOnStatusCode: false,
    }).then(
      (
        response: Cypress.Response<{
          message: string;
          aggregatorIntegration: AggregatorIntegration;
        }>,
      ) => {
        expect(response.status).to.eq(200);

        expect(response.body.message).to.eq(
          "AggregatorIntegration updated successfully",
        );
      },
    );
  });

  runTokenInvalidCheck({
    url: `http://localhost:${PORT}/aggregatorIntegrations/${testExampleBInstitutionAggregator?.id}`,
    method: "PUT",
  });

  runInvalidPermissionCheck({
    url: `http://localhost:${PORT}/aggregatorIntegrations/${testExampleBInstitutionAggregator?.id}`,
    token_env_var: "USER_ACCESS_TOKEN",
    method: "PUT",
  });
});
