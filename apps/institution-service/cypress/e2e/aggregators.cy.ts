import { Aggregator } from "models/aggregator";
import { runTokenInvalidCheck } from "../support/utils";
import { getAggregators } from "../shared/utils/aggregator";

describe("aggregators", () => {
  describe("/aggregators GET", () => {
    it("returns a list of aggregators for a valid token", () => {
      getAggregators().then(
        (response: Cypress.Response<{ aggregators: Aggregator[] }>) => {
          expect(response.status).to.eq(200);

          expect(response.body.aggregators.length).to.be.greaterThan(0);
          response.body.aggregators.forEach((aggregator) => {
            [
              "id",
              "name",
              "displayName",
              "logo",
              "createdAt",
              "updatedAt",
            ].forEach((attribute) => {
              expect(aggregator).to.haveOwnProperty(attribute);
            });
          });
        },
      );
    });

    runTokenInvalidCheck({
      url: "aggregators",
      method: "GET",
    });
  });
});
