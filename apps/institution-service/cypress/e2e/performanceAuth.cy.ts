import { PORT } from "../../src/shared/const";
import {
  PERFORMANCE_SERVICE_ACCESS_TOKEN_ENV,
  USER_ACCESS_TOKEN_ENV,
} from "../shared/constants/accessTokens";
import { createAuthorizationHeader } from "../shared/utils/authorization";
import { expectLooksLikeAggregators } from "../shared/utils/aggregator";

describe("Performance auth endpoints", () => {
  describe("/performanceAuth/aggregators GET", () => {
    it("fails with the wrong authorization", () => {
      cy.request({
        failOnStatusCode: false,
        url: `http://localhost:${PORT}/performanceAuth/aggregators`,
        method: "GET",
        headers: {
          Authorization: createAuthorizationHeader(USER_ACCESS_TOKEN_ENV),
        },
      }).then((response) => {
        expect(response.status).to.equal(401);
      });
    });

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

  describe("/performanceAuth/institutions GET", () => {
    it("fails with the wrong authorization", () => {
      cy.request({
        failOnStatusCode: false,
        url: `http://localhost:${PORT}/performanceAuth/institutions`,
        method: "GET",
        headers: {
          Authorization: createAuthorizationHeader(USER_ACCESS_TOKEN_ENV),
        },
      }).then((response) => {
        expect(response.status).to.equal(401);
      });
    });

    it("returns institutions", () => {
      cy.request({
        url: `http://localhost:${PORT}/performanceAuth/institutions?page=1&sortBy=name:ASC&pageSize=10`,
        method: "GET",
        headers: {
          Authorization: createAuthorizationHeader(
            PERFORMANCE_SERVICE_ACCESS_TOKEN_ENV,
          ),
        },
      }).then(
        (
          response: Cypress.Response<{
            institutions: { id: string; name: string; logo: string }[];
          }>,
        ) => {
          expect(response.status).to.equal(200);
          expect(response.body).to.have.property("currentPage");
          expect(response.body).to.have.property("pageSize");
          expect(response.body).to.have.property("totalRecords");
          expect(response.body).to.have.property("totalPages");
          expect(response.body.institutions).to.be.an("array");

          response.body.institutions.forEach((institution) => {
            expect(institution).to.have.property("id");
            expect(institution).to.have.property("name");
            expect(institution).to.have.property("logo");
          });
        },
      );
    });
  });
});
