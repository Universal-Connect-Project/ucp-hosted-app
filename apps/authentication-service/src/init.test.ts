import { Request, Response } from "express";
import {
  InvalidTokenError,
  UnauthorizedError,
} from "express-oauth2-jwt-bearer";

import { errorHandler } from "@/middleware/errorMiddleware";
import { notFoundHandler } from "@/middleware/notFoundMiddleware";

describe("Express test", () => {
  it("tests notFoundHandler", () => {
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    const req: Request = {} as Request;
    const next: jest.Mock = jest.fn();

    notFoundHandler(req, res, next);

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Not Found" });
  });
  it("tests errorHandler", () => {
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    const req: Request = {} as Request;
    const next = jest.fn();

    errorHandler(new Error("Test Error"), req, res, next);

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Internal Server Error" });
  });
  it("tests errorHandler InvalidToken", () => {
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    const req: Request = {} as Request;
    const next = jest.fn();

    errorHandler(
      new InvalidTokenError("Test InvalidTokenError"),
      req,
      res,
      next,
    );

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Invalid Token" });
  });
  it("tests errorHandler UnauthorizedError", () => {
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    const req: Request = {} as Request;
    const next = jest.fn();

    errorHandler(
      new UnauthorizedError("Test UnauthorizedError"),
      req,
      res,
      next,
    );

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "Requires Authentication",
    });
  });
});
