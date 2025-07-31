import { http, HttpResponse } from "msw";
import { testAggregators } from "../tests/testData/aggregators";
import { server } from "../tests/testServer";
import { getAggregators } from "./getAggregators";
import { INSTITUTION_SERVICE_AGGREGATORS_URL } from "../tests/handlers";

describe("getAggregators", () => {
  it("returns the aggregators", async () => {
    const aggregators = await getAggregators();
    expect(aggregators).toEqual(testAggregators);
  });

  it("throws an error if the request fails", async () => {
    server.use(
      http.get(INSTITUTION_SERVICE_AGGREGATORS_URL, () => {
        return HttpResponse.json(
          {
            error: "Failed to fetch aggregators",
          },
          { status: 500 },
        );
      }),
    );

    await expect(getAggregators()).rejects.toThrow(
      "Failed to fetch aggregators",
    );
  });
});
