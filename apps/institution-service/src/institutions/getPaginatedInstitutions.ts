import { Request, Response } from "express";
import { literal, Op, OrderItem } from "sequelize";
import { DEFAULT_PAGINATION_PAGE_SIZE } from "../shared/const";
import { Literal } from "sequelize/types/utils";
import db from "../database";
import { Institution } from "../models/institution";
import { AggregatorIntegration } from "../models/aggregatorIntegration";
import { Aggregator } from "../models/aggregator";
import { PaginatedInstitutionsResponse } from "./consts";

enum SortDirection {
  ASC = "ASC",
  DESC = "DESC",
}
type SortSequelize = { column: string; direction?: SortDirection };

interface PaginationOptions {
  page: number;
  limit: number;
  offset: number;
}

const getPaginationOptions = (req: Request): PaginationOptions => {
  const page = parseInt(req.query.page as string, 10) || 1;
  const limit =
    parseInt(req.query.pageSize as string, 10) || DEFAULT_PAGINATION_PAGE_SIZE;
  const offset = (page - 1) * limit;

  return { page, limit, offset };
};

type WhereConditions = {
  [key: string]: unknown;
  [Op.or]?: Array<
    | {
        name?: { [Op.iLike]: string };
      }
    | Literal
  >;
  [Op.and]?: unknown;
};

const integrationFilterStrings = (req: Request): string => {
  const {
    supportsIdentification,
    supportsAggregation,
    supportsHistory,
    supportsRewards,
    supportsBalance,
    supportsVerification,
    supportsOauth,
    includeInactiveIntegrations,
    aggregatorName,
  } = req.query;
  const integrationFilterStringList = [];
  if (supportsIdentification === "true") {
    integrationFilterStringList.push(
      'AND "aggregatorIntegration"."supports_identification" = TRUE',
    );
  }
  if (supportsAggregation === "true") {
    integrationFilterStringList.push(
      'AND "aggregatorIntegration"."supports_aggregation" = TRUE',
    );
  }
  if (supportsHistory === "true") {
    integrationFilterStringList.push(
      'AND "aggregatorIntegration"."supports_history" = TRUE',
    );
  }
  if (supportsVerification === "true") {
    integrationFilterStringList.push(
      'AND "aggregatorIntegration"."supports_verification" = TRUE',
    );
  }
  if (supportsOauth === "true") {
    integrationFilterStringList.push(
      'AND "aggregatorIntegration"."supports_oauth" = TRUE',
    );
  }
  if (supportsRewards === "true") {
    integrationFilterStringList.push(
      'AND "aggregatorIntegration"."supportsRewards" = TRUE',
    );
  }
  if (supportsBalance === "true") {
    integrationFilterStringList.push(
      'AND "aggregatorIntegration"."supportsBalance" = TRUE',
    );
  }
  if (includeInactiveIntegrations !== "true" && aggregatorName) {
    integrationFilterStringList.push(
      `AND "aggregatorIntegration"."isActive" = TRUE`,
    );
  }

  return integrationFilterStringList.join(" ");
};

const whereInstitutionConditions = (req: Request): WhereConditions => {
  const { search } = req.query;

  const whereConditions: WhereConditions = {};

  if (search) {
    const escapedSearch = db.escape(`%${search as string}%`);

    whereConditions[Op.or] = [
      { name: { [Op.iLike]: `%${search as string}%` } },
      literal(`
        EXISTS (
          SELECT 1 from UNNEST(keywords) as keyword
          WHERE keyword ILIKE ${escapedSearch}
        )
      `),
    ];
  }

  const aggregatorFilter = aggregatorFilterLiteral(req);

  if (aggregatorFilter) {
    whereConditions[Op.and] = aggregatorFilter;
  }

  return whereConditions;
};

const aggregatorFilterLiteral = (req: Request): Literal | null => {
  const { aggregatorName, includeInactiveIntegrations } = req.query;

  let aggQueryFilter = "";
  if (aggregatorName) {
    const aggregatorNames = Array.isArray(aggregatorName)
      ? aggregatorName
      : [aggregatorName];
    const escapedAggregatorNames = aggregatorNames.map((aggregator) => {
      return db.escape(aggregator as string);
    });
    aggQueryFilter = `AND "aggregator"."name" IN (${escapedAggregatorNames.join(", ")})`;
  }

  const integrationFilter = integrationFilterStrings(req);

  if (
    !integrationFilter &&
    !aggQueryFilter &&
    includeInactiveIntegrations === "true"
  ) {
    return null;
  }

  return literal(`
    EXISTS (
      SELECT 1
      FROM "aggregatorIntegrations" AS "aggregatorIntegration"
      INNER JOIN "aggregators" AS "aggregator" 
      ON "aggregatorIntegration"."aggregatorId" = "aggregator"."id"
      WHERE "aggregatorIntegration"."institution_id" = "Institution"."id"
      ${integrationFilter}
      ${aggQueryFilter}
    )
  `);
};

export const getPaginatedInstitutions = async (req: Request, res: Response) => {
  const parseSort = (sortBy: string): SortSequelize => {
    const [column, direction = SortDirection.ASC] = sortBy.split(":");
    return { column, direction: direction.toUpperCase() as SortDirection };
  };

  try {
    let order: OrderItem[] = [];
    const { limit, offset, page } = getPaginationOptions(req);

    const sortBy = req.query?.sortBy
      ? parseSort(req.query.sortBy as string)
      : parseSort("createdAt:DESC");

    if (sortBy.column === "name") {
      order = [
        ["createdAt", SortDirection.DESC],
        ["name", sortBy.direction as SortDirection],
      ];
    } else {
      order = [
        [sortBy.column, sortBy.direction as SortDirection],
        ["name", SortDirection.ASC],
      ];
    }

    const { count, rows } = await Institution.findAndCountAll({
      distinct: true,
      attributes: [
        "id",
        "name",
        "keywords",
        "logo",
        "url",
        "is_test_bank",
        "routing_numbers",
        "createdAt",
        "updatedAt",
      ],
      where: whereInstitutionConditions(req),
      include: [
        {
          model: AggregatorIntegration,
          as: "aggregatorIntegrations",
          attributes: [
            "id",
            "aggregator_institution_id",
            "supports_oauth",
            "supports_identification",
            "supports_verification",
            "supports_aggregation",
            "supports_history",
            "supportsRewards",
            "supportsBalance",
            "isActive",
          ],
          required: false,
          include: [
            {
              model: Aggregator,
              as: "aggregator",
              attributes: ["name", "id", "displayName", "logo"],
              required: false,
            },
          ],
        },
      ],
      limit,
      offset,
      order,
    });

    return res.status(200).json({
      currentPage: page,
      pageSize: limit,
      totalRecords: count,
      totalPages: Math.ceil(count / limit),
      institutions: rows,
    } as unknown as PaginatedInstitutionsResponse);
  } catch (error) {
    return res
      .status(500)
      .json({ error: "An error occurred while fetching institutions." });
  }
};
