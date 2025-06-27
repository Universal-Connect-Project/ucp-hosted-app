import { ComboJobTypes } from "@repo/shared-utils";
import {
  createPerformanceGraphValidationTests,
  expectLooksLikePerformanceData,
} from "@repo/cypress-utils";
import {
  getAggregatorDurationGraphPerformanceData,
  getAggregatorSuccessGraphPerformanceData,
  markSuccessfulEventRequest,
  startConnectionEventRequest,
} from "../../shared/utils/requests";

describe("aggregator graph endpoints", () => {
  before(() => {
    const connectionId = crypto.randomUUID();

    startConnectionEventRequest({ connectionId }).then((response) => {
      expect(response.status).to.eq(201);
    });

    markSuccessfulEventRequest(connectionId).then((response) => {
      expect(response.status).to.eq(200);
    });

    cy.wait(6000); // 6 seconds for Redis processing poller to process and create a datapoint in Influx
  });

  describe("Aggregator success rate graph endpoints", () => {
    it("fails on improper authorization", () => {
      cy.request({
        url: "metrics/aggregatorSuccessGraph",
        method: "GET",
        failOnStatusCode: false,
        headers: {
          Authorization: "Bearer junk",
        },
      }).then((response) => {
        expect(response.status).to.eq(401);
      });
    });

    it("gets aggregator graph response with valid inputs", () => {
      getAggregatorSuccessGraphPerformanceData({
        timeFrame: "30d",
        jobTypes: ComboJobTypes.TRANSACTIONS,
        aggregators: "mx,sophtron,testAggregatorId",
      }).then((response) => {
        expect(response.status).to.eq(200);
        cy.wrap(response.body)
          .its("performance")
          .each((item) => expectLooksLikePerformanceData(item));
      });
    });

    createPerformanceGraphValidationTests(
      getAggregatorSuccessGraphPerformanceData,
    );
  });

  describe("Aggregator duration graph endpoints", () => {
    it("fails on improper authorization", () => {
      cy.request({
        url: "metrics/aggregatorDurationGraph",
        method: "GET",
        failOnStatusCode: false,
        headers: {
          Authorization: "Bearer junk",
        },
      }).then((response) => {
        expect(response.status).to.eq(401);
      });
    });

    it("gets aggregator graph response with valid inputs", () => {
      getAggregatorDurationGraphPerformanceData({
        timeFrame: "30d",
        jobTypes: ComboJobTypes.TRANSACTIONS,
        aggregators: "mx,sophtron,testAggregatorId",
      }).then((response) => {
        expect(response.status).to.eq(200);
        cy.wrap(response.body)
          .its("performance")
          .each((item) => expectLooksLikePerformanceData(item));
      });
    });

    createPerformanceGraphValidationTests(
      getAggregatorDurationGraphPerformanceData,
    );
  });
});
