import { Request, Response } from "express";
import { testInstitutionId } from "../shared/tests/utils";
import { getInstitutionSuccessGraph } from "./getInstitutionSuccessGraph";
import * as graphInfluxQueries from "../shared/utils/graphInfluxQueries";

describe("getInstitutionSuccessGraph", () => {
  it("handles errors", async () => {
    const testError = "test error";

    jest
      .spyOn(graphInfluxQueries, "getGraphMetrics")
      .mockRejectedValue(testError);

    const req = {
      params: {
        institutionId: testInstitutionId,
      },
      query: {
        timeFrame: "30d",
      },
    } as unknown as Request;

    const res = {
      send: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    await getInstitutionSuccessGraph(req, res);

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: testError });
  });

  it("returns institution success graph data", async () => {
    const req = {
      params: {
        institutionId: testInstitutionId,
      },
      query: {
        timeFrame: "30d",
      },
    } as unknown as Request;

    const res = {
      send: jest.fn(),
    } as unknown as Response;

    await getInstitutionSuccessGraph(req, res);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const results = (res.send as jest.Mock).mock.calls[0][0];
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(results.performance.length).toBeGreaterThan(0);
  });
});
