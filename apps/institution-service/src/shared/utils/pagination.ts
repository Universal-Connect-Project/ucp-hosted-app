import { Request } from "express";
import { DEFAULT_PAGINATION_PAGE_SIZE } from "../const";

interface PaginationOptions {
  page: number;
  limit: number;
  offset: number;
}

export const getPaginationOptions = (req: Request): PaginationOptions => {
  const page = parseInt(req.query.page as string, 10) || 1;
  const limit =
    parseInt(req.query.pageSize as string, 10) || DEFAULT_PAGINATION_PAGE_SIZE;
  const offset = (page - 1) * limit;

  return { page, limit, offset };
};

export enum SortDirection {
  ASC = "ASC",
  DESC = "DESC",
}

type SortSequelize = { column: string; direction?: SortDirection };

export const parseSort = (sortBy: string): SortSequelize => {
  const [column, direction] = sortBy.split(":");
  return { column, direction: direction.toUpperCase() as SortDirection };
};
