import { Institution } from "../../../src/models/institution";
import {
  SUPER_USER_ACCESS_TOKEN_ENV,
  USER_ACCESS_TOKEN_ENV,
} from "../../shared/constants/accessTokens";
import { syncAggregatorInstitutions } from "./aggregatorInstitutions";
import {
  createTestAggregatorIntegration,
  deleteAggregatorIntegration,
} from "../../shared/utils/aggregatorIntegration";
import {
  createTestInstitution,
  deleteInstitution,
  getInstitution,
} from "../../shared/utils/institutions";

const finicityAggregatorId = 2;

describe("aggregator institution syncing", () => {
  it("fails when a non-admin tries to sync institutions", () => {
    syncAggregatorInstitutions({
      accessTokenEnv: USER_ACCESS_TOKEN_ENV,
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(403);
    });
  });

  describe("with existing and missing aggregator institutions", () => {
    interface TestProps {
      aggregatorInstitutionId: string;
      aggregatorIntegrationId?: number;
      institutionId?: string;
      isAggregatorIntegrationActive?: boolean;
      shouldStartAsActive: boolean;
    }

    const existingAggregatorInstitutionTestProps: TestProps = {
      aggregatorInstitutionId: "10",
      shouldStartAsActive: false,
    };

    const missingAggregatorInstitutionTestProps: TestProps = {
      aggregatorInstitutionId: "134115151515252",
      shouldStartAsActive: true,
    };

    let institutionIdThatShouldMatch: string;
    let matchedAggregatorIntegrationId: number;

    const prepAggregatorIntegration = (testProps: TestProps) => {
      return createTestInstitution(SUPER_USER_ACCESS_TOKEN_ENV).then(
        (response: Cypress.Response<{ institution: Institution }>) => {
          testProps.institutionId = response.body.institution.id;

          return createTestAggregatorIntegration(testProps.institutionId, {
            aggregatorId: finicityAggregatorId,
            aggregatorInstitutionId: testProps.aggregatorInstitutionId,
            isActive: testProps.shouldStartAsActive,
          }).then(
            (
              response: Cypress.Response<{
                aggregatorIntegration: { id: number; isActive: boolean };
              }>,
            ) => {
              testProps.aggregatorIntegrationId =
                response.body.aggregatorIntegration.id;
              testProps.isAggregatorIntegrationActive =
                response.body.aggregatorIntegration.isActive;
            },
          );
        },
      );
    };

    beforeEach(() => {
      prepAggregatorIntegration(existingAggregatorInstitutionTestProps)
        .then(() =>
          prepAggregatorIntegration(missingAggregatorInstitutionTestProps),
        )
        .then(() =>
          createTestInstitution(SUPER_USER_ACCESS_TOKEN_ENV, {
            name: "Capital One",
            url: "https://www.capitalone.com",
          }).then(
            (response: Cypress.Response<{ institution: Institution }>) => {
              institutionIdThatShouldMatch = response.body.institution.id;
            },
          ),
        );
    });

    it("allows a super admin to sync institutions, waits for completion, and updates an aggregator institution from inactive to active if existing, and active to inactive if it no longer exists, and matches aggregator institution to institutions", () => {
      expect(
        existingAggregatorInstitutionTestProps.isAggregatorIntegrationActive,
      ).to.eq(false);
      expect(
        missingAggregatorInstitutionTestProps.isAggregatorIntegrationActive,
      ).to.eq(true);

      syncAggregatorInstitutions({
        shouldWaitForCompletion: true,
        timeout: 300000,
      }).then((response) => {
        expect(response.status).to.eq(200);

        getInstitution({
          institutionId: existingAggregatorInstitutionTestProps.institutionId,
        }).then((response: Cypress.Response<{ institution: Institution }>) => {
          const institution = response.body.institution;

          const markedAsActive = institution.aggregatorIntegrations[0].isActive;

          expect(markedAsActive).to.eq(true);

          getInstitution({
            institutionId: missingAggregatorInstitutionTestProps.institutionId,
          }).then(
            (response: Cypress.Response<{ institution: Institution }>) => {
              const institution = response.body.institution;

              const markedAsActive =
                institution.aggregatorIntegrations[0].isActive;

              expect(markedAsActive).to.eq(false);

              getInstitution({
                institutionId: institutionIdThatShouldMatch,
              }).then(
                (response: Cypress.Response<{ institution: Institution }>) => {
                  const institution = response.body.institution;

                  expect(institution.aggregatorIntegrations).to.have.length(1);
                  expect(
                    institution.aggregatorIntegrations[0]
                      .aggregator_institution_id,
                  ).to.eq("170778");

                  matchedAggregatorIntegrationId =
                    institution.aggregatorIntegrations[0].id;
                },
              );
            },
          );
        });
      });
    });

    interface CleanupProps {
      institutionId: string;
      aggregatorIntegrationId: number;
    }

    const cleanupAggregatorIntegration = (testProps: CleanupProps) => {
      return deleteAggregatorIntegration({
        aggregatorIntegrationId: testProps.aggregatorIntegrationId,
        token: SUPER_USER_ACCESS_TOKEN_ENV,
      }).then(() => {
        return deleteInstitution({
          institutionId: testProps.institutionId,
        });
      });
    };

    afterEach(() => {
      cleanupAggregatorIntegration(
        existingAggregatorInstitutionTestProps as CleanupProps,
      )
        .then(() => {
          cleanupAggregatorIntegration(
            missingAggregatorInstitutionTestProps as CleanupProps,
          );
        })
        .then(() => {
          cleanupAggregatorIntegration({
            institutionId: institutionIdThatShouldMatch,
            aggregatorIntegrationId: matchedAggregatorIntegrationId,
          });
        });
    });
  });
});
