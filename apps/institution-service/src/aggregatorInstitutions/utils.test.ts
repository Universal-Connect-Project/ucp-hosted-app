import { AggregatorInstitution } from "../models/aggregatorInstitution";
import { getAggregatorByName } from "../shared/aggregators/getAggregatorByName";
import { removeMissingAggregatorInstitutions } from "./utils";

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
});
