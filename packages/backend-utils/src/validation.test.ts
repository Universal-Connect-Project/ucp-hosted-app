import {
  ComboJobTypes,
  JOB_TYPES_ERROR_TEXT,
  TIME_FRAME_ERROR_TEXT,
} from "@repo/shared-utils";
import {
  createRequestBodySchemaValidator,
  createRequestQueryParamSchemaValidator,
  validateAggregatorGraphRequestSchema,
  validateAggregatorRequestSchema,
} from "./validation";
import { NextFunction, request, Request, Response } from "express";
import Joi from "joi";

const createValidatorTests = ({
  createValidator,
  requestValidationLocation,
  title,
}: {
  createValidator: (
    schema: Joi.ObjectSchema,
  ) => (req: Request, res: Response, next: NextFunction) => void;
  requestValidationLocation: "body" | "query";
  title: string;
}) =>
  describe(title, () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let next: NextFunction;

    const schema = Joi.object({
      name: Joi.string().required(),
      age: Joi.number().integer().min(18).required(),
    });

    beforeEach(() => {
      req = { body: {} };
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      next = jest.fn();
    });

    it("should call next() when request body is valid", () => {
      req[requestValidationLocation] = { name: "John Doe", age: 25 };

      createValidator(schema)(req as Request, res as Response, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });

    it("should return 400 status and error message when request body is invalid", () => {
      req[requestValidationLocation] = { name: "John Doe" }; // Missing 'age' field

      createValidator(schema)(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: expect.stringContaining('"age" is required'),
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("should return 400 status and correct error message for invalid type", () => {
      req[requestValidationLocation] = {
        name: "John Doe",
        age: "not-a-number",
      }; // Invalid type for age

      createValidator(schema)(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: expect.stringContaining('"age" must be a number'),
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

describe("validation", () => {
  createValidatorTests({
    createValidator: createRequestBodySchemaValidator,
    requestValidationLocation: "body",
    title: "createRequestBodySchemaValidator",
  });

  createValidatorTests({
    createValidator: createRequestQueryParamSchemaValidator,
    requestValidationLocation: "query",
    title: "createRequestQueryParamSchemaValidator",
  });

  describe("validateAggregatorRequestSchema", () => {
    it("should allow a valid timeFrame query parameter", () => {
      const next = jest.fn();

      validateAggregatorRequestSchema(
        {
          query: { timeFrame: "30d" },
        } as unknown as Request,
        {
          status: jest.fn().mockReturnThis(),
          json: jest.fn(),
        } as unknown as Response,
        next,
      );
      expect(next).toHaveBeenCalled();
    });

    it("should return 400 for an invalid timeFrame query parameter", () => {
      const next = jest.fn();
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      validateAggregatorRequestSchema(
        {
          query: { timeFrame: "invalid" },
        } as unknown as Request,
        res,
        next,
      );
      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: TIME_FRAME_ERROR_TEXT,
      });
    });
  });

  describe("validateAggregatorGraphRequestSchema", () => {
    it("should allow a valid timeFrame query parameter", () => {
      const next = jest.fn();

      validateAggregatorGraphRequestSchema(
        {
          query: {
            aggregators: "mx, sophtron",
            jobTypes: `${ComboJobTypes.TRANSACTIONS}|${ComboJobTypes.ACCOUNT_NUMBER}`,
            timeFrame: "30d",
          },
        } as unknown as Request,
        {
          status: jest.fn().mockReturnThis(),
          json: jest.fn(),
        } as unknown as Response,
        next,
      );
      expect(next).toHaveBeenCalled();
    });

    it("should return 400 for an invalid timeFrame query parameter", () => {
      const next = jest.fn();
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      validateAggregatorGraphRequestSchema(
        {
          query: { timeFrame: "invalid" },
        } as unknown as Request,
        res,
        next,
      );
      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: TIME_FRAME_ERROR_TEXT,
      });
    });

    it("should return 400 for an invalid jobTypes query parameter", () => {
      const next = jest.fn();
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      validateAggregatorGraphRequestSchema(
        {
          query: {
            jobTypes: "invalidJobType",
          },
        } as unknown as Request,
        res,
        next,
      );
      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: JOB_TYPES_ERROR_TEXT,
      });
    });
  });
});
