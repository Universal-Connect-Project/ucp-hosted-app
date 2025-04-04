/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Request, Response } from "express";
import { createTestAuthorization } from "../test/utils";
import { getAggregators } from "./aggregatorController";
import { server } from "../test/testServer";
import { http, HttpResponse } from "msw";
import { AGGREGATOR_PERFORMANCE_URL } from "../test/handlers";

describe("getAggregators", () => {
  it("gets all the aggregators in the database with performance data when performance service is available", async () => {
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
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        aggregators: expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(Number),
            name: expect.any(String),
            displayName: expect.any(String) || null,
            logo: expect.any(String) || null,
            avgSuccessRate: expect.any(Number),
            avgDuration: expect.any(Number),
            jobTypes: expect.arrayContaining([
              expect.objectContaining({
                accountNumber: expect.objectContaining({
                  avgSuccessRate: expect.any(Number),
                  avgDuration: expect.any(Number),
                }),
              }),
            ]),
          }),
        ]),
      }),
    );
  });

  it("gets all the aggregators in the database without performance data when performance service is NOT available", async () => {
    const errorMessage = "System Error";
    server.use(
      http.get(AGGREGATOR_PERFORMANCE_URL, () =>
        HttpResponse.json({ error: errorMessage }, { status: 500 }),
      ),
    );

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
        warning: "Performance data failed to fetch",
        error: errorMessage,
      }),
    );
  });
});
