/* eslint-disable @typescript-eslint/unbound-method */
import { http, HttpResponse } from "msw";
import { AggregatorIntegration } from "../../models/aggregatorIntegration";
import { Institution } from "../../models/institution";
import { getAggregatorByName } from "../../shared/aggregators/getAggregatorByName";
import { finicityInstitutionsPage1 } from "../../test/testData/finicityInstitutions";
import { server } from "../../test/testServer";
import {
  FETCH_FINICITY_INSTITUTIONS_URL,
  mapFinicityInstitution,
} from "./finicity";
import { syncInstitutions } from "./syncInstitutions";
import { Request, Response } from "express";
import { AggregatorInstitution } from "../../models/aggregatorInstitution";
import { createTestInstitution } from "../../test/createTestInstitution";

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
      await Institution.truncate({ cascade: true });
      await AggregatorIntegration.truncate({ cascade: true });
      await AggregatorInstitution.truncate({ cascade: true });

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

      await AggregatorInstitution.destroy({ force: true, truncate: true });

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
        aggregator_institution_id: firstFinicityAggregatorInstitution.id,
        isActive: false,
        supports_aggregation:
          !firstFinicityAggregatorInstitution.supportsTransactions,
        supports_history:
          !firstFinicityAggregatorInstitution.supportsTransactionHistory,
        supports_identification:
          !firstFinicityAggregatorInstitution.supportsAccountOwner,
        supports_oauth: !firstFinicityAggregatorInstitution.supportsOAuth,
        supports_verification:
          !firstFinicityAggregatorInstitution.supportsAccountNumber,
        supportsRewards: true,
        supportsBalance: !firstFinicityAggregatorInstitution.supportsBalance,
      });
    });

    afterAll(async () => {
      await Institution.truncate({ cascade: true });
      await AggregatorIntegration.truncate({ cascade: true });
      await AggregatorInstitution.truncate({ cascade: true });
    });

    it("runs without a request or response", async () => {
      server.use(
        http.get(FETCH_FINICITY_INSTITUTIONS_URL, () => {
          return HttpResponse.json({
            ...finicityInstitutionsPage1,
            found: 5,
            institutions: [
              ...finicityInstitutionsPage1.institutions,
              ...new Array(20).fill(0).map((_, index) => ({
                ...finicityInstitutionsPage1.institutions[0],
                id: 1999999 + index,
              })),
            ],
          });
        }),
      );

      expect(missingAggregatorIntegration.isActive).toBe(true);
      expect(existingAggregatorIntegration.isActive).toBe(false);

      await syncInstitutions();

      await missingAggregatorIntegration.reload();
      await existingAggregatorIntegration.reload();

      expect(missingAggregatorIntegration.isActive).toBe(false);
      expect(existingAggregatorIntegration.isActive).toBe(true);
    });

    it("fails if any aggregator fails", async () => {
      server.use(
        http.get(FETCH_FINICITY_INSTITUTIONS_URL, () => {
          return new HttpResponse(null, { status: 500 });
        }),
      );

      const req = {
        body: { shouldWaitForCompletion: true },
      } as Request;

      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      } as unknown as Response;

      await syncInstitutions(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        message: "Institution sync completed with errors.",
        errors: ["Failed to sync institutions for finicity"],
      });
    });

    it("responds with a 202 by default", async () => {
      const req = {
        body: {},
      } as Request;

      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      } as unknown as Response;

      await syncInstitutions(req, res);

      expect(res.status).toHaveBeenCalledWith(202);
      expect(res.send).toHaveBeenCalledWith({
        message: "Institution sync started.",
      });
    });

    it("fetches institutions from finicity, marks missing ones inactive, updates existing ones and marks them as active, matches institutions, responds with a 200 if shouldWaitForCompletion", async () => {
      const newInstitution = {
        id: 43782194783921,
        name: "The fellowship of the bank",
        urlHomeApp: "https://www.thefellowshipofthebank.com",
      };

      server.use(
        http.get(FETCH_FINICITY_INSTITUTIONS_URL, () => {
          return HttpResponse.json({
            ...finicityInstitutionsPage1,
            found: 5,
            institutions: [
              ...finicityInstitutionsPage1.institutions,
              newInstitution,
              ...new Array(20).fill(0).map((_, index) => ({
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

      const req = {
        body: { shouldWaitForCompletion: true },
      } as Request;

      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      } as unknown as Response;

      const { institution } = await createTestInstitution({
        institution: {
          name: newInstitution.name,
          url: newInstitution.urlHomeApp,
        },
      });

      await syncInstitutions(req, res);

      const newAggregatorIntegrations =
        await institution.getAggregatorIntegrations();

      expect(newAggregatorIntegrations.length).toBe(1);
      expect(newAggregatorIntegrations[0].aggregator_institution_id).toBe(
        newInstitution.id.toString(),
      );

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith({
        message: "Institution sync completed.",
      });

      await missingAggregatorIntegration.reload();
      await existingAggregatorIntegration.reload();

      const afterCount = await AggregatorIntegration.count();

      expect(afterCount).toEqual(beforeCount + 1);

      expect(existingAggregatorIntegration.supports_aggregation).toBe(
        firstFinicityAggregatorInstitution.supportsTransactions,
      );
      expect(existingAggregatorIntegration.supports_history).toBe(
        firstFinicityAggregatorInstitution.supportsTransactionHistory,
      );
      expect(existingAggregatorIntegration.supports_identification).toBe(
        firstFinicityAggregatorInstitution.supportsAccountOwner,
      );
      expect(existingAggregatorIntegration.supports_oauth).toBe(
        firstFinicityAggregatorInstitution.supportsOAuth,
      );
      expect(existingAggregatorIntegration.supports_verification).toBe(
        firstFinicityAggregatorInstitution.supportsAccountNumber,
      );
      expect(existingAggregatorIntegration.supportsRewards).toBe(false);
      expect(existingAggregatorIntegration.supportsBalance).toBe(
        firstFinicityAggregatorInstitution.supportsBalance,
      );

      expect(missingAggregatorIntegration.isActive).toBe(false);
      expect(existingAggregatorIntegration.isActive).toBe(true);
    }, 20000);
  });
});
