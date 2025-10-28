import { Op } from "sequelize";
import { AggregatorInstitution } from "../../models/aggregatorInstitution";
import { AggregatorIntegration } from "../../models/aggregatorIntegration";
import { Institution } from "../../models/institution";
import { findPotentialMatches } from "./utils";
import { Match } from "./const";

export const matchInstitutions = async (aggregatorId: number) => {
  const institutionIdsUnavailableToMatch = await AggregatorIntegration.findAll({
    where: { aggregatorId, isActive: true },
    attributes: ["institution_id"],
    raw: true,
  }).then((integrations) =>
    integrations.map(
      (integration) =>
        (integration as { institution_id: string }).institution_id,
    ),
  );

  let institutionsAvailableToMatch = await Institution.findAll({
    where: {
      id: {
        [Op.notIn]: institutionIdsUnavailableToMatch,
      },
    },
    raw: true,
  });

  const matchedAggregatorInstitutionIds = await AggregatorIntegration.findAll({
    where: { aggregatorId, isActive: true },
    attributes: ["aggregator_institution_id"],
    raw: true,
  }).then((integrations) =>
    integrations.map((integration) => integration.aggregator_institution_id),
  );

  const aggregatorInstitutionsThatNeedMatching =
    await AggregatorInstitution.findAll({
      where: {
        aggregatorId,
        id: { [Op.notIn]: matchedAggregatorInstitutionIds },
      },
      raw: true,
    });

  const startingNeedsMatchingCount =
    aggregatorInstitutionsThatNeedMatching.length;

  let matchCount = 0;

  const handleAutoMatch = async ({
    aggregatorInstitution,
    match,
  }: {
    aggregatorInstitution: AggregatorInstitution;
    match: Match;
  }) => {
    const { institution } = match;

    try {
      await AggregatorIntegration.upsert({
        aggregatorId,
        aggregator_institution_id: aggregatorInstitution.id,
        institution_id: institution.id,
        isActive: true,
        supports_aggregation: aggregatorInstitution.supportsTransactions,
        supportsBalance: aggregatorInstitution.supportsBalance,
        supports_history: aggregatorInstitution.supportsTransactionHistory,
        supports_identification: aggregatorInstitution.supportsAccountOwner,
        supports_oauth: aggregatorInstitution.supportsOAuth,
        supportsRewards: aggregatorInstitution.supportsRewards,
        supports_verification: aggregatorInstitution.supportsAccountNumber,
      });

      matchCount++;

      console.log(
        `🤖 Auto-matched ${aggregatorInstitution.name} to ${institution.name}`,
      );

      institutionsAvailableToMatch = institutionsAvailableToMatch.filter(
        (inst) => inst.id !== institution.id,
      );
    } catch (error) {
      console.error(
        `Failed to save auto-match ${aggregatorInstitution.name} to ${institution.name}:`,
        error,
      );
    }
  };

  for (const aggregatorInstitution of aggregatorInstitutionsThatNeedMatching) {
    const matches = findPotentialMatches(
      aggregatorInstitution,
      institutionsAvailableToMatch,
    );

    const [firstMatch] = matches;

    if (matches.length) {
      if (matches.length === 1) {
        if (firstMatch.top2AverageScore >= 0.8) {
          await handleAutoMatch({ aggregatorInstitution, match: firstMatch });
        }
      } else if (matches.length > 1) {
        if (
          firstMatch.top2AverageScore >= 0.9 ||
          firstMatch.averageTotalScore >= 0.85
        ) {
          await handleAutoMatch({ aggregatorInstitution, match: firstMatch });
        }
      }
    }
  }

  console.log(
    `Auto matched ${matchCount} institutions out of ${startingNeedsMatchingCount} needing matched. ${startingNeedsMatchingCount - matchCount} remaining.`,
  );
};
