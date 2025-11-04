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
  try {
    const { body } = req;
    const { aggregatorId, aggregatorInstitutionId, institutionId } = body;

    const aggregatorInstitution = await AggregatorInstitution.findOne({
      where: {
        aggregatorId,
        id: aggregatorInstitutionId,
      },
    });

    if (!aggregatorInstitution) {
      return res
        .status(404)
        .json({ message: "Aggregator Institution not found" });
    }

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
  } catch (error) {
    console.error("Error linking aggregator institution:", error);
    return res
      .status(500)
      .json({ message: "Failed to link aggregator institution" });
  }
};
