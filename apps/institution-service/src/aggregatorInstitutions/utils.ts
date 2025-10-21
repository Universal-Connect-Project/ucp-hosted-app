import { Op } from "sequelize";
import { AggregatorInstitution } from "../models/aggregatorInstitution";

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
