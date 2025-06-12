import { ComboJobTypes } from "@repo/shared-utils";
import { validateStartEvent } from "./eventRoutes";
import { Request, Response, NextFunction } from "express";

describe("validateStartEvent middleware", () => {
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

    validateStartEvent(req, res, next);

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

    validateStartEvent(req, res, next);

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

    validateStartEvent(req, res, next);

    expect(next).toHaveBeenCalled();
    expect((res.status as jest.Mock).mock.calls.length).toBe(0);
  });

  it("returns 400 for missing jobTypes", () => {
    const req = mockReq({
      institutionId: "testInstitutionId",
      aggregatorId: "testAggregatorId",
    }) as Request;
    const res = mockRes();

    validateStartEvent(req, res, next);

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
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

    validateStartEvent(req, res, next);

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
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

    validateStartEvent(req, res, next);

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
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

    validateStartEvent(req, res, next);

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        error: expect.stringContaining("aggregatorId"),
      }),
    );
    expect(next).not.toHaveBeenCalled();
  });
});
