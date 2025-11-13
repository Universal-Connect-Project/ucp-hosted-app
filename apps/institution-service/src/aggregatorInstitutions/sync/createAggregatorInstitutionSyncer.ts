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

export const createAggregatorInstitutionSyncer =
  ({
    aggregatorName,
    fetchAndConvertInstitutionPage,
  }: {
    aggregatorName: string;
    fetchAndConvertInstitutionPage: ({ page }: { page: number }) => Promise<{
      convertedInstitutions: CreationAttributes<AggregatorInstitution>[];
      totalPages: number;
    }>;
  }) =>
  async () => {
    const aggregatorId = (await getAggregatorByName(aggregatorName)).id;

    const firstPage = await fetchAndConvertInstitutionPage({
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
      minimumValidInstitutionCount: 5000,
    });
  };
