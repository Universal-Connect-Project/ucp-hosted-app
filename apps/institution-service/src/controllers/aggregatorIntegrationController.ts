import { Request, Response } from "express";
import { AggregatorIntegration } from "../models/aggregatorIntegration";

interface updateAggregatorIntegrationParams {
  aggregator_institution_id: string;
  supports_oauth: boolean;
  supports_identification: boolean;
  supports_verification: boolean;
  supports_aggregation: boolean;
  supports_history: boolean;
  isActive: boolean;
}

export const updateAggregatorIntegration = async (
  req: Request,
  res: Response,
) => {
  try {
    const updateData = req.body as updateAggregatorIntegrationParams;

    const aggregatorIntegration = await AggregatorIntegration.findByPk(
      req.params.id,
    );

    if (!aggregatorIntegration) {
      return res.status(404).json({ error: "aggregatorIntegration not found" });
    }

    await aggregatorIntegration.update(updateData);

    return res.status(200).json({
      message: "AggregatorIntegration updated successfully",
      aggregatorIntegration,
    });
  } catch (error) {
    return res.status(500).json({
      error: "An error occurred while updating the AggregatorIntegration",
    });
  }
};
