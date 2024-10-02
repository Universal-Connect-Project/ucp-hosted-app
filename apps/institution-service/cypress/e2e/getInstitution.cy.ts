import {
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

const checkPermissions = ({
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
    const institutionIdWithOnlyTestExampleAAggregator =
      "5e498f60-3496-4299-96ed-f8eb328ae8af";

    it("returns that a user can't edit the institution if they are a regular user", () => {
      checkPermissions({
        accessTokenEnv: USER_ACCESS_TOKEN_ENV,
        canEditInstitution: false,
        institutionId: institutionIdWithOnlyTestExampleAAggregator,
      });
    });

    it("returns that a user can edit the institution if they are a super admin", () => {
      checkPermissions({
        accessTokenEnv: SUPER_USER_ACCESS_TOKEN_ENV,
        canEditInstitution: true,
        institutionId: institutionIdWithOnlyTestExampleAAggregator,
      });
    });

    it("returns that a user can edit the institution if they are an aggregator and there are no other aggregator integrations", () => {
      checkPermissions({
        accessTokenEnv: AGGREGATOR_USER_ACCESS_TOKEN_ENV,
        canEditInstitution: true,
        institutionId: institutionIdWithOnlyTestExampleAAggregator,
      });
    });

    it("returns that a user can't edit the institution if they are an aggregator and there are other aggregator integrations", () => {
      const institutionIdWithOnlyTestExampleBAggregator =
        "aeab64a9-7a78-4c5f-bd27-687f3c8b8492";

      checkPermissions({
        accessTokenEnv: AGGREGATOR_USER_ACCESS_TOKEN_ENV,
        canEditInstitution: false,
        institutionId: institutionIdWithOnlyTestExampleBAggregator,
      });
    });
  });

  runTokenInvalidCheck({
    url: `http://localhost:${PORT}/institutions/ee6d71dc-e693-4fc3-a775-53c378bc5066`,
    method: "GET",
  });
});
