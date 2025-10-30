import { Request, Response } from "express";
import {
  getPaginationOptions,
  parseSort,
  SortDirection,
} from "../shared/utils/pagination";
import { AggregatorInstitution } from "../models/aggregatorInstitution";
import { Op, OrderItem } from "sequelize";

interface QueryParams {
  aggregatorIds?: string;
  name?: string;
  shouldIncludeMatched: string;
  sortBy?: string;
}

export const getPaginatedAggregatorInstitutionsHandler = async (
  req: Request,
  res: Response,
) => {
  try {
    const { limit, offset, page } = getPaginationOptions(req);

    const {
      aggregatorIds,
      name,
      shouldIncludeMatched: shouldIncludeMatchedString,
      sortBy,
    } = req.query as unknown as QueryParams;

    const { column, direction } = parseSort(
      sortBy || `name:${SortDirection.ASC}`,
    );

    let order: OrderItem[] = [];

    if (column === "name") {
      order = [
        ["name", direction as SortDirection],
        ["createdAt", SortDirection.DESC],
      ];
    } else {
      order = [
        [column, direction as SortDirection],
        ["name", SortDirection.ASC],
      ];
    }

    const shouldIncludeMatched = shouldIncludeMatchedString === "true";

    const { count, rows } = await AggregatorInstitution.findAndCountAll({
      limit,
      offset,
      order,
      where: {
        ...(aggregatorIds && { aggregatorId: aggregatorIds.split(",") }),
        ...(name && { name: { [Op.iLike]: `%${name}%` } }),
        ...(shouldIncludeMatched
          ? {}
          : {
              [Op.and]: AggregatorInstitution.sequelize!.literal(
                `
                CONCAT("AggregatorInstitution"."aggregatorId", "AggregatorInstitution"."id") NOT IN (
                SELECT DISTINCT CONCAT("aggregatorIntegrations"."aggregatorId", "aggregatorIntegrations"."aggregator_institution_id")
                FROM "aggregatorIntegrations"
                WHERE "aggregatorIntegrations"."isActive" = TRUE
                )`,
              ),
            }),
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
