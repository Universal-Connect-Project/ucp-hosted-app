import { AggregatorInstitution } from "../../models/aggregatorInstitution";
import { getAggregatorByName } from "../../shared/aggregators/getAggregatorByName";
import {
  getShouldLimitRequestsForE2E,
  removeMissingAggregatorInstitutions,
} from "./utils";
import * as environment from "../../shared/environment";

describe("utils", () => {
  describe("removeMissingAggregatorInstitutions", () => {
    let finicityAggregatorId: number;

    beforeEach(async () => {
      await AggregatorInstitution.destroy({ force: true, truncate: true });

      finicityAggregatorId = (await getAggregatorByName("finicity"))?.id;
    });

    it("does not remove any institutions if the valid institution count is below the minimum threshold", async () => {
      const existingAggregatorInstitution = await AggregatorInstitution.create({
        aggregatorId: finicityAggregatorId,
        id: "999999",
        name: "Old Institution",
        supportsAccountNumber: false,
        supportsAccountOwner: false,
        supportsBalance: false,
        supportsOAuth: false,
        supportsRewards: false,
        supportsTransactions: false,
        supportsTransactionHistory: false,
        url: "https://www.oldinstitution.com",
      });

      await removeMissingAggregatorInstitutions({
        aggregatorId: finicityAggregatorId,
        aggregatorInstitutionIds: [],
        minimumValidInstitutionCount: 5,
      });

      expect(
        await AggregatorInstitution.findOne({
          where: { id: existingAggregatorInstitution.id },
        }),
      ).not.toBeNull();
    });

    it("removes institutions not in the provided list when valid institution count meets the minimum threshold", async () => {
      const existingAggregatorInstitution = await AggregatorInstitution.create({
        aggregatorId: finicityAggregatorId,
        id: "999999",
        name: "Old Institution",
        supportsAccountNumber: false,
        supportsAccountOwner: false,
        supportsBalance: false,
        supportsOAuth: false,
        supportsRewards: false,
        supportsTransactions: false,
        supportsTransactionHistory: false,
        url: "https://www.oldinstitution.com",
      });

      await removeMissingAggregatorInstitutions({
        aggregatorId: finicityAggregatorId,
        aggregatorInstitutionIds: ["123456", "654321"],
        minimumValidInstitutionCount: 2,
      });

      expect(
        await AggregatorInstitution.findOne({
          where: { id: existingAggregatorInstitution.id },
        }),
      ).toBeNull();
    });
  });

  describe("getShouldLimitRequestsForE2E", () => {
    it("returns true when both e2eLimitRequests and E2E_LIMIT_SYNC_REQUESTS are true", () => {
      jest.spyOn(environment, "getConfig").mockReturnValue({
        E2E_LIMIT_SYNC_REQUESTS: true,
      });

      const result = getShouldLimitRequestsForE2E(true);

      expect(result).toBe(true);
    });

    it("returns false when e2eLimitRequests is false", () => {
      jest.spyOn(environment, "getConfig").mockReturnValue({
        E2E_LIMIT_SYNC_REQUESTS: true,
      });

      const result = getShouldLimitRequestsForE2E(false);

      expect(result).toBe(false);
    });

    it("throws an error when e2eLimitRequests is true but E2E_LIMIT_SYNC_REQUESTS is false", () => {
      jest.spyOn(environment, "getConfig").mockReturnValue({
        E2E_LIMIT_SYNC_REQUESTS: false,
      });

      expect(() => getShouldLimitRequestsForE2E(true)).toThrow(
        "Cannot limit requests unless E2E_LIMIT_SYNC_REQUESTS is enabled",
      );
    });
  });
});
