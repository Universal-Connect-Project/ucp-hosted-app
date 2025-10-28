import { CreationAttributes } from "sequelize";
import { AggregatorInstitution } from "../../models/aggregatorInstitution";

export const createOrUpdateAggregatorInstitution = async (
  aggregatorInstitution: CreationAttributes<AggregatorInstitution>,
) => {
  let institution = await AggregatorInstitution.findOne({
    paranoid: false,
    where: {
      aggregatorId: aggregatorInstitution.aggregatorId,
      id: aggregatorInstitution.id,
    },
  });

  if (institution) {
    if (institution.deletedAt) {
      await institution.restore();
    }

    institution.name = aggregatorInstitution.name;
    institution.supportsOAuth = !!aggregatorInstitution.supportsOAuth;
    institution.supportsAccountNumber =
      !!aggregatorInstitution.supportsAccountNumber;
    institution.supportsAccountOwner =
      !!aggregatorInstitution.supportsAccountOwner;
    institution.supportsBalance = !!aggregatorInstitution.supportsBalance;
    institution.supportsRewards = !!aggregatorInstitution.supportsRewards;
    institution.supportsTransactions =
      !!aggregatorInstitution.supportsTransactions;
    institution.supportsTransactionHistory =
      !!aggregatorInstitution.supportsTransactionHistory;
    institution.url = aggregatorInstitution.url || null;

    await institution.save();
  } else {
    institution = await AggregatorInstitution.create(aggregatorInstitution);
  }

  return institution;
};
