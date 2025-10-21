import { CreationAttributes } from "sequelize";
import { AggregatorInstitution } from "../models/aggregatorInstitution";

export const createOrUpdateAggregatorInstitution = async (
  aggregatorInstitution: CreationAttributes<AggregatorInstitution>,
) => {
  const [institution, created] = await AggregatorInstitution.findOrCreate({
    where: {
      id: aggregatorInstitution.id,
      aggregatorId: aggregatorInstitution.aggregatorId,
    },
    defaults: aggregatorInstitution,
  });

  if (!created) {
    console.log("about to update stuff");

    institution.name = aggregatorInstitution.name;
    institution.supportsOAuth = aggregatorInstitution.supportsOAuth;
    institution.supportsAccountNumber =
      aggregatorInstitution.supportsAccountNumber;
    institution.supportsAccountOwner =
      aggregatorInstitution.supportsAccountOwner;
    institution.supportsBalance = aggregatorInstitution.supportsBalance;
    institution.supportsRewards = aggregatorInstitution.supportsRewards;
    institution.supportsTransactions =
      aggregatorInstitution.supportsTransactions;
    institution.supportsTransactionHistory =
      aggregatorInstitution.supportsTransactionHistory;
    institution.url = aggregatorInstitution.url;

    await institution.save();
  }

  return institution;
};
