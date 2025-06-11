import { http, HttpResponse } from "msw";
import { server } from "../test/testServer";
import { createGetAggregatorGraphFromPerformanceService } from "./createGetAggregatorGraphFromPerformanceService";
import { PERFORMANCE_SERVICE_URL } from "../shared/environment";

const getAggregatorGraphFromPerformanceService =
  createGetAggregatorGraphFromPerformanceService("test");

const url = `${PERFORMANCE_SERVICE_URL}/metrics/test`;

const responseData = {
  test: "test",
};

describe("createGetAggregatorGraphFromPerformanceService", () => {
  let queryParams = {};

  beforeEach(() => {
    queryParams = {};

    server.use(
      http.get(url, ({ request }) => {
        const searchParams = new URL(request.url).searchParams;
        queryParams = Object.fromEntries(searchParams.entries());

        return HttpResponse.json(responseData);
      }),
    );
  });

  it("fetches aggregator graph data from the performance service with the given url and parameters", async () => {
    const parameters = {
      aggregators: "aggregators",
      jobTypes: "jobTypes",
      timeFrame: "timeFrame",
    };

    const response = await getAggregatorGraphFromPerformanceService(parameters);

    expect(response).toEqual(responseData);
    expect(queryParams).toEqual(parameters);
  });

  it("only passes defined query parameters to the performance service", async () => {
    const parameters = {
      aggregators: "",
      jobTypes: "",
      timeFrame: undefined,
    };

    const response = await getAggregatorGraphFromPerformanceService(parameters);

    expect(response).toEqual(responseData);
    expect(queryParams).toEqual({});
  });

  it("throws an error if the performance service returns an error", async () => {
    const error = "testError";

    server.use(
      http.get(url, () => HttpResponse.json({ error }, { status: 500 })),
    );

    const parameters = {
      aggregators: "aggregators",
      jobTypes: "jobTypes",
      timeFrame: "timeFrame",
    };

    await expect(
      getAggregatorGraphFromPerformanceService(parameters),
    ).rejects.toThrow(error);
  });
});
