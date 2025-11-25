import { PORT } from "../../../src/shared/const";
import { PERFORMANCE_SERVICE_ACCESS_TOKEN_ENV } from "../../shared/constants/accessTokens";
import { createAuthorizationHeader } from "../../shared/utils/authorization";
import { storePerformanceM2MToken } from "../../support/utils";

describe("Rate limit performance auth authenticated", () => {
  before(() => {
    return storePerformanceM2MToken();
  });

  it("tests the /performanceAuth/aggregators endpoint limits requests to 500 per minute", () => {
    for (let i = 0; i < 500; i++) {
      cy.request({
        url: `http://localhost:${PORT}/performanceAuth/aggregators`,
        method: "GET",
        headers: {
          Authorization: createAuthorizationHeader(
            PERFORMANCE_SERVICE_ACCESS_TOKEN_ENV,
          ),
        },
      }).then((response) => {
        expect(response.status).to.eq(200);
      });
    }

    for (let i = 0; i < 4; i++) {
      cy.request({
        url: `http://localhost:${PORT}/performanceAuth/aggregators`,
        method: "GET",
        failOnStatusCode: false,
        headers: {
          Authorization: createAuthorizationHeader(
            PERFORMANCE_SERVICE_ACCESS_TOKEN_ENV,
          ),
        },
      }).then((response) => {
        expect(response.status).to.eq(429);
      });
    }
  });
});
