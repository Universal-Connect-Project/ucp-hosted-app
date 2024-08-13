import { Request, Response, NextFunction } from "express";
import {
  InvalidTokenError,
  UnauthorizedError,
} from "express-oauth2-jwt-bearer";

export const errorHandler = (
  error: Error,
  _request: Request,
  response: Response,
  _next: NextFunction,
) => {
  let message: string = "Internal Server Error";

  if (error instanceof InvalidTokenError) {
    message = error.message;
    response.status(error.status).json({ message });
    return;
  }

  if (error instanceof UnauthorizedError) {
    message = error.message;
    response.status(error.status).json({ message });
    return;
  }

  const status: number = 500;
  response.status(status).json({ message });
};
