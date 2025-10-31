import { AggregatorInstitution } from "../../src/models/aggregatorInstitution";
import { PORT } from "../../src/shared/const";
import { AGGREGATOR_INSTITUTIONS_ROUTE } from "../../src/shared/consts/routes";
import { getAggregatorInstitutions } from "../shared/utils/aggregatorInstitutions";
import { runTokenInvalidCheck } from "../support/utils";

describe("aggregator institutions", () => {
  describe("GET /aggregatorInstitutions", () => {
    beforeEach(() => {
      cy.task("clearAggregatorInstitutions");
    });

    runTokenInvalidCheck({
      url: `http://localhost:${PORT}${AGGREGATOR_INSTITUTIONS_ROUTE}`,
      method: "GET",
    });

    it("returns a paginated list of filtered aggregator institutions", () => {
      cy.task("createAggregatorInstitutions", [
        { aggregatorId: 1, id: 1, name: "Bank of the First Order" },
        { aggregatorId: 1, id: 2, name: "Resistance Bank" },
        { aggregatorId: 2, id: 2, name: "Resistance Bank" },
        { aggregatorId: 3, id: 2, name: "Resistance Bank" },
        { aggregatorId: 1, id: 3, name: "Resistance Credit Union" },
      ])
        .then(() =>
          getAggregatorInstitutions({
            qs: {
              aggregatorIds: "1,2",
              page: "1",
              pageSize: "1",
              search: "resistance",
              shouldIncludeMatched: "false",
              sortBy: "name:DESC",
            },
          }),
        )
        .then(
          (
            response: Cypress.Response<{
              aggregatorInstitutions: AggregatorInstitution[];
              currentPage: number;
              totalPages: number;
              totalRecords: number;
            }>,
          ) => {
            expect(response.status).to.eq(200);
            expect(response.body.aggregatorInstitutions.length).to.eq(1);
            expect(response.body.totalRecords).to.eq(3);
            expect(response.body.currentPage).to.eq(1);
            expect(response.body.totalPages).to.eq(3);

            expect(response.body.aggregatorInstitutions[0].name).to.eq(
              "Resistance Credit Union",
            );
          },
        );
    });
  });
});
