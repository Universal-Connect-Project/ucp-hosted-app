import { Request, Response } from "express";
import { AggregatorIntegration } from "../models/aggregatorIntegration";
import { AggregatorInstitution } from "../models/aggregatorInstitution";
import { UUID } from "crypto";

export interface LinkAggregatorInstitutionRequest extends Request {
  body: {
    aggregatorId: number;
    aggregatorInstitutionId: string;
    institutionId: UUID;
  };
}

export const linkAggregatorInstitution = async (
  req: LinkAggregatorInstitutionRequest,
  res: Response,
) => {
  const { body } = req;
  const { aggregatorId, aggregatorInstitutionId, institutionId } = body;

  const aggregatorInstitution = await AggregatorInstitution.findOne({
    where: {
      aggregatorId,
      id: aggregatorInstitutionId,
    },
  });

  await AggregatorIntegration.upsert({
    aggregatorId,
    aggregator_institution_id: aggregatorInstitutionId,
    institution_id: institutionId,
    supports_aggregation: aggregatorInstitution?.supportsTransactions,
    supportsBalance: aggregatorInstitution?.supportsBalance,
    supportsRewards: aggregatorInstitution?.supportsRewards,
    supports_oauth: aggregatorInstitution?.supportsOAuth,
    supports_identification: aggregatorInstitution?.supportsAccountOwner,
    supports_verification: aggregatorInstitution?.supportsAccountNumber,
    supports_history: aggregatorInstitution?.supportsTransactionHistory,
  });

  res.json({ message: "Aggregator Institution linked successfully" });
};
