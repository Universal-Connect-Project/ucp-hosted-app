/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Request, Response } from "express";
import { createTestAuthorization } from "../test/utils";
import { getAggregators } from "./getAggregators";
import { Aggregator } from "../models/aggregator";

describe("getAggregators", () => {
  it("gets all the aggregators in the database", async () => {
    const req = {
      headers: {
        authorization: createTestAuthorization({
          permissions: [],
        }),
      },
    } as Request;
    const res = {
      json: jest.fn(),
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
  });

  it("gets an error response on failure", async () => {
    jest.spyOn(Aggregator, "findAll").mockRejectedValue(new Error());

    const req = {
      headers: {
        authorization: createTestAuthorization({
          permissions: [],
        }),
      },
      query: {},
    } as Request;
    const res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    } as unknown as Response;

    await getAggregators(req, res);

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: "An error occurred while fetching aggregators.",
    });
  });
});
