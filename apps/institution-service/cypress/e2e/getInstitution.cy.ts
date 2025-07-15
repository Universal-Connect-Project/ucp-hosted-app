import {
  InstitutionPermissions,
  InstitutionResponse,
} from "institutions/consts";
import { PORT } from "shared/const";
import {
  AGGREGATOR_USER_ACCESS_TOKEN_ENV,
  SUPER_USER_ACCESS_TOKEN_ENV,
  USER_ACCESS_TOKEN_ENV,
} from "../shared/constants/accessTokens";
import { createAuthorizationHeader } from "../shared/utils/authorization";
import { runTokenInvalidCheck } from "../support/utils";
import {
  mxAggregatorId,
  sophtronAggregatorId,
} from "test/testData/aggregators";
import {
  createTestInstitutionAndAddIntegration,
  createTestInstitutionWithAllAggregators,
  deleteInstitution,
} from "../shared/utils/institutions";
import {
  AggregatorIntegrationResponse,
  InstitutionDetail,
} from "institutions/consts";

const checkEditAndDeleteInstitutionPermissions = ({
  accessTokenEnv,
  canActOnInstitution,
  institutionId,
}: {
  accessTokenEnv: string;
  canActOnInstitution: boolean;
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
        institution: InstitutionDetail;
        permissions: InstitutionPermissions;
      }>,
    ) => {
      expect(response.body.permissions.canEditInstitution).to.eq(
        canActOnInstitution,
      );
      expect(response.body.permissions.canDeleteInstitution).to.eq(
        canActOnInstitution,
      );
    },
  );
};

const checkCreateAggregatorIntegrationPermissions = ({
  accessTokenEnv,
  canCreateAggregatorIntegration,
  hasAccessToAllAggregators,
  institutionId,
}: {
  accessTokenEnv: string;
  canCreateAggregatorIntegration: boolean;
  hasAccessToAllAggregators?: boolean;
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
        institution: InstitutionDetail;
        permissions: InstitutionPermissions;
      }>,
    ) => {
      if (canCreateAggregatorIntegration) {
        expect(
          response.body.permissions.aggregatorsThatCanBeAdded.length,
        ).to.be.greaterThan(0);
      } else {
        expect(
          response.body.permissions.aggregatorsThatCanBeAdded.length,
        ).to.eq(0);
      }

      expect(response.body.permissions.hasAccessToAllAggregators).to.eq(
        hasAccessToAllAggregators,
      );
    },
  );
};

describe("GET /institutions/:id (Institution Details)", () => {
  let institutionIdWithOnlyMXAggregator: string;
  let institutionIdWithOnlySophtronAggregator: string;
  let institutionIdWithAllAggregators: string;

  before(() => {
    createTestInstitutionAndAddIntegration(mxAggregatorId).then(
      (institutionId) => {
        institutionIdWithOnlyMXAggregator = institutionId;

        createTestInstitutionAndAddIntegration(sophtronAggregatorId).then(
          (sophtronInstitutionId) => {
            institutionIdWithOnlySophtronAggregator = sophtronInstitutionId;

            createTestInstitutionWithAllAggregators().then(
              (allAggregatorsId) => {
                institutionIdWithAllAggregators = allAggregatorsId;
              },
            );
          },
        );
      },
    );
  });

  after(() => {
    deleteInstitution({ institutionId: institutionIdWithOnlyMXAggregator });
    deleteInstitution({
      institutionId: institutionIdWithOnlySophtronAggregator,
    });
    deleteInstitution({ institutionId: institutionIdWithAllAggregators });
  });

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
              "supportsRewards",
              "supportsBalance",
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
          response.body as unknown as InstitutionResponse;

        expect(response.status).to.eq(404);

        expect(institutionResponse).to.contain({
          error: "Institution not found",
        });
      },
    );
  });

  describe("edit/delete permissions", () => {
    it("returns that a regular user can't edit/delete the institution", () => {
      checkEditAndDeleteInstitutionPermissions({
        accessTokenEnv: USER_ACCESS_TOKEN_ENV,
        canActOnInstitution: false,
        institutionId: institutionIdWithOnlyMXAggregator,
      });
    });

    it("returns that a super admin can edit/delete the institution", () => {
      checkEditAndDeleteInstitutionPermissions({
        accessTokenEnv: SUPER_USER_ACCESS_TOKEN_ENV,
        canActOnInstitution: true,
        institutionId: institutionIdWithOnlyMXAggregator,
      });
    });

    it("returns that an aggregator can edit/delete the institution if there are no other aggregator integrations", () => {
      checkEditAndDeleteInstitutionPermissions({
        accessTokenEnv: AGGREGATOR_USER_ACCESS_TOKEN_ENV,
        canActOnInstitution: true,
        institutionId: institutionIdWithOnlyMXAggregator,
      });
    });

    it("returns that an aggregator can't edit/delete the institution if there are other aggregator integrations", () => {
      checkEditAndDeleteInstitutionPermissions({
        accessTokenEnv: AGGREGATOR_USER_ACCESS_TOKEN_ENV,
        canActOnInstitution: false,
        institutionId: institutionIdWithOnlySophtronAggregator,
      });
    });
  });

  describe("edit/delete aggregatorIntegration permissions", () => {
    it("returns that a super admin can edit or delete an aggregator integration", () => {
      cy.request({
        url: `http://localhost:${PORT}/institutions/${institutionIdWithAllAggregators}`,
        method: "GET",
        headers: {
          Authorization: createAuthorizationHeader(SUPER_USER_ACCESS_TOKEN_ENV),
        },
      }).then(
        (
          response: Cypress.Response<{
            institution: InstitutionDetail;
            permissions: InstitutionPermissions;
          }>,
        ) => {
          response.body.institution.aggregatorIntegrations.forEach(({ id }) => {
            const aggregatorIntegrationPermissionsMap =
              response.body.permissions.aggregatorIntegrationPermissionsMap;

            expect(aggregatorIntegrationPermissionsMap[id].canEdit).to.eq(true);
            expect(aggregatorIntegrationPermissionsMap[id].canDelete).to.eq(
              true,
            );
          });
        },
      );
    });

    it("returns that an aggregator can edit/delete an aggregator integration that is their own, but not for those that aren't their own", () => {
      cy.request({
        url: `http://localhost:${PORT}/institutions/${institutionIdWithAllAggregators}`,
        method: "GET",
        headers: {
          Authorization: createAuthorizationHeader(
            AGGREGATOR_USER_ACCESS_TOKEN_ENV,
          ),
        },
      }).then(
        (
          response: Cypress.Response<{
            institution: InstitutionDetail;
            permissions: InstitutionPermissions;
          }>,
        ) => {
          const findAggregatorIntegrationByName = (name: string) =>
            response.body.institution.aggregatorIntegrations.find(
              ({ aggregator }: AggregatorIntegrationResponse) =>
                name === aggregator.name,
            );

          const aggregatorIntegrationPermissionsMap =
            response.body.permissions.aggregatorIntegrationPermissionsMap;

          const mxIntegration = findAggregatorIntegrationByName("mx");

          const sophtronIntegration =
            findAggregatorIntegrationByName("sophtron");

          expect(
            aggregatorIntegrationPermissionsMap[mxIntegration.id].canEdit,
          ).to.eq(true);
          expect(
            aggregatorIntegrationPermissionsMap[mxIntegration.id].canDelete,
          ).to.eq(true);
          expect(
            aggregatorIntegrationPermissionsMap[sophtronIntegration.id].canEdit,
          ).to.eq(false);
          expect(
            aggregatorIntegrationPermissionsMap[sophtronIntegration.id]
              .canDelete,
          ).to.eq(false);
        },
      );
    });

    it("returns that a regular user can't edit/delete an aggregator integration", () => {
      cy.request({
        url: `http://localhost:${PORT}/institutions/${institutionIdWithAllAggregators}`,
        method: "GET",
        headers: {
          Authorization: createAuthorizationHeader(USER_ACCESS_TOKEN_ENV),
        },
      }).then(
        (
          response: Cypress.Response<{
            institution: InstitutionDetail;
            permissions: InstitutionPermissions;
          }>,
        ) => {
          response.body.institution.aggregatorIntegrations.forEach(({ id }) => {
            const aggregatorIntegrationPermissionsMap =
              response.body.permissions.aggregatorIntegrationPermissionsMap;

            expect(aggregatorIntegrationPermissionsMap[id].canEdit).to.eq(
              false,
            );
            expect(aggregatorIntegrationPermissionsMap[id].canDelete).to.eq(
              false,
            );
          });
        },
      );
    });
  });

  describe("create aggregatorIntegration permissions", () => {
    it("returns that a super admin can create an aggregator integration if there are aggregators without integrations", () => {
      checkCreateAggregatorIntegrationPermissions({
        accessTokenEnv: SUPER_USER_ACCESS_TOKEN_ENV,
        canCreateAggregatorIntegration: true,
        hasAccessToAllAggregators: true,
        institutionId: institutionIdWithOnlyMXAggregator,
      });
    });

    it("returns that a super admin can't create an aggregator integration if all aggregators already have integrations", () => {
      checkCreateAggregatorIntegrationPermissions({
        accessTokenEnv: SUPER_USER_ACCESS_TOKEN_ENV,
        canCreateAggregatorIntegration: false,
        hasAccessToAllAggregators: true,
        institutionId: institutionIdWithAllAggregators,
      });
    });

    it("returns that an aggregator can create an aggregator integration if there isn't an integration for their aggregator", () => {
      checkCreateAggregatorIntegrationPermissions({
        accessTokenEnv: AGGREGATOR_USER_ACCESS_TOKEN_ENV,
        canCreateAggregatorIntegration: true,
        institutionId: institutionIdWithOnlySophtronAggregator,
      });
    });

    it("returns that an aggregator can't create an aggregator integration if there is an integration for their aggregator", () => {
      checkCreateAggregatorIntegrationPermissions({
        accessTokenEnv: AGGREGATOR_USER_ACCESS_TOKEN_ENV,
        canCreateAggregatorIntegration: false,
        institutionId: institutionIdWithOnlyMXAggregator,
      });
    });

    it("returns that a regular user can't create an aggregator integration", () => {
      checkCreateAggregatorIntegrationPermissions({
        accessTokenEnv: USER_ACCESS_TOKEN_ENV,
        canCreateAggregatorIntegration: false,
        institutionId: institutionIdWithOnlyMXAggregator,
      });
    });
  });

  runTokenInvalidCheck({
    url: `http://localhost:${PORT}/institutions/ee6d71dc-e693-4fc3-a775-53c378bc5066`,
    method: "GET",
  });
});
