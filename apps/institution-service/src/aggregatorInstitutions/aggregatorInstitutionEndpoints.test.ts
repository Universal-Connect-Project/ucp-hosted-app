/* eslint-disable @typescript-eslint/unbound-method */
import { Request, Response } from "express";
import { getPaginatedAggregatorInstitutionsQueryParamValidator } from "./aggregatorInstitutionEndpoints";

describe("aggregatorInstitution endpoints", () => {
  describe("getPaginatedAggregatorInstitutionsQueryParamValidator", () => {
    const requiredQueryParams = {
      page: "1",
      pageSize: "10",
      shouldIncludeMatched: "true",
    };

    it("should call next() for valid query parameters", () => {
      const req = {
        query: {
          ...requiredQueryParams,
          aggregatorIds: "agg1,agg2",
          name: "Test Institution",
        },
      } as unknown as Request;
      const res = {} as Response;
      const next = jest.fn();

      getPaginatedAggregatorInstitutionsQueryParamValidator(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it("should not call next, should respond with a 400 error for invalid page", () => {
      const req = {
        query: {
          ...requiredQueryParams,
          page: "0", // Invalid page
        },
      } as unknown as Request;
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;
      const next = jest.fn();

      getPaginatedAggregatorInstitutionsQueryParamValidator(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: '"page" must be greater than or equal to 1',
        }),
      );
    });

    it("should not call next, should respond with a 400 error for page size below minimum", () => {
      const req = {
        query: {
          ...requiredQueryParams,
          pageSize: "0",
        },
      } as unknown as Request;
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;
      const next = jest.fn();

      getPaginatedAggregatorInstitutionsQueryParamValidator(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: '"pageSize" must be greater than or equal to 1',
        }),
      );
    });

    it("should not call next, should respond with a 400 error for page size above maximum", () => {
      const req = {
        query: {
          ...requiredQueryParams,
          pageSize: "101",
        },
      } as unknown as Request;
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;
      const next = jest.fn();

      getPaginatedAggregatorInstitutionsQueryParamValidator(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: '"pageSize" must be less than or equal to 100',
        }),
      );
    });

    it("should not call next, should respond with a 400 error for invalid shouldIncludeMatched", () => {
      const req = {
        query: {
          ...requiredQueryParams,
          shouldIncludeMatched: "notABoolean",
        },
      } as unknown as Request;
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;
      const next = jest.fn();

      getPaginatedAggregatorInstitutionsQueryParamValidator(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: '"shouldIncludeMatched" must be a boolean',
        }),
      );
    });

    it("should not call next, should respond with a 400 error for missing shouldIncludeMatched", () => {
      const req = {
        query: {
          ...requiredQueryParams,
          shouldIncludeMatched: undefined,
        },
      } as unknown as Request;
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;
      const next = jest.fn();

      getPaginatedAggregatorInstitutionsQueryParamValidator(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: '"shouldIncludeMatched" is required',
        }),
      );
    });
  });
});
