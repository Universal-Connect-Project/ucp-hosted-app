/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Request, Response } from "express";
import { Aggregator } from "../models/aggregator";
import { createTestAuthorization } from "../test/utils";
import { getAggregators } from "./aggregatorController";

describe("getAggregators", () => {
  it("gets all the aggregators in the database", async () => {
    const { count, rows: _aggregators } = await Aggregator.findAndCountAll();

    const req = {
      headers: {
        authorization: createTestAuthorization({
          permissions: [],
        }),
      },
    } as Request;
    let responseData: { aggregators: object[] } = { aggregators: [] };
    const res = {
      json: jest
        .fn()
        .mockImplementation(
          (body: { aggregators: object[] }) => (responseData = body),
        ),
      status: jest.fn().mockReturnThis(),
    } as unknown as Response;

    await getAggregators(req, res);

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
      }),
    );

    expect(responseData?.aggregators.length).toBe(count);
  });
});
