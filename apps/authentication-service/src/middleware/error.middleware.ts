import { Request, Response, NextFunction } from "express";

export const errorHandler = (
  _error: any,
  _request: Request,
  response: Response,
  _next: NextFunction
) => {
  const status = 500;
  const message = "Internal Server Error";

  response.status(status).json({ message });
};
