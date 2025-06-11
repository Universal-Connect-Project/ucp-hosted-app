import { Request, Response } from "express";
import { getAggregatorDurationGraph } from "./getAggregatorDurationGraph";
import { aggregatorDurationGraphData } from "../test/testData/aggregators";
/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */

describe("getAggregatorDurationGraph", () => {
  it("returns a list of aggregators and their performance data", async () => {
    const req = {
      query: {},
    } as unknown as Request;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;
    await getAggregatorDurationGraph(req, res);

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        aggregators: expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(Number),
            name: expect.any(String),
            displayName: expect.any(String) || null,
            logo: expect.any(String) || null,
          }),
        ]),
        performance: aggregatorDurationGraphData.performance,
      }),
    );

    const firstCall = (res.json as jest.Mock).mock.calls?.[0][0];

    expect(firstCall.aggregators.length).toBeGreaterThan(1);
  });
});
