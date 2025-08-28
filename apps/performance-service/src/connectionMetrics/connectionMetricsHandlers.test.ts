/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { getConnectionPerformanceData } from "./connectionMetricsHandlers";
import { recordPerformanceMetric } from "../services/influxDb";
import { ComboJobTypes } from "@repo/shared-utils";
import { Request, Response } from "express";
import { wait } from "../shared/tests/utils";

describe("getConnectionPerformanceData", () => {
  const connectionId = "MBR-123";
  it("gets 404 when no performance data is found", async () => {
    const req = {
      params: {
        connectionId,
      },
    } as unknown as Request;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    await getConnectionPerformanceData(req, res);

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      error: "No performance data found for the specified connection ID",
    });
  });

  it("gets 200 when performance data is found", async () => {
    const connectionId = "test1";
    const req = {
      params: {
        connectionId,
      },
    } as unknown as Request;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    await recordPerformanceMetric({
      connectionId,
      pausedAt: null,
      clientId: "client_456",
      jobTypes: [ComboJobTypes.ACCOUNT_NUMBER],
      institutionId: "testInstitution",
      aggregatorId: "mx",
      startedAt: 1700000000000,
      userInteractionTime: 0,
      recordDuration: true,
      shouldRecordResult: true,
    });

    await wait(2000);

    await getConnectionPerformanceData(req, res);

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      aggregatorId: "mx",
      connectionId: "test1",
      institutionId: "testInstitution",
      jobTypes: "accountNumber",
      successMetric: {
        isSuccess: false,
        timestamp: expect.any(String),
      },
    });
  });
});
