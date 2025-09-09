import { PORT } from "../../../src/shared/const";
import { CachedInstitution } from "../../../src/tasks/loadInstitutionsFromJson";
import { WIDGET_ACCESS_TOKEN } from "../../shared/constants/accessTokens";
import { createAuthorizationHeader } from "../../shared/utils/authorization";

describe("Rate Limit cache endpoint", () => {
  it("tests the instituion/cacheList endpoint limits requests to 3 per minute", () => {
    for (let i = 0; i < 3; i++) {
      cy.request({
        url: `http://localhost:${PORT}/institutions/cacheList`,
        method: "GET",
        headers: {
          Authorization: createAuthorizationHeader(WIDGET_ACCESS_TOKEN),
        },
      }).then((response: Cypress.Response<CachedInstitution[]>) => {
        expect(response.status).to.eq(200);
      });
    }

    for (let i = 0; i < 4; i++) {
      cy.request({
        url: `http://localhost:${PORT}/institutions/cacheList`,
        method: "GET",
        failOnStatusCode: false,
        headers: {
          Authorization: createAuthorizationHeader(WIDGET_ACCESS_TOKEN),
        },
      }).then((response: Cypress.Response<CachedInstitution[]>) => {
        expect(response.status).to.eq(429);
      });
    }
  });
});
