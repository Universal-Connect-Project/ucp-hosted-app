import { Aggregator } from "models/aggregator";
import { runTokenInvalidCheck } from "../support/utils";
import {
  getAggregators,
  getAggregatorsWithPerformance,
} from "../shared/utils/requests";

interface AggregatorWithPerformance extends Aggregator {
  avgSuccessRate: number | null;
  avgDuration: number | null;
  jobTypes: {
    avgSuccessRate: number;
    avgDuration: number;
  }[];
}

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
            expect(aggregator.jobTypes.length).to.be.greaterThan(0);
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
        error: '"timeFrame" must be one of [, 1d, 1w, 30d, 180d, 1y]',
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
