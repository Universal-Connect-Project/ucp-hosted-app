import { Request, Response } from "express";
import { literal, Op, OrderItem } from "sequelize";
import { DEFAULT_PAGINATION_PAGE_SIZE } from "../shared/const";
import { Literal } from "sequelize/types/utils";
import db from "../database";
import { Institution } from "../models/institution";

interface InstitutionDetail {
  id: string;
  name: string;
  logo: string;
}

interface InstitutionsResponse {
  currentPage: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
  institutions: InstitutionDetail[];
}

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

  return whereConditions;
};

export const getPerformanceAuthInstitutions = async (
  req: Request,
  res: Response,
) => {
  const parseSort = (sortBy: string): SortSequelize => {
    const [column, direction = SortDirection.ASC] = sortBy.split(":");
    return { column, direction: direction.toUpperCase() as SortDirection };
  };

  try {
    const { limit, offset, page } = getPaginationOptions(req);

    const sortBy = req.query?.sortBy
      ? parseSort(req.query.sortBy as string)
      : parseSort("name:ASC");

    const order: OrderItem[] = [
      [sortBy.column, sortBy.direction as SortDirection],
      sortBy.column === "name"
        ? ["createdAt", SortDirection.DESC]
        : ["name", SortDirection.ASC],
    ];

    const { count, rows } = await Institution.findAndCountAll({
      distinct: true,
      attributes: ["id", "name", "logo"],
      where: whereInstitutionConditions(req),
      limit,
      offset,
      order,
      raw: true,
    });

    return res.status(200).json({
      currentPage: page,
      pageSize: limit,
      totalRecords: count,
      totalPages: Math.ceil(count / limit),
      institutions: rows,
    } as unknown as InstitutionsResponse);
  } catch (error) {
    return res
      .status(500)
      .json({ error: "An error occurred while fetching institutions." });
  }
};
