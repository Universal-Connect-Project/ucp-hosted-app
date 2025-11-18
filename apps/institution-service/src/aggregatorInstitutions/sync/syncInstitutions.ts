import { Op } from "sequelize";
import { AggregatorIntegration } from "../../models/aggregatorIntegration";
import { syncFinicityInstitutions } from "./finicity";
import { getAggregatorByName } from "../../shared/aggregators/getAggregatorByName";
import { Request, Response } from "express";
import { AggregatorInstitution } from "../../models/aggregatorInstitution";
import { matchInstitutions } from "./match/matchInstitutions";
import { syncMXInstitutions } from "./mx";
import { createWithRequestBodySchemaValidator } from "@repo/backend-utils";
import Joi from "joi";
import { getShouldLimitRequestsForE2E } from "./utils";

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

const createSyncInstitutionsForAggregator =
  ({
    aggregatorName,
    syncInstitutions,
  }: {
    aggregatorName: string;
    syncInstitutions: ({
      e2eLimitRequests,
    }: {
      e2eLimitRequests?: boolean;
    }) => Promise<void>;
  }) =>
  async ({ e2eLimitRequests }: { e2eLimitRequests?: boolean }) => {
    try {
      await syncInstitutions({ e2eLimitRequests });

      console.log(
        `Finished syncing aggregator institutions from ${aggregatorName}.`,
      );

      const aggregatorId = (await getAggregatorByName(aggregatorName))
        ?.id as number;

      await markMissingAggregatorInstitutionsInactive(aggregatorId);

      await updateExistingAggregatorIntegrations(aggregatorId);

      console.log(
        `Finished syncing aggregator integrations for ${aggregatorName}.`,
      );

      await matchInstitutions(aggregatorId);

      console.log(`Finished auto matching institutions for ${aggregatorName}.`);
    } catch (error) {
      console.error(
        `Error during sync process for aggregator ${aggregatorName}:`,
        error,
      );
      throw error;
    }
  };

const syncInstitutionsForFinicity = createSyncInstitutionsForAggregator({
  aggregatorName: "finicity",
  syncInstitutions: syncFinicityInstitutions,
});

const syncInstitutionsForMX = createSyncInstitutionsForAggregator({
  aggregatorName: "mx",
  syncInstitutions: syncMXInstitutions,
});

const aggregatorNameToSyncerMap = {
  finicity: syncInstitutionsForFinicity,
  mx: syncInstitutionsForMX,
};

export const syncAllAggregatorInstitutions = async () => {
  for (const [name, syncer] of Object.entries(aggregatorNameToSyncerMap)) {
    try {
      await syncer({});
    } catch (error) {
      console.error(`Aggregator ${name} failed to sync:`, error);
    }
  }
};

const withRequestBodySchemaValidator = createWithRequestBodySchemaValidator(
  Joi.object({
    aggregatorName: Joi.string().valid("finicity", "mx").required(),
    e2eLimitRequests: Joi.boolean().optional(),
    shouldWaitForCompletion: Joi.boolean().optional(),
  }),
);

interface SyncInstitutionsRequest extends Request {
  body: {
    aggregatorName: string;
    e2eLimitRequests?: boolean;
    shouldWaitForCompletion?: boolean;
  };
}

export const syncAggregatorInstitutionsHandler = withRequestBodySchemaValidator(
  async (req: SyncInstitutionsRequest, res: Response) => {
    const aggregatorName = req.body.aggregatorName as "finicity" | "mx";

    if (!req?.body?.shouldWaitForCompletion) {
      res.status(202).send({
        message: `Institution sync started for ${aggregatorName}.`,
      });
    }

    try {
      getShouldLimitRequestsForE2E(!!req.body.e2eLimitRequests);

      await aggregatorNameToSyncerMap[aggregatorName]({
        e2eLimitRequests: req.body.e2eLimitRequests,
      });
    } catch (_error) {
      if (req?.body?.shouldWaitForCompletion) {
        res.status(500).send({
          error: `Failed to sync institutions for ${aggregatorName}`,
        });
      }

      return;
    }

    if (req?.body?.shouldWaitForCompletion) {
      res
        .status(200)
        .send({ message: `Institution sync completed for ${aggregatorName}.` });
    }
  },
);
