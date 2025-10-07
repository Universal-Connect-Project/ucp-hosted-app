import { Institution } from "../../src/models/institution";
import {
  SUPER_USER_ACCESS_TOKEN_ENV,
  USER_ACCESS_TOKEN_ENV,
} from "../shared/constants/accessTokens";
import { syncAggregatorInstitutions } from "../shared/utils/aggregatorInstitutions";
import {
  createTestAggregatorIntegration,
  deleteAggregatorIntegration,
} from "../shared/utils/aggregatorIntegration";
import {
  createTestInstitution,
  deleteInstitution,
  getInstitution,
} from "../shared/utils/institutions";

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

  describe("with new institution", () => {
    interface TestProps {
      aggregatorInstitutionId: number;
      aggregatorIntegrationId?: number;
      institutionId?: string;
      isAggregatorIntegrationActive?: boolean;
      shouldStartAsActive: boolean;
    }

    const existingAggregatorInstitutionTestProps: TestProps = {
      aggregatorInstitutionId: 10,
      shouldStartAsActive: false,
    };

    const missingAggregatorInstitutionTestProps: TestProps = {
      aggregatorInstitutionId: 134115151515252,
      shouldStartAsActive: true,
    };

    const prepAggregatorIntegration = (testProps: TestProps) => {
      return createTestInstitution(SUPER_USER_ACCESS_TOKEN_ENV).then(
        (response: Cypress.Response<{ institution: Institution }>) => {
          testProps.institutionId = response.body.institution.id;

          return createTestAggregatorIntegration(testProps.institutionId, {
            aggregatorId: finicityAggregatorId,
            aggregatorInstitutionId:
              testProps.aggregatorInstitutionId.toString(),
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
      prepAggregatorIntegration(existingAggregatorInstitutionTestProps).then(
        () => {
          prepAggregatorIntegration(missingAggregatorInstitutionTestProps);
        },
      );
    });

    it("allows a super admin to sync institutions, waits for completion, and updates an aggregator institution from inactive to active if existing, and active to inactive if it no longer exists", () => {
      expect(
        existingAggregatorInstitutionTestProps.isAggregatorIntegrationActive,
      ).to.eq(false);
      expect(
        missingAggregatorInstitutionTestProps.isAggregatorIntegrationActive,
      ).to.eq(true);

      syncAggregatorInstitutions({
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
            },
          );
        });
      });
    });

    const cleanupAggregatorIntegration = (testProps: TestProps) => {
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
      cleanupAggregatorIntegration(existingAggregatorInstitutionTestProps).then(
        () => {
          cleanupAggregatorIntegration(missingAggregatorInstitutionTestProps);
        },
      );
    });
  });

  it("allows a super admin to sync institutions and doesn't wait for completion", () => {
    syncAggregatorInstitutions().then((response) => {
      expect(response.status).to.eq(202);
    });
  });
});
