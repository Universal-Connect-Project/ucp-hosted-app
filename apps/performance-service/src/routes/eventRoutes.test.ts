/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/unbound-method */
import { ComboJobTypes } from "@repo/shared-utils";
import {
  validateStartEventRequest,
  validateUpdateDurationRequest,
} from "./eventRoutes";
import { Request, Response, NextFunction } from "express";

describe("validateStartEventRequest middleware", () => {
  const mockReq = (body: unknown): Partial<Request> => ({ body });
  const mockRes = () => {
    const res: Partial<Response> = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res as Response;
  };
  const next: NextFunction = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("calls next() for valid body", () => {
    const req = mockReq({
      jobTypes: [ComboJobTypes.TRANSACTIONS],
      institutionId: "testInstitutionId",
      aggregatorId: "testAggregatorId",
    }) as Request;
    const res = mockRes();

    validateStartEventRequest(req, res, next);

    expect(next).toHaveBeenCalled();
    expect((res.status as jest.Mock).mock.calls.length).toBe(0);
  });

  it("calls next() for valid body with recordDuration true", () => {
    const req = mockReq({
      jobTypes: [ComboJobTypes.TRANSACTIONS],
      institutionId: "testInstitutionId",
      aggregatorId: "testAggregatorId",
      recordDuration: true,
    }) as Request;
    const res = mockRes();

    validateStartEventRequest(req, res, next);

    expect(next).toHaveBeenCalled();
    expect((res.status as jest.Mock).mock.calls.length).toBe(0);
  });

  it("calls next() for valid body with recordDuration false", () => {
    const req = mockReq({
      jobTypes: [ComboJobTypes.TRANSACTIONS],
      institutionId: "testInstitutionId",
      aggregatorId: "testAggregatorId",
      recordDuration: false,
    }) as Request;
    const res = mockRes();

    validateStartEventRequest(req, res, next);

    expect(next).toHaveBeenCalled();
    expect((res.status as jest.Mock).mock.calls.length).toBe(0);
  });

  it("returns 400 for missing jobTypes", () => {
    const req = mockReq({
      institutionId: "testInstitutionId",
      aggregatorId: "testAggregatorId",
    }) as Request;
    const res = mockRes();

    validateStartEventRequest(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.stringContaining("jobTypes"),
      }),
    );
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 400 for invalid jobTypes value", () => {
    const req = mockReq({
      jobTypes: ["invalidType"],
      institutionId: "testInstitutionId",
      aggregatorId: "testAggregatorId",
    }) as Request;
    const res = mockRes();

    validateStartEventRequest(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.stringContaining("jobTypes"),
      }),
    );
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 400 for missing institutionId", () => {
    const req = mockReq({
      jobTypes: [ComboJobTypes.TRANSACTIONS],
      aggregatorId: "testAggregatorId",
    }) as Request;
    const res = mockRes();

    validateStartEventRequest(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.stringContaining("institutionId"),
      }),
    );
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 400 for missing aggregatorId", () => {
    const req = mockReq({
      jobTypes: [ComboJobTypes.TRANSACTIONS],
      institutionId: "testInstitutionId",
    }) as Request;
    const res = mockRes();

    validateStartEventRequest(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.stringContaining("aggregatorId"),
      }),
    );
    expect(next).not.toHaveBeenCalled();
  });
});

describe("validateUpdateDurationRequest middleware", () => {
  const mockReq = (body: unknown): Partial<Request> => ({ body });
  const mockRes = () => {
    const res: Partial<Response> = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res as Response;
  };
  const next: NextFunction = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("calls next() for valid durationOverwrite", () => {
    const req = mockReq({
      durationOverwrite: 5000,
    }) as Request;
    const res = mockRes();

    validateUpdateDurationRequest(req, res, next);

    expect(next).toHaveBeenCalled();
    expect((res.status as jest.Mock).mock.calls.length).toBe(0);
  });

  it("calls next() for valid durationOverwrite of zero", () => {
    const req = mockReq({
      durationOverwrite: 0,
    }) as Request;
    const res = mockRes();

    validateUpdateDurationRequest(req, res, next);

    expect(next).toHaveBeenCalled();
    expect((res.status as jest.Mock).mock.calls.length).toBe(0);
  });

  it("returns 400 for missing durationOverwrite", () => {
    const req = mockReq({}) as Request;
    const res = mockRes();

    validateUpdateDurationRequest(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.stringContaining("durationOverwrite"),
      }),
    );
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 400 for negative durationOverwrite", () => {
    const req = mockReq({
      durationOverwrite: -100,
    }) as Request;
    const res = mockRes();

    validateUpdateDurationRequest(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.stringContaining("durationOverwrite"),
      }),
    );
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 400 for non-numeric durationOverwrite", () => {
    const req = mockReq({
      durationOverwrite: "invalid",
    }) as Request;
    const res = mockRes();

    validateUpdateDurationRequest(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.stringContaining("durationOverwrite"),
      }),
    );
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 400 for null durationOverwrite", () => {
    const req = mockReq({
      durationOverwrite: null,
    }) as Request;
    const res = mockRes();

    validateUpdateDurationRequest(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.stringContaining("durationOverwrite"),
      }),
    );
    expect(next).not.toHaveBeenCalled();
  });
});
