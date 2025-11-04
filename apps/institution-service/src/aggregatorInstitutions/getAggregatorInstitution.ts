import { Request, Response } from "express";
import { AggregatorInstitution } from "../models/aggregatorInstitution";

export const getAggregatorInstitution = async (req: Request, res: Response) => {
  try {
    const { aggregatorId, id } = req.params;

    const institution = await AggregatorInstitution.findOne({
      include: ["aggregator"],
      where: {
        aggregatorId,
        id,
      },
    });

    if (!institution) {
      return res
        .status(404)
        .json({ message: "Aggregator Institution not found" });
    }

    const institutions = await institution.getInstitutions();

    return res.json({
      institution: {
        ...institution.toJSON(),
        institutions: institutions.map((institution) => institution.toJSON()),
      },
    });
  } catch (error) {
    console.error("Error fetching aggregator institution:", error);
    return res
      .status(500)
      .json({ message: "Failed to fetch aggregator institution" });
  }
};
