import {
  JOB_TYPES_ERROR_TEXT,
  TIME_FRAME_NOT_REQUIRED_ERROR_TEXT,
} from "@repo/shared-utils";
import { UCP_UI_USER_ACCESS_TOKEN } from "../../shared/constants/accessTokens";
import { createAuthorizationHeader } from "../../shared/utils/authorization";

describe("institutions with performance metrics", () => {
  describe("GET /metrics/institutions", () => {
    it("fails with improper parameters", () => {
      const validQs = {
        page: 1,
        pageSize: 10,
        search: "all data testing",
        timeFrame: "30d",
        sortBy: "name:asc",
      };

      [
        {
          qs: { ...validQs, page: undefined },
          error: '"page" is not allowed to be empty',
        },
        {
          qs: { ...validQs, pageSize: undefined },
          error: '"pageSize" is not allowed to be empty',
        },
        {
          qs: { ...validQs, timeFrame: "junk" },
          error: TIME_FRAME_NOT_REQUIRED_ERROR_TEXT,
        },
        {
          qs: { ...validQs, jobTypes: "junk" },
          error: JOB_TYPES_ERROR_TEXT,
        },
      ].forEach(({ qs, error }) => {
        cy.request({
          failOnStatusCode: false,
          url: "metrics/institutions",
          method: "GET",
          qs,
          headers: {
            Authorization: createAuthorizationHeader(UCP_UI_USER_ACCESS_TOKEN),
          },
        }).then((response: Cypress.Response<{ error: string }>) => {
          expect(response.status).to.eq(400);
          expect(response.body.error).to.eq(error);
        });
      });
    });

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

    it("returns an aggregators list, an institutions list with performance metrics, and pagination data", () => {
      cy.request({
        url: "metrics/institutions",
        method: "GET",
        qs: {
          jobTypes:
            "accountOwner,accountNumber,transactions,transactionHistory",
          page: 1,
          pageSize: 10,
          search: "all data testing",
          sortBy: "name:asc",
          timeFrame: "180d",
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
            currentPage: number;
            pageSize: number;
            totalRecords: number;
            totalPages: number;
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

          expect(response.body.currentPage).to.eq(1);
          expect(response.body.pageSize).to.eq(10);
          expect(response.body.totalRecords).to.be.greaterThan(0);
          expect(response.body.totalPages).to.be.greaterThan(0);

          expect(
            response.body.institutions.some(({ performance }) =>
              Object.values(performance).some(
                (value) =>
                  typeof value.avgSuccessRate === "number" &&
                  typeof value.avgDuration === "number",
              ),
            ),
          ).to.eq(true);
        },
      );
    });
  });
});
