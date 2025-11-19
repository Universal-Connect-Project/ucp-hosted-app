import { CreationAttributes } from "sequelize";
import { getAggregatorByName } from "../../shared/aggregators/getAggregatorByName";
import { createOrUpdateAggregatorInstitution } from "./createOrUpdateAggregatorInstitution";
import { removeMissingAggregatorInstitutions } from "./utils";
import { AggregatorInstitution } from "../../models/aggregatorInstitution";

const storeInstitutions = async ({
  aggregatorId,
  convertedInstitutions,
}: {
  aggregatorId: number;
  convertedInstitutions: CreationAttributes<AggregatorInstitution>[];
}) => {
  for (const institution of convertedInstitutions) {
    await createOrUpdateAggregatorInstitution({
      aggregatorId,
      ...institution,
    });
  }
};

export type FetchAndConvertInstitutionPage = ({
  e2eLimitRequests,
  page,
}: {
  e2eLimitRequests?: boolean;
  page: number;
}) => Promise<{
  convertedInstitutions: CreationAttributes<AggregatorInstitution>[];
  totalPages: number;
}>;

export const createAggregatorInstitutionSyncer =
  ({
    aggregatorName,
    fetchAndConvertInstitutionPage,
    minimumValidInstitutionCount,
  }: {
    aggregatorName: string;
    fetchAndConvertInstitutionPage: FetchAndConvertInstitutionPage;
    minimumValidInstitutionCount: number;
  }) =>
  async ({ e2eLimitRequests }: { e2eLimitRequests?: boolean }) => {
    const aggregatorId = (await getAggregatorByName(aggregatorName)).id;

    const firstPage = await fetchAndConvertInstitutionPage({
      e2eLimitRequests,
      page: 1,
    });

    await storeInstitutions({
      aggregatorId,
      convertedInstitutions: firstPage.convertedInstitutions,
    });

    const { totalPages } = firstPage;

    const allAggregatorInstitutionIds = [
      ...firstPage.convertedInstitutions.map(({ id }) => id),
    ];

    for (let page = 2; page < totalPages + 1; page++) {
      const { convertedInstitutions } = await fetchAndConvertInstitutionPage({
        e2eLimitRequests,
        page,
      });

      await storeInstitutions({ aggregatorId, convertedInstitutions });

      allAggregatorInstitutionIds.push(
        ...convertedInstitutions.map(({ id }) => id),
      );
    }

    await removeMissingAggregatorInstitutions({
      aggregatorId,
      aggregatorInstitutionIds: allAggregatorInstitutionIds,
      minimumValidInstitutionCount,
    });
  };
