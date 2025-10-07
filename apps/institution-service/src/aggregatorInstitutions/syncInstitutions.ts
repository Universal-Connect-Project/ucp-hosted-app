import { Op } from "sequelize";
import { AggregatorIntegration } from "../models/aggregatorIntegration";
import { fetchFinicityInstitutions } from "./finicity";
import { AggregatorInstitution } from "./const";
import { getAggregatorByName } from "../shared/aggregators/getAggregatorByName";
import { Request, Response } from "express";

const markMissingAggregatorInstitutionsInactive = async (
  aggregatorId: number,
  activeAggregatorInstitutionIds: string[],
) => {
  await AggregatorIntegration.update(
    {
      isActive: false,
    },
    {
      where: {
        aggregatorId,
        aggregator_institution_id: {
          [Op.notIn]: activeAggregatorInstitutionIds,
        },
      },
    },
  );
};

const updateExistingAggregatorIntegration = async (
  aggregatorId: number,
  aggregatorInstitution: AggregatorInstitution,
) => {
  await AggregatorIntegration.update(
    {
      isActive: true,
      supports_oauth: aggregatorInstitution.supportsOAuth,
      supports_identification: aggregatorInstitution.supportsIdentification,
      supports_verification: aggregatorInstitution.supportsVerification,
      supports_history: aggregatorInstitution.supportsHistory,
      supportsRewards: aggregatorInstitution.supportsRewards,
      supportsBalance: aggregatorInstitution.supportsBalance,
      supports_aggregation: aggregatorInstitution.supportsAggregation,
    },
    {
      where: {
        aggregatorId,
        aggregator_institution_id:
          aggregatorInstitution.aggregatorInstitutionId,
      },
    },
  );
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
      fetcher: fetchFinicityInstitutions,
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
