import { Request, Response } from "express";
import { AggregatorInstitution } from "../models/aggregatorInstitution";
import { Institution } from "../models/institution";
import { AggregatorIntegration } from "../models/aggregatorIntegration";
import { CreationAttributes } from "sequelize";
import sequelize from "../database";

export interface CreateInstitutionAndLinkAggregatorInstitutionRequest
  extends Request {
  body: {
    aggregatorId: number;
    aggregatorInstitutionId: string;
    institutionData: CreationAttributes<Institution>;
  };
}

export const createInstitutionAndLinkAggregatorInstitution = async (
  req: CreateInstitutionAndLinkAggregatorInstitutionRequest,
  res: Response,
) => {
  try {
    const { body } = req;
    const { aggregatorId, aggregatorInstitutionId, institutionData } = body;

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

    const institution = await sequelize.transaction(async (transaction) => {
      const { is_test_bank, keywords, logo, name, routing_numbers, url } =
        institutionData;

      const createdInstitution = await Institution.create(
        {
          is_test_bank,
          keywords,
          logo,
          name,
          routing_numbers,
          url,
        },
        {
          transaction,
        },
      );

      await AggregatorIntegration.create(
        {
          aggregatorId,
          aggregator_institution_id: aggregatorInstitutionId,
          institution_id: createdInstitution.id,
          supports_aggregation: aggregatorInstitution?.supportsTransactions,
          supportsBalance: aggregatorInstitution?.supportsBalance,
          supports_history: aggregatorInstitution?.supportsTransactionHistory,
          supports_identification: aggregatorInstitution?.supportsAccountOwner,
          supports_oauth: aggregatorInstitution?.supportsOAuth,
          supportsRewards: aggregatorInstitution?.supportsRewards,
          supports_verification: aggregatorInstitution?.supportsAccountNumber,
        },
        { transaction },
      );

      return createdInstitution;
    });

    res.status(201).json({
      message: "Institution created and linked successfully",
      institutionId: institution.id,
    });
  } catch (error) {
    console.error(
      "Error creating institution and linking aggregator institution:",
      error,
    );
    return res
      .status(500)
      .json({ message: "Failed to create and link institution" });
  }
};
