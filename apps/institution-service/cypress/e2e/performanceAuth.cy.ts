import { PORT } from "shared/const";
import { PERFORMANCE_SERVICE_ACCESS_TOKEN_ENV } from "../shared/constants/accessTokens";
import { createAuthorizationHeader } from "../shared/utils/authorization";
import { expectLooksLikeAggregators } from "../shared/utils/aggregator";

describe("Performance auth endpoints", () => {
  describe("/performanceAuth/aggregators GET", () => {
    it("returns aggregators", () => {
      cy.request({
        url: `http://localhost:${PORT}/performanceAuth/aggregators`,
        method: "GET",
        headers: {
          Authorization: createAuthorizationHeader(
            PERFORMANCE_SERVICE_ACCESS_TOKEN_ENV,
          ),
        },
      }).then(expectLooksLikeAggregators);
    });
  });
});
