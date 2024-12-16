import { Institution } from "models/institution";
import {
  createTestInstitution,
  deleteInstitution,
  runInvalidPermissionCheck,
  runTokenInvalidCheck,
} from "../support/utils";
import {
  AGGREGATOR_USER_ACCESS_TOKEN_ENV,
  SUPER_USER_ACCESS_TOKEN_ENV,
  USER_ACCESS_TOKEN_ENV,
} from "../shared/constants/accessTokens";
import { createAuthorizationHeader } from "../shared/utils/authorization";
import { PORT } from "shared/const";
import { testExampleAAggregatorId } from "test/testData/aggregators";

describe("DELETE /institutions/:id (Institution delete)", () => {
  it("gets 204 when a super admin deletes", () => {
    createTestInstitution(SUPER_USER_ACCESS_TOKEN_ENV).then(
      (response: Cypress.Response<{ institution: Institution }>) => {
        const newInstitution = response.body.institution;

        cy.request({
          url: `http://localhost:${PORT}/institutions/${newInstitution.id}`,
          method: "DELETE",
          headers: {
            Authorization: createAuthorizationHeader(
              SUPER_USER_ACCESS_TOKEN_ENV,
            ),
          },
        }).then((response: Cypress.Response<{ message: string }>) => {
          expect(response.status).to.eq(204);
        });
      },
    );
  });

  it("gets 204 when an aggregators deletes something without other aggregators", () => {
    createTestInstitution(SUPER_USER_ACCESS_TOKEN_ENV).then(
      (response: Cypress.Response<{ institution: Institution }>) => {
        const newInstitution = response.body.institution;

        cy.request({
          url: `http://localhost:${PORT}/institutions/${newInstitution.id}`,
          method: "DELETE",
          headers: {
            Authorization: createAuthorizationHeader(
              SUPER_USER_ACCESS_TOKEN_ENV,
            ),
          },
        }).then((response: Cypress.Response<{ message: string }>) => {
          expect(response.status).to.eq(204);
        });
      },
    );
  });

  it("should allow an aggregator to delete when it is the only implementation on the institution", () => {
    createTestInstitution(SUPER_USER_ACCESS_TOKEN_ENV).then(
      (response: Cypress.Response<{ institution: Institution }>) => {
        const newInstitution = response.body.institution;

        cy.request({
          url: `http://localhost:${PORT}/aggregatorIntegrations`,
          method: "POST",
          headers: {
            Authorization: createAuthorizationHeader(
              SUPER_USER_ACCESS_TOKEN_ENV,
            ),
          },
          body: {
            institution_id: newInstitution.id,
            aggregatorId: testExampleAAggregatorId,
            aggregator_institution_id: "test_cypress",
            supports_oauth: true,
          },
        }).then((response) => {
          expect(response.status).to.eq(201);

          cy.request({
            url: `http://localhost:${PORT}/institutions/${newInstitution.id}`,
            method: "DELETE",
            headers: {
              Authorization: createAuthorizationHeader(
                AGGREGATOR_USER_ACCESS_TOKEN_ENV,
              ),
            },
            failOnStatusCode: false,
          }).then((response: Cypress.Response<{ error: string }>) => {
            expect(response.status).to.eq(204);
          });
        });
      },
    );
  });

  it("gets 404 when trying to delete an institution that doesnt exist", () => {
    cy.request({
      url: `http://localhost:${PORT}/institutions/df25313d-d78c-458a-94c3-e20fdd2b94ce`,
      method: "DELETE",
      headers: {
        Authorization: createAuthorizationHeader(
          AGGREGATOR_USER_ACCESS_TOKEN_ENV,
        ),
      },
      failOnStatusCode: false,
    }).then((response: Cypress.Response<{ error: string }>) => {
      expect(response.status).to.eq(404);
      expect(response.body.error).to.eq("Institution not found");
    });
  });

  it("should prevent an aggregator from deleting institutions with other aggregator implementations", () => {
    const institutionWithOtherAggregatorImplementationsId =
      "ee6d71dc-e693-4fc3-a775-53c378bc5066"; // Alabama Credit Union
    cy.request({
      url: `http://localhost:${PORT}/institutions/${institutionWithOtherAggregatorImplementationsId}`,
      method: "DELETE",
      headers: {
        Authorization: createAuthorizationHeader(
          AGGREGATOR_USER_ACCESS_TOKEN_ENV,
        ),
      },
      failOnStatusCode: false,
    }).then((response: Cypress.Response<{ error: string }>) => {
      expect(response.status).to.eq(403);
      expect(response.body.error).to.include(
        "Aggregator cannot edit an institution used by other aggregators",
      );
    });
  });

  describe("new institution tests", () => {
    let newInstitutionData: Institution;

    before(() => {
      createTestInstitution(SUPER_USER_ACCESS_TOKEN_ENV).then(
        (response: Cypress.Response<{ institution: Institution }>) => {
          newInstitutionData = response.body.institution;
        },
      );
    });

    after(() => {
      deleteInstitution({
        institutionId: newInstitutionData.id,
      });
    });

    runTokenInvalidCheck({
      url: `http://localhost:${PORT}/institutions/${newInstitutionData?.id}`,
      method: "DELETE",
    });

    runInvalidPermissionCheck({
      url: `http://localhost:${PORT}/institutions/${newInstitutionData?.id}`,
      token_env_var: USER_ACCESS_TOKEN_ENV,
      method: "DELETE",
    });
  });
});
