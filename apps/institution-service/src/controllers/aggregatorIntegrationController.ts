import { UUID } from "crypto";
import { Request, Response } from "express";
import { Error } from "sequelize";
import { AggregatorIntegration } from "../models/aggregatorIntegration";

interface AggregatorIntegrationParams {
  institution_id?: UUID;
  aggregatorId?: number;
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
    const updateData = req.body as AggregatorIntegrationParams;

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

export const createAggregatorIntegration = async (
  req: Request,
  res: Response,
) => {
  try {
    const aggregatorIntegration = await AggregatorIntegration.create(
      req.body as AggregatorIntegrationParams,
    );

    return res.status(201).json({
      message: "AggregatorIntegration created successfully",
      aggregatorIntegration,
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: "Database Error", message: error.message });
    } else {
      res.status(500).json({ error: "Error", message: "Something went wrong" });
    }
  }
};

export const deleteAggregatorIntegration = async (
  req: Request,
  res: Response,
) => {
  try {
    const aggregatorIntegration = await AggregatorIntegration.findByPk(
      req.params.id,
    );

    if (!aggregatorIntegration) {
      return res.status(404).json({ error: "AggregatorIntegration not found" });
    }

    await aggregatorIntegration.destroy();
    res.status(204).json({});
  } catch (error) {
    res
      .status(500)
      .json({ error: "System Error", message: "Something went wrong" });
  }
};
