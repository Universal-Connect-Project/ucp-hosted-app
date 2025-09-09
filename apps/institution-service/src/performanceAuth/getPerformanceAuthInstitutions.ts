import { Request, Response } from "express";
import { literal, Op, OrderItem } from "sequelize";
import { Literal } from "sequelize/types/utils";
import db from "../database";
import { Institution } from "../models/institution";
import {
  getPaginationOptions,
  parseSort,
  SortDirection,
} from "../shared/utils/pagination";

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

type WhereConditions = {
  [Op.or]?: Array<
    | {
        name?: { [Op.iLike]: string };
      }
    | Literal
  >;
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
  try {
    const { limit, offset, page } = getPaginationOptions(req);

    const sortBy = parseSort((req.query?.sortBy as string) || "name:ASC");

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
  } catch (_error) {
    return res
      .status(500)
      .json({ error: "An error occurred while fetching institutions." });
  }
};
