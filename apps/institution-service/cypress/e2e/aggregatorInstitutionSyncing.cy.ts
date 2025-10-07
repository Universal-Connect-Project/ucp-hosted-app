import { USER_ACCESS_TOKEN_ENV } from "../shared/constants/accessTokens";
import { syncAggregatorInstitutions } from "../shared/utils/aggregatorInstitutions";

describe("aggregator institution syncing", () => {
  it("fails when a non-admin tries to sync institutions", () => {
    syncAggregatorInstitutions({
      accessTokenEnv: USER_ACCESS_TOKEN_ENV,
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(403);
    });
  });

  it("allows a super admin to sync institutions and waits for completion", () => {
    syncAggregatorInstitutions({
      shouldWaitForCompletion: true,
      timeout: 120000,
    }).then((response) => {
      expect(response.status).to.eq(200);
    });
  });

  it("allows a super admin to sync institutions and doesn't wait for completion", () => {
    syncAggregatorInstitutions().then((response) => {
      expect(response.status).to.eq(202);
    });
  });
});
