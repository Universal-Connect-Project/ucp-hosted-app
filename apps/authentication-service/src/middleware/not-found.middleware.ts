import { Request, Response, NextFunction } from "express";

export const notFoundHandler = (
  _request: Request,
  response: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
) => {
  const message: string = "Not Found";

  response.status(404).json({ message });
};
