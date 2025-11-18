import { Op } from "sequelize";
import { AggregatorInstitution } from "../../models/aggregatorInstitution";
import { getConfig } from "../../shared/environment";

export const removeMissingAggregatorInstitutions = async ({
  aggregatorId,
  aggregatorInstitutionIds,
  minimumValidInstitutionCount: requestedMinimumValidInstitutionCount,
}: {
  aggregatorId: number;
  aggregatorInstitutionIds: string[];
  minimumValidInstitutionCount: number;
}) => {
  const minimumValidInstitutionCount =
    process.env.NODE_ENV === "test" &&
    requestedMinimumValidInstitutionCount > 20
      ? 20
      : requestedMinimumValidInstitutionCount;

  if (aggregatorInstitutionIds.length < minimumValidInstitutionCount) {
    console.log(
      `Aborting removal of missing aggregator institutions for aggregator ID ${aggregatorId} due to low valid institution count (${aggregatorInstitutionIds.length} < ${minimumValidInstitutionCount})`,
    );
  } else {
    await AggregatorInstitution.destroy({
      where: {
        aggregatorId,
        id: {
          [Op.notIn]: aggregatorInstitutionIds,
        },
      },
    });
  }
};

export const getShouldLimitRequestsForE2E = (e2eLimitRequests: boolean) => {
  const { E2E_LIMIT_SYNC_REQUESTS } = getConfig();

  if (e2eLimitRequests && !E2E_LIMIT_SYNC_REQUESTS) {
    throw new Error(
      "Cannot limit requests unless E2E_LIMIT_SYNC_REQUESTS is enabled",
    );
  }

  return e2eLimitRequests && E2E_LIMIT_SYNC_REQUESTS;
};
