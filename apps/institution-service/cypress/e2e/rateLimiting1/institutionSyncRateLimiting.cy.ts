import { syncAggregatorInstitutions } from "../noInstitutions/aggregatorInstitutions";

describe("Rate Limit cache endpoint", () => {
  it("tests the sync aggregator institutions endpoint limits requests to 1 per minute", () => {
    syncAggregatorInstitutions().then((response) => {
      expect(response.status).to.eq(202);
    });

    syncAggregatorInstitutions({ failOnStatusCode: false }).then((response) => {
      expect(response.status).to.eq(429);
    });
  });
});
