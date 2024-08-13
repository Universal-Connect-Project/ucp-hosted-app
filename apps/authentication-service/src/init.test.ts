import { checkPermission } from "@/middleware/authMiddleware";
import { WidgetHostPermissions } from "@/shared/enums";
import { getTestToken } from "@/test/testData/users";
import { Request, RequestHandler, Response } from "express";
import {
  InvalidTokenError,
  UnauthorizedError,
} from "express-oauth2-jwt-bearer";

import { errorHandler } from "@/middleware/errorMiddleware";
import { notFoundHandler } from "@/middleware/notFoundMiddleware";

describe("Express test", () => {
  describe("middleware tests", () => {
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
      expect(res.json).toHaveBeenCalledWith({
        message: "Internal Server Error",
      });
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
      expect(res.json).toHaveBeenCalledWith({
        message: "Test InvalidTokenError",
      });
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
        message: "Test UnauthorizedError",
      });
    });

    it("tests checkPermission when token has insufficient permissions", () => {
      const token = getTestToken(false, false);

      const next = jest.fn();
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      const req: Request = {
        headers: {
          authorization: `Bearer ${token}`,
        },
      } as Request;

      const handler: RequestHandler = checkPermission(
        WidgetHostPermissions.CREATE_KEYS,
      );

      handler(req, res, next);
      expect(next).toHaveBeenCalledWith(new UnauthorizedError());
    });

    it("tests checkPermission when token has correct permissions", () => {
      const token = getTestToken(false, true);

      console.log("----> token", token);

      const next = jest.fn();
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      const req: Request = {
        headers: {
          authorization: `Bearer ${token}`,
        },
      } as Request;

      checkPermission(WidgetHostPermissions.CREATE_KEYS)(req, res, next);
      expect(next).toHaveBeenCalledWith(200);
    });
  });
});
