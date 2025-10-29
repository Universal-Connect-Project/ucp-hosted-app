import { Request, Response } from "express";
import { getPaginationOptions } from "../shared/utils/pagination";
import { AggregatorInstitution } from "../models/aggregatorInstitution";

export const getPaginatedAggregatorInstitutionsHandler = async (
  req: Request,
  res: Response,
) => {
  try {
    const { limit, offset, page } = getPaginationOptions(req);

    const { count, rows } = await AggregatorInstitution.findAndCountAll({
      limit,
      offset,
    });

    res.json({
      aggregatorInstitutions: rows,
      currentPage: page,
      pageSize: limit,
      totalRecords: count,
      totalPages: Math.ceil(count / limit),
    });
  } catch (error) {
    console.error("Error fetching paginated aggregator institutions:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
