import { PORT } from "shared/const";
import { PERFORMANCE_SERVICE_ACCESS_TOKEN_ENV } from "../../shared/constants/accessTokens";
import { createAuthorizationHeader } from "../../shared/utils/authorization";

describe("Rate limit performance auth unauthenticated", () => {
  it("rate limits more quickly if not authorized", () => {
    for (let i = 0; i < 100; i++) {
      cy.request({
        failOnStatusCode: false,
        method: "GET",
        url: `http://localhost:${PORT}/performanceAuth/aggregators`,
      }).then((response) => {
        expect(response.status).to.eq(401);
      });
    }

    for (let i = 0; i < 4; i++) {
      cy.request({
        method: "GET",
        failOnStatusCode: false,
        headers: {
          Authorization: createAuthorizationHeader(
            PERFORMANCE_SERVICE_ACCESS_TOKEN_ENV,
          ),
        },
        url: `http://localhost:${PORT}/performanceAuth/aggregators`,
      }).then((response) => {
        expect(response.status).to.eq(429);
      });
    }
  });
});
