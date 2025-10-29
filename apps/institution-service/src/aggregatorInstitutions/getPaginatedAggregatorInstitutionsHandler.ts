import { Request, Response } from "express";
import { getPaginationOptions } from "../shared/utils/pagination";
import { AggregatorInstitution } from "../models/aggregatorInstitution";
import { Op } from "sequelize";

interface QueryParams {
  aggregatorIds?: string;
  name?: string;
}

export const getPaginatedAggregatorInstitutionsHandler = async (
  req: Request,
  res: Response,
) => {
  try {
    const { limit, offset, page } = getPaginationOptions(req);

    const { aggregatorIds, name } = req.query as QueryParams;

    const { count, rows } = await AggregatorInstitution.findAndCountAll({
      limit,
      offset,
      where: {
        ...(aggregatorIds && { aggregatorId: aggregatorIds.split(",") }),
        ...(name && { name: { [Op.iLike]: `%${name}%` } }),
      },
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
