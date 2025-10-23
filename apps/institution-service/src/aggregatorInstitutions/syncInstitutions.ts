import { Op } from "sequelize";
import { AggregatorIntegration } from "../models/aggregatorIntegration";
import { syncFinicityInstitutions } from "./finicity";
import { getAggregatorByName } from "../shared/aggregators/getAggregatorByName";
import { Request, Response } from "express";
import { AggregatorInstitution } from "../models/aggregatorInstitution";
import { matchInstitutions } from "./match/matchInstitutions";

const markMissingAggregatorInstitutionsInactive = async (
  aggregatorId: number,
) => {
  const activeAggregatorInstitutionIds = (
    await AggregatorInstitution.findAll({
      where: { aggregatorId },
      attributes: ["id"],
      raw: true,
    })
  ).map((inst) => inst.id);

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

export const updateExistingAggregatorIntegrations = async (
  aggregatorId: number,
) => {
  const aggregatorInstitutions = await AggregatorInstitution.findAll({
    where: { aggregatorId },
  });

  console.log(
    `Found ${aggregatorInstitutions.length} aggregator institutions to update integrations for aggregator ID ${aggregatorId}.`,
  );

  for (const aggregatorInstitution of aggregatorInstitutions) {
    const matchingAggregatorIntegrations = await AggregatorIntegration.findAll({
      where: {
        aggregatorId,
        aggregator_institution_id: aggregatorInstitution.id,
      },
    });

    for (const integration of matchingAggregatorIntegrations) {
      integration.isActive = true;
      integration.supports_oauth = aggregatorInstitution.supportsOAuth;
      integration.supports_identification =
        aggregatorInstitution.supportsAccountOwner;
      integration.supports_verification =
        aggregatorInstitution.supportsAccountNumber;
      integration.supports_history =
        aggregatorInstitution.supportsTransactionHistory;
      integration.supportsRewards = aggregatorInstitution.supportsRewards;
      integration.supportsBalance = aggregatorInstitution.supportsBalance;
      integration.supports_aggregation =
        aggregatorInstitution.supportsTransactions;

      await integration.save();
    }
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
      syncInstitutions: syncFinicityInstitutions,
    },
  ];

  for (const { aggregatorName, syncInstitutions } of institutionFetchers) {
    try {
      await syncInstitutions();

      const aggregatorId = (await getAggregatorByName(aggregatorName))
        ?.id as number;

      await markMissingAggregatorInstitutionsInactive(aggregatorId);

      await updateExistingAggregatorIntegrations(aggregatorId);

      console.log(
        `Finished syncing aggregator institutions for ${aggregatorName}.`,
      );

      await matchInstitutions(aggregatorId);

      console.log("Finished auto matching institutitions");
    } catch (error) {
      console.error(
        `Error syncing institutions for aggregator ${aggregatorName}:`,
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
            `Failed to sync institutions for ${aggregatorName}`,
        ),
      });
    } else {
      res?.status(200).send({ message: "Institution sync completed." });
    }
  }

  console.log("Finished syncing aggregator institutions.");
};
