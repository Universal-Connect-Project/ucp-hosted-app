import { NextFunction, Request, Response } from "express";
import { DEFAULT_PAGINATION_PAGE_SIZE } from "../shared/const";

export const paginationMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const page = parseInt(req.query.page as string, 10) || 1;
  const limit =
    parseInt(req.query.pageSize as string, 10) || DEFAULT_PAGINATION_PAGE_SIZE;

  res.locals.pagination = {
    page,
    limit,
    offset: (page - 1) * limit,
  };

  next();
};
