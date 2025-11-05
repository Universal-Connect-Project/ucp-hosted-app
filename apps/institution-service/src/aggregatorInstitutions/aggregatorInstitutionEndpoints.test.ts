/* eslint-disable @typescript-eslint/unbound-method */
import { Request, Response } from "express";
import {
  createAndLinkAggregatorInstitutionBodyValidator,
  getPaginatedAggregatorInstitutionsQueryParamValidator,
  linkAggregatorInstitutionBodyValidator,
} from "./aggregatorInstitutionEndpoints";

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
          search: "Test Institution",
          sortBy: "name:DESC",
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

    it("should not call next, should respond with a 400 error for invalid sortBy", () => {
      const req = {
        query: {
          ...requiredQueryParams,
          sortBy: "invalidSortBy",
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
          error:
            'Sort parameter must be in the format "columnName:ORDER", where ORDER is ASC or DESC (e.g., name:ASC).',
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

  describe("linkAggregatorInstitutionBodyValidator", () => {
    const validRequestBody = {
      aggregatorId: 1,
      aggregatorInstitutionId: "agg-inst-123",
      institutionId: "inst-456",
    };

    it("should call next() for valid request body", () => {
      const req = {
        body: validRequestBody,
      } as unknown as Request;
      const res = {} as Response;
      const next = jest.fn();

      linkAggregatorInstitutionBodyValidator(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    describe("missing required fields", () => {
      ["aggregatorInstitutionId", "aggregatorId", "institutionId"].forEach(
        (field) => {
          it(`should not call next, should respond with a 400 error for missing ${field}`, () => {
            const req = {
              body: {
                ...validRequestBody,
                [field]: undefined,
              },
            } as unknown as Request;
            const res = {
              status: jest.fn().mockReturnThis(),
              json: jest.fn(),
            } as unknown as Response;
            const next = jest.fn();

            linkAggregatorInstitutionBodyValidator(req, res, next);

            expect(next).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith(
              expect.objectContaining({
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                error: expect.stringContaining(`"${field}" is required`),
              }),
            );
          });
        },
      );
    });
  });

  describe("createAndLinkAggregatorInstitutionBodyValidator", () => {
    const validRequestBody = {
      aggregatorId: 1,
      aggregatorInstitutionId: "agg-inst-123",
      institutionData: {
        is_test_bank: true,
        keywords: ["test", "institution"],
        logo: "https://testinstitution.com/logo.png",
        name: "Test Institution",
        routing_numbers: ["123456789"],
        url: "https://testinstitution.com",
      },
    };

    it("should call next() for valid request body", () => {
      const req = {
        body: validRequestBody,
      } as unknown as Request;
      const res = {} as Response;
      const next = jest.fn();

      createAndLinkAggregatorInstitutionBodyValidator(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it("should not call next, should respond with a 400 error for missing aggregatorId", () => {
      const req = {
        body: {
          ...validRequestBody,
          aggregatorId: undefined,
        },
      } as unknown as Request;
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;
      const next = jest.fn();

      createAndLinkAggregatorInstitutionBodyValidator(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: '"aggregatorId" is required',
        }),
      );
    });

    it("should not call next, should respond with a 400 error for missing aggregatorInstitutionId", () => {
      const req = {
        body: {
          ...validRequestBody,
          aggregatorInstitutionId: undefined,
        },
      } as unknown as Request;
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;
      const next = jest.fn();

      createAndLinkAggregatorInstitutionBodyValidator(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: '"aggregatorInstitutionId" is required',
        }),
      );
    });

    it("should not call next, should respond with a 400 error for missing institutionData", () => {
      const req = {
        body: {
          ...validRequestBody,
          institutionData: undefined,
        },
      } as unknown as Request;
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;
      const next = jest.fn();

      createAndLinkAggregatorInstitutionBodyValidator(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: '"institutionData" is required',
        }),
      );
    });

    it("should not call next, should respond with a 400 error for invalid institutionData", () => {
      const req = {
        body: {
          ...validRequestBody,
          institutionData: {
            // Missing required 'name' field
            url: "https://testinstitution.com",
          },
        },
      } as unknown as Request;
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;
      const next = jest.fn();

      createAndLinkAggregatorInstitutionBodyValidator(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: '"institutionData.name" is required',
        }),
      );
    });
  });
});
