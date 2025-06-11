/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */
import { PERFORMANCE_SERVICE_URL } from "../shared/environment";
import { createGetAggregatorGraph } from "./createGetAggregatorGraph";
import { Request, Response } from "express";
import { server } from "../test/testServer";
import { http, HttpResponse } from "msw";

const getAggregatorGraph = createGetAggregatorGraph("test");

const url = `${PERFORMANCE_SERVICE_URL}/metrics/test`;

const responseData = {
  performance: ["test"],
};

describe("createGetAggregatorGraph", () => {
  beforeEach(() => {
    server.use(http.get(url, () => HttpResponse.json(responseData)));
  });

  it("returns an empty list of aggregators if the supplied aggregators query parameter doesn't match any aggregators", async () => {
    const req = {
      query: {
        aggregators: "nonexistent-aggregator",
      },
    } as unknown as Request;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;
    await getAggregatorGraph(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        aggregators: [],
      }),
    );
  });

  it("returns a list of aggregators and their performance when provided with no parameters", async () => {
    const req = {
      query: {},
    } as unknown as Request;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;
    await getAggregatorGraph(req, res);

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
        performance: responseData.performance,
      }),
    );

    const firstCall = (res.json as jest.Mock).mock.calls?.[0][0];

    expect(firstCall.aggregators.length).toBeGreaterThan(1);
  });

  it("filters the aggregators list by the provided aggregators and handles all parameters", async () => {
    const req = {
      query: {
        aggregators: "mx",
        jobTypes: "transactions,account_number",
        timeFrame: "30d",
      },
    } as unknown as Request;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;
    await getAggregatorGraph(req, res);

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
        performance: responseData.performance,
      }),
    );

    const firstCall = (res.json as jest.Mock).mock.calls?.[0][0] as {
      aggregators: Array<{ name: string }>;
    };

    const aggregatorNames = firstCall.aggregators.map(
      (aggregator) => aggregator.name,
    );

    expect(aggregatorNames).toContain("mx");

    expect(aggregatorNames).toHaveLength(1);
  });

  it("responds with a 500 status code if the request fails", async () => {
    server.use(http.get(url, () => new HttpResponse(null, { status: 400 })));

    const req = {
      query: {},
    } as unknown as Request;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    await getAggregatorGraph(req, res);

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: "An error occurred while fetching aggregators.",
    });
  });
});
