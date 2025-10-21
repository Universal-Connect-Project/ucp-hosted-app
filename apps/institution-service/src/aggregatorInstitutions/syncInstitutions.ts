import { Op } from "sequelize";
import { AggregatorIntegration } from "../models/aggregatorIntegration";
import { syncFinicityInstitutions } from "./finicity";
import { AggregatorInstitution } from "./const";
import { getAggregatorByName } from "../shared/aggregators/getAggregatorByName";
import { Request, Response } from "express";

const markMissingAggregatorInstitutionsInactive = async (
  aggregatorId: number,
  activeAggregatorInstitutionIds: string[],
) => {
  const aggregatorIntegrationsIdsToDeactivate =
    await AggregatorIntegration.findAll({
      where: {
        aggregatorId,
        aggregator_institution_id: {
          [Op.notIn]: activeAggregatorInstitutionIds,
        },
        isActive: true,
      },
      attributes: ["id"],
      raw: true,
    });

  console.log(
    `Marking ${aggregatorIntegrationsIdsToDeactivate.length} missing aggregator institutions as inactive for aggregator ID ${aggregatorId}.`,
  );

  for (const integration of aggregatorIntegrationsIdsToDeactivate) {
    await AggregatorIntegration.update(
      {
        isActive: false,
      },
      {
        where: {
          id: integration.id,
        },
      },
    );
  }
};

const updateExistingAggregatorIntegration = async (
  aggregatorId: number,
  aggregatorInstitution: AggregatorInstitution,
) => {
  const matchingAggregatorIntegrations = await AggregatorIntegration.findAll({
    where: {
      aggregatorId,
      aggregator_institution_id: aggregatorInstitution.aggregatorInstitutionId,
    },
  });

  for (const integration of matchingAggregatorIntegrations) {
    integration.isActive = true;
    integration.supports_oauth = aggregatorInstitution.supportsOAuth;
    integration.supports_identification =
      aggregatorInstitution.supportsIdentification;
    integration.supports_verification =
      aggregatorInstitution.supportsVerification;
    integration.supports_history = aggregatorInstitution.supportsHistory;
    integration.supportsRewards = aggregatorInstitution.supportsRewards;
    integration.supportsBalance = aggregatorInstitution.supportsBalance;
    integration.supports_aggregation =
      aggregatorInstitution.supportsAggregation;

    await integration.save();
  }
};

interface SyncInstitutionsRequest extends Request {
  body: {
    shouldWaitForCompletion?: boolean;
  };
}

export const syncInstitutions = async (
  req?: SyncInstitutionsRequest,
  res?: Response,
) => {
  if (!req?.body?.shouldWaitForCompletion) {
    res?.status(202).send({ message: "Institution sync started." });
  }

  const aggregatorErrors = [];

  const institutionFetchers = [
    {
      aggregatorName: "finicity",
      fetcher: syncFinicityInstitutions,
      minimumInstitutionCount: 5000,
    },
  ];

  for (const {
    aggregatorName,
    fetcher,
    minimumInstitutionCount,
  } of institutionFetchers) {
    try {
      const aggregatorInstitutions = await fetcher();
      console.log(
        `Fetched ${aggregatorInstitutions.length} institutions from ${aggregatorName}.`,
      );

      if (aggregatorInstitutions.length < minimumInstitutionCount) {
        throw new Error(
          `Fetched institution count ${aggregatorInstitutions.length} is below the expected minimum of ${minimumInstitutionCount} for ${aggregatorName}. Skipping updates.`,
        );
      }

      const aggregatorId = (await getAggregatorByName(aggregatorName))
        ?.id as number;

      const aggregatorInstitutionIds = aggregatorInstitutions.map(
        ({ aggregatorInstitutionId }) => aggregatorInstitutionId,
      );

      await markMissingAggregatorInstitutionsInactive(
        aggregatorId,
        aggregatorInstitutionIds,
      );

      for (const aggregatorInstitution of aggregatorInstitutions) {
        await updateExistingAggregatorIntegration(
          aggregatorId,
          aggregatorInstitution,
        );
      }

      console.log(
        `Finished syncing aggregator institutions for ${aggregatorName}.`,
      );
    } catch (error) {
      console.error(
        `Error fetching institutions for aggregator ${aggregatorName}:`,
        error,
      );

      aggregatorErrors.push(aggregatorName);
    }
  }

  if (req?.body?.shouldWaitForCompletion) {
    if (aggregatorErrors.length) {
      console.error(
        "Errors occurred during institution sync:",
        aggregatorErrors,
      );
      res?.status(500).send({
        message: "Institution sync completed with errors.",
        errors: aggregatorErrors.map(
          (aggregatorName) =>
            `Failed to fetch institutions from ${aggregatorName}`,
        ),
      });
    } else {
      res?.status(200).send({ message: "Institution sync completed." });
    }
  }

  console.log("Finished syncing aggregator institutions.");
};
