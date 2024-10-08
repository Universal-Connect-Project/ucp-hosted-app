import {
  AggregatorIntegrationWithPermissions,
  InstitutionDetail,
  InstitutionDetailWithPermissions,
} from "controllers/institutionController";
import {
  AGGREGATOR_USER_ACCESS_TOKEN_ENV,
  SUPER_USER_ACCESS_TOKEN_ENV,
  USER_ACCESS_TOKEN_ENV,
} from "../shared/constants/accessTokens";
import { createAuthorizationHeader } from "../shared/utils/authorization";
import { runTokenInvalidCheck } from "../support/utils";
import { PORT } from "shared/const";

const checkEditInstitutionPermissions = ({
  accessTokenEnv,
  canEditInstitution,
  institutionId,
}: {
  accessTokenEnv: string;
  canEditInstitution: boolean;
  institutionId: string;
}) => {
  cy.request({
    url: `http://localhost:${PORT}/institutions/${institutionId}`,
    method: "GET",
    headers: {
      Authorization: createAuthorizationHeader(accessTokenEnv),
    },
  }).then(
    (
      response: Cypress.Response<{
        institution: InstitutionDetailWithPermissions;
        0;
      }>,
    ) => {
      expect(response.body.institution.canEditInstitution).to.eq(
        canEditInstitution,
      );
    },
  );
};

const checkCreateAggregatorIntegrationPermissions = ({
  accessTokenEnv,
  canCreateAggregatorIntegration,
  institutionId,
}: {
  accessTokenEnv: string;
  canCreateAggregatorIntegration: boolean;
  institutionId: string;
}) => {
  cy.request({
    url: `http://localhost:${PORT}/institutions/${institutionId}`,
    method: "GET",
    headers: {
      Authorization: createAuthorizationHeader(accessTokenEnv),
    },
  }).then(
    (
      response: Cypress.Response<{
        institution: InstitutionDetailWithPermissions;
        0;
      }>,
    ) => {
      expect(response.body.institution.canCreateAggregatorIntegration).to.eq(
        canCreateAggregatorIntegration,
      );
    },
  );
};

const institutionIdWithOnlyTestExampleBAggregator =
  "aeab64a9-7a78-4c5f-bd27-687f3c8b8492";

const allAggregatorsInstitutionId = "3b561893-e969-4a2c-9e58-3b81b203cdc1";

const institutionIdWithOnlyTestExampleAAggregator =
  "5e498f60-3496-4299-96ed-f8eb328ae8af";

describe("GET /institutions/:id (Institution Details)", () => {
  it("gets Alabama Credit Union in the response on success", () => {
    cy.request({
      url: `http://localhost:${PORT}/institutions/ee6d71dc-e693-4fc3-a775-53c378bc5066`,
      method: "GET",
      headers: {
        Authorization: createAuthorizationHeader(SUPER_USER_ACCESS_TOKEN_ENV),
      },
    }).then(
      (
        response: Cypress.Response<{
          institution: InstitutionDetail;
          0;
        }>,
      ) => {
        expect(response.status).to.eq(200);

        expect(response.body.institution.name).to.eq("Alabama Credit Union");

        expect(response.body).to.have.property("institution");
        expect(response.body.institution).to.be.an("object");

        [
          "id",
          "name",
          "keywords",
          "logo",
          "url",
          "is_test_bank",
          "routing_numbers",
          "createdAt",
          "updatedAt",
          "aggregatorIntegrations",
        ].forEach((key) => {
          expect(response.body.institution).to.have.property(key);
        });

        expect(response.body.institution.aggregatorIntegrations).to.be.an(
          "array",
        );
        response.body.institution.aggregatorIntegrations.forEach(
          (integration) => {
            [
              "id",
              "aggregator_institution_id",
              "supports_oauth",
              "supports_identification",
              "supports_verification",
              "supports_aggregation",
              "supports_history",
            ].forEach((key) => {
              expect(integration).to.have.property(key);
            });

            expect(integration.aggregator).to.be.an("object");

            ["name", "id", "displayName", "logo"].forEach((key) => {
              expect(integration.aggregator).to.have.property(key);
            });
          },
        );
      },
    );
  });

  it("gets a 404 and error response if id doesnt match an institution", () => {
    cy.request({
      url: `http://localhost:${PORT}/institutions/ee6d71dc-e693-4fc3-a775-53c378bc506a`,
      method: "GET",
      headers: {
        Authorization: createAuthorizationHeader(SUPER_USER_ACCESS_TOKEN_ENV),
      },
      failOnStatusCode: false,
    }).then(
      (response: Cypress.Response<{ institution: InstitutionDetail }>) => {
        const institutionResponse =
          response.body as unknown as InstitutionDetailWithPermissions;

        expect(response.status).to.eq(404);

        expect(institutionResponse).to.contain({
          error: "Institution not found",
        });
      },
    );
  });

  describe("edit permissions", () => {
    it("returns that a regular user can't edit the institution", () => {
      checkEditInstitutionPermissions({
        accessTokenEnv: USER_ACCESS_TOKEN_ENV,
        canEditInstitution: false,
        institutionId: institutionIdWithOnlyTestExampleAAggregator,
      });
    });

    it("returns that a super admin can edit the institution", () => {
      checkEditInstitutionPermissions({
        accessTokenEnv: SUPER_USER_ACCESS_TOKEN_ENV,
        canEditInstitution: true,
        institutionId: institutionIdWithOnlyTestExampleAAggregator,
      });
    });

    it("returns that an aggregator can edit the institution if there are no other aggregator integrations", () => {
      checkEditInstitutionPermissions({
        accessTokenEnv: AGGREGATOR_USER_ACCESS_TOKEN_ENV,
        canEditInstitution: true,
        institutionId: institutionIdWithOnlyTestExampleAAggregator,
      });
    });

    it("returns that an aggregator can't edit the institution if there are other aggregator integrations", () => {
      checkEditInstitutionPermissions({
        accessTokenEnv: AGGREGATOR_USER_ACCESS_TOKEN_ENV,
        canEditInstitution: false,
        institutionId: institutionIdWithOnlyTestExampleBAggregator,
      });
    });
  });

  describe("edit aggregatorIntegration permissions", () => {
    const institutionIdWithTestExampleAAndB =
      "7a909e62-98b6-4a34-8725-b2a6a63e830a";

    it("returns that a super admin can edit an aggregator integration", () => {
      cy.request({
        url: `http://localhost:${PORT}/institutions/${institutionIdWithTestExampleAAndB}`,
        method: "GET",
        headers: {
          Authorization: createAuthorizationHeader(SUPER_USER_ACCESS_TOKEN_ENV),
        },
      }).then(
        (
          response: Cypress.Response<{
            institution: InstitutionDetailWithPermissions;
            0;
          }>,
        ) => {
          response.body.institution.aggregatorIntegrations.forEach(
            ({ canEditAggregatorIntegration }) => {
              expect(canEditAggregatorIntegration).to.eq(true);
            },
          );
        },
      );
    });

    it("returns that an aggregator can edit an aggregator integration that is their own, but not for those that aren't their own", () => {
      cy.request({
        url: `http://localhost:${PORT}/institutions/${institutionIdWithTestExampleAAndB}`,
        method: "GET",
        headers: {
          Authorization: createAuthorizationHeader(
            AGGREGATOR_USER_ACCESS_TOKEN_ENV,
          ),
        },
      }).then(
        (
          response: Cypress.Response<{
            institution: InstitutionDetailWithPermissions;
            0;
          }>,
        ) => {
          const findAggregatorIntegrationByName = (name: string) =>
            response.body.institution.aggregatorIntegrations.find(
              ({ aggregator }: AggregatorIntegrationWithPermissions) =>
                name === aggregator.name,
            );

          const testExampleAIntegration =
            findAggregatorIntegrationByName("testExampleA");

          const testExampleBIntegration =
            findAggregatorIntegrationByName("testExampleB");

          console.log(testExampleAIntegration, testExampleBIntegration);

          expect(testExampleAIntegration.canEditAggregatorIntegration).to.eq(
            true,
          );
          expect(testExampleBIntegration.canEditAggregatorIntegration).to.eq(
            false,
          );
        },
      );
    });

    it("returns that a regular user can't edit an aggregator integration", () => {
      cy.request({
        url: `http://localhost:${PORT}/institutions/${institutionIdWithTestExampleAAndB}`,
        method: "GET",
        headers: {
          Authorization: createAuthorizationHeader(USER_ACCESS_TOKEN_ENV),
        },
      }).then(
        (
          response: Cypress.Response<{
            institution: InstitutionDetailWithPermissions;
            0;
          }>,
        ) => {
          response.body.institution.aggregatorIntegrations.forEach(
            ({ canEditAggregatorIntegration }) => {
              expect(canEditAggregatorIntegration).to.eq(false);
            },
          );
        },
      );
    });
  });

  describe("create aggregatorIntegration permissions", () => {
    it("returns that a super admin can create an aggregator integration if there are aggregators without integrations", () => {
      checkCreateAggregatorIntegrationPermissions({
        accessTokenEnv: SUPER_USER_ACCESS_TOKEN_ENV,
        canCreateAggregatorIntegration: true,
        institutionId: institutionIdWithOnlyTestExampleAAggregator,
      });
    });

    it("returns that a super admin can't create an aggregator integration if there aren't aggregators without integrations", () => {
      checkCreateAggregatorIntegrationPermissions({
        accessTokenEnv: SUPER_USER_ACCESS_TOKEN_ENV,
        canCreateAggregatorIntegration: false,
        institutionId: allAggregatorsInstitutionId,
      });
    });

    it("returns that an aggregator can create an aggregator integration if there isn't an integration for their aggregator", () => {
      checkCreateAggregatorIntegrationPermissions({
        accessTokenEnv: AGGREGATOR_USER_ACCESS_TOKEN_ENV,
        canCreateAggregatorIntegration: true,
        institutionId: institutionIdWithOnlyTestExampleBAggregator,
      });
    });

    it("returns that an aggregator can't create an aggregator integration if there is an integration for their aggregator", () => {
      checkCreateAggregatorIntegrationPermissions({
        accessTokenEnv: AGGREGATOR_USER_ACCESS_TOKEN_ENV,
        canCreateAggregatorIntegration: false,
        institutionId: institutionIdWithOnlyTestExampleAAggregator,
      });
    });

    it("returns that a regular user can't create an aggregator integration", () => {
      checkCreateAggregatorIntegrationPermissions({
        accessTokenEnv: USER_ACCESS_TOKEN_ENV,
        canCreateAggregatorIntegration: false,
        institutionId: institutionIdWithOnlyTestExampleAAggregator,
      });
    });
  });

  runTokenInvalidCheck({
    url: `http://localhost:${PORT}/institutions/ee6d71dc-e693-4fc3-a775-53c378bc5066`,
    method: "GET",
  });
});
