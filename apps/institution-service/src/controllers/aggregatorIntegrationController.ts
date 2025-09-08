import { UUID } from "crypto";
import { Request, Response } from "express";
import { Error, ForeignKeyConstraintError, ValidationError } from "sequelize";
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
  supportsRewards: boolean;
  supportsBalance: boolean;
  isActive: boolean;
}

function getErrorCodeAndMessage(error: Error): [number, string] {
  if (error instanceof ValidationError) {
    if (error.name === "SequelizeUniqueConstraintError") {
      return [
        409,
        "An AggregatorIntegration for that Institution/Aggregator already exists.",
      ];
    } else {
      return [
        400,
        error.errors.map((err: { message: string }) => err.message).join(", "),
      ];
    }
  }
  if (error instanceof ForeignKeyConstraintError) {
    return [400, `Invalid reference in the field: ${error.index}.`];
  }
  if (error.name === "SequelizeDatabaseError") {
    return [400, error.message];
  }

  return [400, "An unexpected error occurred. Please try again later."];
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
  } catch (_error) {
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
      const [code, message] = getErrorCodeAndMessage(error);

      res.status(code).json({
        error: message,
      });
    } else {
      res.status(500).json({ error: "Error: Something went wrong" });
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
  } catch (_error) {
    res.status(500).json({ error: "System Error" });
  }
};
