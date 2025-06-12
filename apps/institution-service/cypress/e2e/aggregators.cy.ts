import { Aggregator } from "models/aggregator";
import { runTokenInvalidCheck } from "../support/utils";
import {
  getAggregatorDurationGraph,
  getAggregators,
  getAggregatorSuccessGraph,
  getAggregatorsWithPerformance,
} from "../shared/utils/aggregator";
import {
  TIME_FRAME_ERROR_TEXT,
  PerformanceDataPoint,
} from "@repo/shared-utils";
import { createAggregatorGraphValidationTests } from "@repo/cypress-utils";

interface AggregatorWithPerformance extends Aggregator {
  avgSuccessRate: number | null;
  avgDuration: number | null;
  jobTypes: {
    avgSuccessRate: number;
    avgDuration: number;
  }[];
}

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

  describe("/aggregators/performance GET", () => {
    it("returns a list of aggregators with performance data included", () => {
      getAggregatorsWithPerformance({}).then(
        (
          response: Cypress.Response<{
            aggregators: AggregatorWithPerformance[];
          }>,
        ) => {
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
              "avgSuccessRate",
              "avgDuration",
              "jobTypes",
            ].forEach((attribute) => {
              expect(aggregator).to.haveOwnProperty(attribute);
            });

            if (["mx", "sophtron", "finicity"].includes(aggregator.name)) {
              expect(aggregator.avgSuccessRate).to.be.gte(0);
              expect(aggregator.avgDuration).to.be.greaterThan(0);
              expect(Object.keys(aggregator.jobTypes).length).to.be.greaterThan(
                0,
              );
            }
          });
        },
      );
    });

    it("fails when timeFrame param is wrong", () => {
      getAggregatorsWithPerformance({
        timeFrame: "3d",
      }).then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body).to.deep.eq({
          error: TIME_FRAME_ERROR_TEXT,
        });
      });
    });

    ["1d", "1w", "30d", "180d", "1y"].forEach((timeFrame) => {
      it(`allows valid timeFrame: ${timeFrame}`, () => {
        getAggregatorsWithPerformance({
          timeFrame,
        }).then((response) => {
          expect(response.status).to.eq(200);
        });
      });
    });

    runTokenInvalidCheck({
      url: "aggregators/performance",
      method: "GET",
    });
  });

  describe("graphEndpoints", () => {
    const validateGraphResponse = (
      response: Cypress.Response<{
        aggregators: Aggregator[];
        performance: PerformanceDataPoint[];
      }>,
    ) => {
      expect(response.status).to.eq(200);
      expect(response.body.aggregators[0]).to.haveOwnProperty("name");

      ["midpoint", "start", "stop"].forEach((attribute) => {
        expect(response.body.performance[0]).to.haveOwnProperty(attribute);
      });
    };

    const createGraphTests = (
      url: string,
      getGraphFunction: (
        params: Record<string, string>,
      ) => Cypress.Chainable<Cypress.Response<unknown>>,
    ) =>
      describe(`${url} GET`, () => {
        runTokenInvalidCheck({
          url,
          method: "GET",
        });

        it("returns a success graph with no parameters", () => {
          getGraphFunction({}).then(validateGraphResponse);
        });

        it("returns a success graph with a valid timeFrame, aggregators, and jobTypes. Filters by aggregators", () => {
          getGraphFunction({
            aggregators: "mx,sophtron",
            jobTypes: "accountNumber,transactions",
            timeFrame: "180d",
          }).then(
            (
              response: Cypress.Response<{
                aggregators: Aggregator[];
                performance: PerformanceDataPoint[];
              }>,
            ) => {
              validateGraphResponse(response);

              expect(response.body.aggregators.length).to.eq(2);

              cy.wrap(response.body.aggregators).each(
                (aggregator: { name: string }) => {
                  expect(["mx", "sophtron"]).to.include(aggregator.name);
                },
              );
            },
          );
        });

        createAggregatorGraphValidationTests(getGraphFunction);
      });

    createGraphTests("aggregators/successGraph", getAggregatorSuccessGraph);
    createGraphTests("aggregators/durationGraph", getAggregatorDurationGraph);
  });
});
