import { AggregatorInstitution } from "../../../models/aggregatorInstitution";
import { getAggregatorByName } from "../../../shared/aggregators/getAggregatorByName";
import { fakeEnvironment } from "../../../test/testData/environment";
import * as config from "../../../shared/environment";
import { CreationAttributes } from "sequelize";

export const generateSyncAggregatorInstitutionsTests = ({
  aggregatorName,
  expectedFetchError,
  expectedInstitutions,
  setupServerForFailure,
  setupServerForSuccess,
  syncAggregatorInstitutions,
}: {
  aggregatorName: string;
  expectedFetchError: string;
  expectedInstitutions: CreationAttributes<AggregatorInstitution>[];
  setupServerForFailure: () => void;
  setupServerForSuccess: () => void;
  syncAggregatorInstitutions: ({
    e2eLimitRequests,
  }: {
    e2eLimitRequests?: boolean;
  }) => Promise<void>;
}) =>
  describe(`${aggregatorName} syncInstitutions`, () => {
    let aggregatorId: number;

    beforeEach(async () => {
      jest.spyOn(config, "getConfig").mockReturnValue(fakeEnvironment);

      await AggregatorInstitution.destroy({ force: true, truncate: true });

      aggregatorId = (await getAggregatorByName(aggregatorName))?.id;
    });

    afterEach(async () => {
      await AggregatorInstitution.destroy({ force: true, truncate: true });
    });

    it(`removes existing aggregatorInstitutions if they aren't in the updated ${aggregatorName} list`, async () => {
      const existingAggregatorInstitution = await AggregatorInstitution.create({
        aggregatorId,
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

      setupServerForSuccess();

      expect(
        await AggregatorInstitution.findOne({
          where: { id: existingAggregatorInstitution.id },
        }),
      ).not.toBeNull();

      await syncAggregatorInstitutions({});

      expect(
        await AggregatorInstitution.findOne({
          where: { id: existingAggregatorInstitution.id },
        }),
      ).toBeNull();
    }, 20000);

    it(`fetches all pages of institutions from ${aggregatorName}, stores them in the database, when run again it updates the existing records`, async () => {
      expect(aggregatorId).toBeDefined();

      setupServerForSuccess();

      await syncAggregatorInstitutions({});

      for (const institution of expectedInstitutions) {
        const storedInstitution = await AggregatorInstitution.findOne({
          where: {
            aggregatorId,
            id: institution.id,
          },
          raw: true,
        });

        expect(storedInstitution!.name).toBe(institution.name);
        expect(storedInstitution!.url).toBe(institution.url);
        expect(storedInstitution!.supportsAccountOwner).toBe(
          institution.supportsAccountOwner,
        );
        expect(storedInstitution!.supportsAccountNumber).toBe(
          institution.supportsAccountNumber,
        );
        expect(storedInstitution!.supportsBalance).toBe(
          institution.supportsBalance,
        );
        expect(storedInstitution!.supportsOAuth).toBe(
          institution.supportsOAuth,
        );
        expect(storedInstitution!.supportsTransactions).toBe(
          institution.supportsTransactions,
        );
      }

      expect(
        await AggregatorInstitution.count({ where: { aggregatorId } }),
      ).toBe(expectedInstitutions.length);
    });

    it("throws an error if fetching institutions fails", async () => {
      setupServerForFailure();

      await expect(() => syncAggregatorInstitutions({})).rejects.toThrow(
        expectedFetchError,
      );
    });
  });
