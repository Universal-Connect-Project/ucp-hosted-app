import { http, HttpResponse } from "msw";
import { AggregatorIntegration } from "../models/aggregatorIntegration";
import { Institution } from "../models/institution";
import { getAggregatorByName } from "../shared/aggregators/getAggregatorIdByName";
import { finicityInstitutionsPage1 } from "../test/testData/finicityInstitutions";
import { server } from "../test/testServer";
import {
  FETCH_FINICITY_INSTITUTIONS_URL,
  mapFinicityInstitution,
} from "./finicity";
import { syncInstitutions } from "./syncInstitutions";

describe("syncInstitutions", () => {
  describe("finicity institutions", () => {
    let testInstitutionWithMissingAggregatorInstitution: Institution;
    let missingAggregatorIntegration: AggregatorIntegration;
    let testInstitutionWithExistingAggregatorInstitution: Institution;
    let existingAggregatorIntegration: AggregatorIntegration;
    let finicityAggregatorId: number;

    const firstFinicityAggregatorInstitution = mapFinicityInstitution(
      finicityInstitutionsPage1.institutions[0],
    );

    beforeEach(async () => {
      testInstitutionWithMissingAggregatorInstitution =
        await Institution.create({
          name: "Test Bank",
          url: "https://www.testbank.com",
          keywords: ["test", "bank"],
          logo: "https://logo.com",
          is_test_bank: true,
          routing_numbers: ["123456789"],
        });

      finicityAggregatorId = (await getAggregatorByName("finicity"))
        ?.id as number;

      missingAggregatorIntegration = await AggregatorIntegration.create({
        institution_id: testInstitutionWithMissingAggregatorInstitution.id,
        aggregatorId: finicityAggregatorId,
        aggregator_institution_id: "missing_institution_id",
        isActive: true,
        supports_aggregation: true,
        supports_history: true,
        supports_identification: true,
        supports_oauth: true,
        supports_verification: true,
        supportsRewards: true,
        supportsBalance: true,
      });

      testInstitutionWithExistingAggregatorInstitution =
        await Institution.create({
          name: "Test Bank 2",
          url: "https://www.testbank2.com",
          keywords: ["test", "bank2"],
          logo: "https://logo2.com",
          is_test_bank: true,
          routing_numbers: ["987654321"],
        });

      existingAggregatorIntegration = await AggregatorIntegration.create({
        institution_id: testInstitutionWithExistingAggregatorInstitution.id,
        aggregatorId: finicityAggregatorId,
        aggregator_institution_id:
          firstFinicityAggregatorInstitution.aggregatorInstitutionId,
        isActive: false,
        supports_aggregation:
          !firstFinicityAggregatorInstitution.supportsAggregation,
        supports_history: !firstFinicityAggregatorInstitution.supportsHistory,
        supports_identification:
          !firstFinicityAggregatorInstitution.supportsIdentification,
        supports_oauth: !firstFinicityAggregatorInstitution.supportsOAuth,
        supports_verification:
          !firstFinicityAggregatorInstitution.supportsVerification,
        supportsRewards: true,
        supportsBalance: true,
      });
    });

    afterEach(async () => {
      await existingAggregatorIntegration.destroy();
      await testInstitutionWithExistingAggregatorInstitution.destroy();
      await missingAggregatorIntegration.destroy();
      await testInstitutionWithMissingAggregatorInstitution.destroy();
    });

    it("doesn't update finicity aggregator integrations unless there are at least 5000 finicity aggregator institutions", async () => {
      await syncInstitutions();

      await missingAggregatorIntegration.reload();
      await existingAggregatorIntegration.reload();

      expect(missingAggregatorIntegration.isActive).toBe(true);
      expect(existingAggregatorIntegration.isActive).toBe(false);
    });

    it("fetches institutions from finicity, marks missing ones inactive, and updates existing ones and marks them as active if there are at least 5000 aggregator institutions", async () => {
      server.use(
        http.get(FETCH_FINICITY_INSTITUTIONS_URL, () => {
          return HttpResponse.json({
            ...finicityInstitutionsPage1,
            found: 5,
            institutions: [
              ...finicityInstitutionsPage1.institutions,
              ...new Array(5000).fill(0).map((_, index) => ({
                ...finicityInstitutionsPage1.institutions[0],
                id: 1999999 + index,
              })),
            ],
          });
        }),
      );

      const beforeCount = await AggregatorIntegration.count();

      expect(missingAggregatorIntegration.isActive).toBe(true);
      expect(existingAggregatorIntegration.isActive).toBe(false);

      await syncInstitutions();

      await missingAggregatorIntegration.reload();
      await existingAggregatorIntegration.reload();

      const afterCount = await AggregatorIntegration.count();

      expect(afterCount).toEqual(beforeCount);

      expect(existingAggregatorIntegration.supports_aggregation).toBe(
        firstFinicityAggregatorInstitution.supportsAggregation,
      );
      expect(existingAggregatorIntegration.supports_history).toBe(
        firstFinicityAggregatorInstitution.supportsHistory,
      );
      expect(existingAggregatorIntegration.supports_identification).toBe(
        firstFinicityAggregatorInstitution.supportsIdentification,
      );
      expect(existingAggregatorIntegration.supports_oauth).toBe(
        firstFinicityAggregatorInstitution.supportsOAuth,
      );
      expect(existingAggregatorIntegration.supports_verification).toBe(
        firstFinicityAggregatorInstitution.supportsVerification,
      );
      expect(existingAggregatorIntegration.supportsRewards).toBe(false);
      expect(existingAggregatorIntegration.supportsBalance).toBe(false);

      expect(missingAggregatorIntegration.isActive).toBe(false);
      expect(existingAggregatorIntegration.isActive).toBe(true);
    }, 20000);
  });
});
