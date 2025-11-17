import { Institution } from "../../../src/models/institution";
import {
  SUPER_USER_ACCESS_TOKEN_ENV,
  USER_ACCESS_TOKEN_ENV,
} from "../../shared/constants/accessTokens";
import { syncAggregatorInstitutions } from "../../shared/utils/aggregatorInstitutions";
import { createTestAggregatorIntegration } from "../../shared/utils/aggregatorIntegration";
import {
  createTestInstitution,
  getInstitution,
} from "../../shared/utils/institutions";

interface TestProps {
  aggregatorId: number;
  aggregatorInstitutionId: string;
  aggregatorIntegrationId?: number;
  institutionId?: string;
  isAggregatorIntegrationActive?: boolean;
  shouldStartAsActive: boolean;
}

const prepAggregatorIntegration = (testProps: TestProps) => {
  return createTestInstitution(SUPER_USER_ACCESS_TOKEN_ENV).then(
    (response: Cypress.Response<{ institution: Institution }>) => {
      testProps.institutionId = response.body.institution.id;

      return createTestAggregatorIntegration(testProps.institutionId, {
        aggregatorId: testProps.aggregatorId,
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

const generateSyncAggregatorInstitutionsTests = ({
  aggregatorId,
  aggregatorInstitutionIdThatShouldMatch,
  aggregatorName,
  existingAggregatorInstitutionId,
  missingAggregatorInstitutionId,
  institutionNameThatShouldMatch,
  institutionUrlThatShouldMatch,
}: {
  aggregatorId: number;
  aggregatorInstitutionIdThatShouldMatch: string;
  aggregatorName: string;
  existingAggregatorInstitutionId: string;
  missingAggregatorInstitutionId: string;
  institutionNameThatShouldMatch: string;
  institutionUrlThatShouldMatch: string;
}) =>
  describe(`sync ${aggregatorName} aggregator institutions`, () => {
    const existingAggregatorInstitutionTestProps: TestProps = {
      aggregatorId,
      aggregatorInstitutionId: existingAggregatorInstitutionId,
      shouldStartAsActive: false,
    };

    const missingAggregatorInstitutionTestProps: TestProps = {
      aggregatorId,
      aggregatorInstitutionId: missingAggregatorInstitutionId,
      shouldStartAsActive: true,
    };

    let institutionIdThatShouldMatch: string;

    beforeEach(() => {
      return cy
        .task("clearAggregatorInstitutions")
        .then(() => cy.task("clearAggregatorIntegrations"))
        .then(() => cy.task("clearInstitutions"))
        .then(() =>
          prepAggregatorIntegration(existingAggregatorInstitutionTestProps),
        )
        .then(() =>
          prepAggregatorIntegration(missingAggregatorInstitutionTestProps),
        )
        .then(() =>
          createTestInstitution(SUPER_USER_ACCESS_TOKEN_ENV, {
            name: institutionNameThatShouldMatch,
            url: institutionUrlThatShouldMatch,
          }).then(
            (response: Cypress.Response<{ institution: Institution }>) => {
              institutionIdThatShouldMatch = response.body.institution.id;
            },
          ),
        );
    });

    afterEach(() =>
      cy
        .task("clearAggregatorInstitutions")
        .then(() => cy.task("clearAggregatorIntegrations"))
        .then(() => cy.task("clearInstitutions")),
    );

    it("allows a super admin to sync institutions, waits for completion, and updates an aggregator institution from inactive to active if existing, and active to inactive if it no longer exists, and matches aggregator institution to institutions", () => {
      expect(
        existingAggregatorInstitutionTestProps.isAggregatorIntegrationActive,
      ).to.eq(false);
      expect(
        missingAggregatorInstitutionTestProps.isAggregatorIntegrationActive,
      ).to.eq(true);

      syncAggregatorInstitutions({
        aggregatorName,
        shouldWaitForCompletion: true,
        timeout: 120000,
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
                  ).to.eq(aggregatorInstitutionIdThatShouldMatch);
                },
              );
            },
          );
        });
      });
    });
  });

describe("aggregator institution syncing", () => {
  it("fails when a non-admin tries to sync institutions", () => {
    syncAggregatorInstitutions({
      accessTokenEnv: USER_ACCESS_TOKEN_ENV,
      aggregatorName: "finicity",
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(403);
    });
  });

  generateSyncAggregatorInstitutionsTests({
    aggregatorId: 2,
    aggregatorInstitutionIdThatShouldMatch: "170778",
    aggregatorName: "finicity",
    existingAggregatorInstitutionId: "10",
    missingAggregatorInstitutionId: "134115151515252",
    institutionNameThatShouldMatch: "Capital One",
    institutionUrlThatShouldMatch: "https://www.capitalone.com",
  });

  generateSyncAggregatorInstitutionsTests({
    aggregatorId: 98,
    aggregatorInstitutionIdThatShouldMatch: "capital_one",
    aggregatorName: "mx",
    existingAggregatorInstitutionId: "us_bank",
    missingAggregatorInstitutionId: "134115151515252",
    institutionNameThatShouldMatch: "Capital One",
    institutionUrlThatShouldMatch: "https://www.capitalone.com",
  });
});
