import { getAggregatorByName } from "../../shared/aggregators/getAggregatorByName";
import { removeMissingAggregatorInstitutions } from "./utils";

export const createAggregatorInstitutionSyncer =
  ({
    aggregatorName,
    fetchAndStoreInstitutionPage,
  }: {
    aggregatorName: string;
    fetchAndStoreInstitutionPage: ({
      aggregatorId,
      page,
    }: {
      aggregatorId: number;
      page: number;
    }) => Promise<{
      aggregatorInstitutionIds: string[];
      totalPages: number;
    }>;
  }) =>
  async () => {
    const aggregatorId = (await getAggregatorByName(aggregatorName)).id;

    const firstPage = await fetchAndStoreInstitutionPage({
      aggregatorId,
      page: 1,
    });

    const { totalPages } = firstPage;

    const allAggregatorInstitutionIds = [...firstPage.aggregatorInstitutionIds];

    for (let page = 2; page < totalPages + 1; page++) {
      const { aggregatorInstitutionIds } = await fetchAndStoreInstitutionPage({
        aggregatorId,
        page,
      });

      allAggregatorInstitutionIds.push(...aggregatorInstitutionIds);
    }

    await removeMissingAggregatorInstitutions({
      aggregatorId,
      aggregatorInstitutionIds: allAggregatorInstitutionIds,
      minimumValidInstitutionCount: 5000,
    });
  };
