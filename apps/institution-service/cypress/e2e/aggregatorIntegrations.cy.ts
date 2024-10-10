import { UUID } from "crypto";
import { PORT } from "shared/const";
import {
  testExampleAAggregatorId,
  testExampleBAggregatorId,
} from "test/testData/aggregators";
import { InstitutionAttrs, testInstitution } from "test/testData/institutions";
import {
  AGGREGATOR_USER_ACCESS_TOKEN_ENV,
  SUPER_USER_ACCESS_TOKEN_ENV,
} from "../shared/constants/accessTokens";
import { createAuthorizationHeader } from "../shared/utils/authorization";
import {
  createTestInstitution,
  deleteAggregatorIntegration,
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

const testExampleBankToHideId = "7a909e62-98b6-4a34-8725-b2a6a63e830a";
describe("PUT /aggregatorIntegrations/:id (AggregatorIntegration update)", () => {
  let testExampleBInstitutionAggregator: AggregatorIntegration;
  let testExampleAInstitutionAggregator: AggregatorIntegration;

  before(() => {
    cy.request({
      url: `http://localhost:${PORT}/institutions/${testExampleBankToHideId}`,
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
          "An Aggregator cannot edit or delete an aggregatorIntegration belonging to another aggregator",
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

describe("POST /aggregatorIntegrations (Create)", () => {
  let testCaseInstitution: InstitutionAttrs;

  beforeEach(() => {
    cy.request({
      url: `http://localhost:${PORT}/institutions`,
      method: "POST",
      body: {
        ...testInstitution,
      },
      headers: {
        Authorization: createAuthorizationHeader(SUPER_USER_ACCESS_TOKEN_ENV),
      },
    }).then((response: Cypress.Response<InstitutionAttrs>) => {
      expect(response.status).to.eq(201);

      testCaseInstitution = response.body;
    });
  });

  it("should create an aggregatorIntegration with super admin user", () => {
    cy.request({
      url: `http://localhost:${PORT}/aggregatorIntegrations`,
      method: "POST",
      headers: {
        Authorization: createAuthorizationHeader(SUPER_USER_ACCESS_TOKEN_ENV),
      },
      body: {
        institution_id: testCaseInstitution.id,
        aggregatorId: testExampleBAggregatorId,
        aggregator_institution_id: "test_cypress",
        supports_oauth: true,
      },
    }).then(
      (
        response: Cypress.Response<{
          message: string;
          aggregatorIntegration: AggregatorIntegration;
        }>,
      ) => {
        expect(response.status).to.eq(201);

        expect(response.body.message).to.eq(
          "AggregatorIntegration created successfully",
        );

        // cleanup
        deleteAggregatorIntegration({
          aggregatorIntegrationId: response.body.aggregatorIntegration.id,
          token: SUPER_USER_ACCESS_TOKEN_ENV,
        }).then((response: Cypress.Response<object>) => {
          expect(response.status).to.eq(204);
        });
      },
    );
  });

  it("should prevent an aggregator from trying to create an aggregatorIntegration for a different aggregator", () => {
    cy.request({
      url: `http://localhost:${PORT}/aggregatorIntegrations`,
      method: "POST",
      headers: {
        Authorization: createAuthorizationHeader(
          AGGREGATOR_USER_ACCESS_TOKEN_ENV,
        ),
      },
      body: {
        institution_id: testCaseInstitution.id,
        aggregatorId: testExampleBAggregatorId,
        aggregator_institution_id: "test_cypress",
        supports_oauth: true,
      },
      failOnStatusCode: false,
    }).then(
      (
        response: Cypress.Response<{
          error: string;
        }>,
      ) => {
        expect(response.status).to.eq(403);

        expect(response.body.error).to.eq(
          "An Aggregator cannot create an aggregatorIntegration belonging to another aggregator",
        );
      },
    );
  });

  it(`should allow an aggregator to create an integration if it belongs to their aggregator but then 
      prevents creating another integration for the same aggregator/institution`, () => {
    let createdAggregatorIntegrationId: number;
    cy.request({
      url: `http://localhost:${PORT}/aggregatorIntegrations`,
      method: "POST",
      headers: {
        Authorization: createAuthorizationHeader(
          AGGREGATOR_USER_ACCESS_TOKEN_ENV,
        ),
      },
      body: {
        institution_id: testCaseInstitution.id,
        aggregatorId: testExampleAAggregatorId,
        aggregator_institution_id: "test_cypress",
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
        expect(response.status).to.eq(201);

        expect(response.body.message).to.eq(
          "AggregatorIntegration created successfully",
        );

        createdAggregatorIntegrationId = response.body.aggregatorIntegration.id;

        cy.request({
          url: `http://localhost:${PORT}/aggregatorIntegrations`,
          method: "POST",
          headers: {
            Authorization: createAuthorizationHeader(
              AGGREGATOR_USER_ACCESS_TOKEN_ENV,
            ),
          },
          body: {
            institution_id: testCaseInstitution.id,
            aggregatorId: testExampleAAggregatorId,
            aggregator_institution_id: "test_cypress",
            supports_oauth: true,
          },
          failOnStatusCode: false,
        }).then(
          (
            response: Cypress.Response<{
              error: string;
            }>,
          ) => {
            expect(response.status).to.eq(409);

            expect(response.body.error).to.eq(
              "An AggregatorIntegration for that Institution/Aggregator already exists. Cannot duplicate",
            );

            // cleanup
            deleteAggregatorIntegration({
              aggregatorIntegrationId: createdAggregatorIntegrationId,
              token: SUPER_USER_ACCESS_TOKEN_ENV,
            }).then((response: Cypress.Response<object>) => {
              expect(response.status).to.eq(204);
            });
          },
        );
      },
    );
  });

  it("should fail if the institution ID is wrong", () => {
    const institutionIdNotInList = "9fc7bcc3-6550-4a83-8545-e2c221ba62fc";
    cy.request({
      url: `http://localhost:${PORT}/aggregatorIntegrations`,
      method: "POST",
      headers: {
        Authorization: createAuthorizationHeader(SUPER_USER_ACCESS_TOKEN_ENV),
      },
      body: {
        institution_id: institutionIdNotInList,
        aggregatorId: testExampleAAggregatorId,
        aggregator_institution_id: "test_cypress",
        supports_oauth: true,
      },
      failOnStatusCode: false,
    }).then(
      (
        response: Cypress.Response<{
          error: string;
        }>,
      ) => {
        expect(response.status).to.eq(400);

        expect(response.body.error).to.eq(
          "Invalid reference in the field: providers_institution_id_fkey.",
        );
      },
    );
  });
});

describe("DELETE /aggregatorIntegrations/:id", () => {
  let aggregatorIntegrationId: number;
  let testInstitutionId: UUID;

  beforeEach(() => {
    createTestInstitution(SUPER_USER_ACCESS_TOKEN_ENV)
      .then((response: Cypress.Response<{ id: UUID }>) => {
        testInstitutionId = response.body.id;
      })
      .then(() => {
        cy.request({
          url: `http://localhost:${PORT}/aggregatorIntegrations`,
          method: "POST",
          headers: {
            Authorization: createAuthorizationHeader(
              SUPER_USER_ACCESS_TOKEN_ENV,
            ),
          },
          body: {
            institution_id: testInstitutionId,
            aggregatorId: testExampleBAggregatorId,
            aggregator_institution_id: "test_cypress_delete",
            supports_oauth: true,
          },
        }).then(
          (
            response: Cypress.Response<{
              message: string;
              aggregatorIntegration: AggregatorIntegration;
            }>,
          ) => {
            expect(response.status).to.eq(201);

            expect(response.body.message).to.eq(
              "AggregatorIntegration created successfully",
            );
            aggregatorIntegrationId = response.body.aggregatorIntegration.id;
          },
        );
      });
  });

  it("should return 204 when aggregatorIntegration is sucessfully deleted and 404 when not found", () => {
    deleteAggregatorIntegration({
      aggregatorIntegrationId,
      token: SUPER_USER_ACCESS_TOKEN_ENV,
    }).then((response: Cypress.Response<object>) => {
      expect(response.status).to.eq(204);

      deleteAggregatorIntegration({
        aggregatorIntegrationId,
        token: SUPER_USER_ACCESS_TOKEN_ENV,
      }).then((response: Cypress.Response<{ error: string }>) => {
        expect(response.status).to.eq(404);
        expect(response.body.error).to.eq("AggregatorIntegration not found");
      });
    });
  });

  it("shouldn't allow deleting of other aggregator's aggregatorIntegrations", () => {
    deleteAggregatorIntegration({
      aggregatorIntegrationId,
      token: AGGREGATOR_USER_ACCESS_TOKEN_ENV,
    }).then((response: Cypress.Response<{ error: string }>) => {
      expect(response.status).to.eq(403);
      expect(response.body.error).to.eq(
        "An Aggregator cannot edit or delete an aggregatorIntegration belonging to another aggregator",
      );
    });

    // cleanup
    deleteAggregatorIntegration({
      aggregatorIntegrationId,
      token: SUPER_USER_ACCESS_TOKEN_ENV,
    }).then((response: Cypress.Response<{ error: string }>) => {
      expect(response.status).to.eq(204);
    });
  });
});
