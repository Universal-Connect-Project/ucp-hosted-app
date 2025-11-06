import { Request, Response } from "express";
import { AggregatorInstitution } from "../models/aggregatorInstitution";

export interface PatchAggregatorInstitutionRequest extends Request {
  body: {
    isReviewed: boolean;
  };
  params: {
    aggregatorId: string;
    aggregatorInstitutionId: string;
  };
}

export const patchAggregatorInstitution = async (
  req: PatchAggregatorInstitutionRequest,
  res: Response,
) => {
  try {
    const {
      body: { isReviewed },
      params: { aggregatorId, aggregatorInstitutionId },
    } = req;

    const aggregatorInstitution = await AggregatorInstitution.findOne({
      where: {
        id: aggregatorInstitutionId,
        aggregatorId,
      },
    });

    if (!aggregatorInstitution) {
      return res
        .status(404)
        .json({ message: "Aggregator Institution not found" });
    }

    if (isReviewed === true) {
      aggregatorInstitution.reviewedAt = new Date();
    } else {
      aggregatorInstitution.reviewedAt = null;
    }

    await aggregatorInstitution.save();

    return res.json({ aggregatorInstitution });
  } catch (error) {
    console.error("Error patching Aggregator Institution:", error);
    return res
      .status(500)
      .json({ message: "Failed to patch aggregator institution" });
  }
};
