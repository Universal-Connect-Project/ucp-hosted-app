import { Op } from "sequelize";
import { AggregatorInstitution } from "../../models/aggregatorInstitution";
import { AggregatorIntegration } from "../../models/aggregatorIntegration";
import { Institution } from "../../models/institution";
import { findPotentialMatches } from "./utils";
import { Match } from "./const";

export const matchInstitutions = async (aggregatorId: number) => {
  const institutionIdsThatAlreadyHaveAnActiveAggregatorIntegrationForThisAggregator =
    await AggregatorIntegration.findAll({
      where: { aggregatorId, isActive: true },
      attributes: ["institution_id"],
      raw: true,
    }).then((integrations) =>
      integrations.map(
        (integration) =>
          (integration as { institution_id: string }).institution_id,
      ),
    );

  let ucpInstitutionsWithoutAnAggregatorIntegrationForThisAggregator =
    await Institution.findAll({
      where: {
        id: {
          [Op.notIn]:
            institutionIdsThatAlreadyHaveAnActiveAggregatorIntegrationForThisAggregator,
        },
      },
      raw: true,
    });

  const aggregatorIntegrationAggregatorInstitutionIds =
    await AggregatorIntegration.findAll({
      where: { aggregatorId },
      attributes: ["aggregator_institution_id"],
      raw: true,
    }).then((integrations) =>
      integrations.map((integration) => integration.aggregator_institution_id),
    );

  const aggregatorInstitutionsThatNeedMatching =
    await AggregatorInstitution.findAll({
      where: {
        aggregatorId,
        id: { [Op.notIn]: aggregatorIntegrationAggregatorInstitutionIds },
      },
      raw: true,
    });

  const startingNeedsMatchingCount =
    aggregatorInstitutionsThatNeedMatching.length;

  let matchCount = 0;

  const handleAutoMatch = ({
    aggregatorInstitution,
    match,
  }: {
    aggregatorInstitution: AggregatorInstitution;
    match: Match;
  }) => {
    matchCount++;

    console.log(
      "🤖 Auto-matching",
      aggregatorInstitution.name,
      "to",
      match.institution.name,
    );

    ucpInstitutionsWithoutAnAggregatorIntegrationForThisAggregator =
      ucpInstitutionsWithoutAnAggregatorIntegrationForThisAggregator.filter(
        (institution) => institution.id !== match.institution.id,
      );
  };

  for (const aggregatorInstitution of aggregatorInstitutionsThatNeedMatching) {
    const matches = findPotentialMatches(
      aggregatorInstitution,
      ucpInstitutionsWithoutAnAggregatorIntegrationForThisAggregator,
    );

    const [firstMatch] = matches;

    if (matches.length) {
      if (matches.length === 1) {
        if (firstMatch.top2AverageScore >= 0.8) {
          handleAutoMatch({ aggregatorInstitution, match: firstMatch });
        }
      } else if (matches.length > 1) {
        if (
          firstMatch.top2AverageScore >= 0.9 ||
          firstMatch.averageTotalScore >= 0.85
        ) {
          handleAutoMatch({ aggregatorInstitution, match: firstMatch });
        }
      }
    }
  }

  console.log(
    `Auto matched ${matchCount} institutions out of ${startingNeedsMatchingCount} needing matched. ${startingNeedsMatchingCount - matchCount} remaining.`,
  );
};
