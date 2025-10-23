import { Op } from "sequelize";
import { AggregatorInstitution } from "../../models/aggregatorInstitution";
import { AggregatorIntegration } from "../../models/aggregatorIntegration";
import { Institution } from "../../models/institution";
import { findPotentialMatches } from "./utils";
import { MatchType } from "./const";

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

  const handleAutoMatch = async ({
    aggregatorInstitution,
    match,
  }: {
    aggregatorInstitution: AggregatorInstitution;
    match: MatchType;
  }) => {};

  for (const aggregatorInstitution of aggregatorInstitutionsThatNeedMatching) {
    const matches = findPotentialMatches(
      aggregatorInstitution,
      ucpInstitutionsWithoutAnAggregatorIntegrationForThisAggregator,
    );

    console.log(matches);
  }

  console.log("test");
};
