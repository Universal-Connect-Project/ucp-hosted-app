import { Op } from "sequelize";
import { AggregatorInstitution } from "../models/aggregatorInstitution";

export const removeMissingAggregatorInstitutions = async ({
  aggregatorId,
  aggregatorInstitutionIds,
  minimumValidInstitutionCount,
}: {
  aggregatorId: number;
  aggregatorInstitutionIds: string[];
  minimumValidInstitutionCount: number;
}) => {
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
