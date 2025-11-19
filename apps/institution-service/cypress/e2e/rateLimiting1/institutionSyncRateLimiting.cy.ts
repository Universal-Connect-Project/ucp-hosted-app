import { syncAggregatorInstitutions } from "../../shared/utils/aggregatorInstitutions";

describe("Rate Limit cache endpoint", () => {
  it("tests the sync aggregator institutions endpoint limits requests to 1 per minute", () => {
    syncAggregatorInstitutions({ aggregatorName: "finicity" }).then(
      (response) => {
        expect(response.status).to.eq(202);
      },
    );

    syncAggregatorInstitutions({
      aggregatorName: "finicity",
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(429);
    });
  });
});
