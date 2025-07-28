import { UCP_UI_USER_ACCESS_TOKEN } from "../../shared/constants/accessTokens";
import { createAuthorizationHeader } from "../../shared/utils/authorization";

describe("institutions with performance metrics", () => {
  describe("GET /metrics/institutions", () => {
    it("fails on improper authorization", () => {
      cy.request({
        failOnStatusCode: false,
        url: "metrics/institutions",
        method: "GET",
        qs: {
          page: 1,
          pageSize: 10,
          search: "all data testing",
          timeFrame: "30d",
        },
        headers: {
          Authorization: "Bearer junk",
        },
      }).then((response) => {
        expect(response.status).to.eq(401);
      });
    });

    it("returns an aggregators list and an institutions list with performance metrics", () => {
      cy.request({
        url: "metrics/institutions",
        method: "GET",
        qs: {
          page: 1,
          pageSize: 10,
          search: "all data testing",
          timeFrame: "30d",
        },
        headers: {
          Authorization: createAuthorizationHeader(UCP_UI_USER_ACCESS_TOKEN),
        },
      }).then(
        (
          response: Cypress.Response<{
            aggregators: Array<{
              name: string;
            }>;
            institutions: Array<{
              performance: Record<
                string,
                { avgSuccessRate: string; avgDuration: string }
              >;
            }>;
          }>,
        ) => {
          expect(response.status).to.eq(200);

          expect(response.body.aggregators).to.be.an("array");
          expect(response.body.aggregators).to.have.length.greaterThan(0);

          expect(response.body.institutions).to.be.an("array");
          expect(response.body.institutions).to.have.length.greaterThan(0);

          expect(
            response.body.institutions.some(({ performance }) =>
              Object.values(performance).some(
                (value) => value.avgSuccessRate && value.avgDuration,
              ),
            ),
          ).to.be.true;
        },
      );
    });
  });
});
