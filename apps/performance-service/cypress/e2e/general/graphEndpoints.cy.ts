import { ComboJobTypes } from "@repo/shared-utils";
import { createAggregatorGraphValidationTests } from "@repo/cypress-utils";
import {
  getDurationGraphPerformanceData,
  getSuccessGraphPerformanceData,
  markSuccessfulEventRequest,
  startConnectionEventRequest,
} from "../../shared/utils/requests";

const expectLooksLikePerformanceData = (item) => {
  expect(item).to.have.property("mx");

  const expectDateString = (prop: string) => {
    expect(item)
      .to.have.property(prop)
      .that.is.a("string")
      .and.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/);
  };

  expectDateString("midpoint");
  expectDateString("start");
  expectDateString("stop");
};
describe("Graph endpoints", () => {
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
      getSuccessGraphPerformanceData({
        timeFrame: "30d",
        jobTypes: ComboJobTypes.TRANSACTIONS,
        aggregators: "mx,sophtron,testAggregatorId",
      }).then((response) => {
        expect(response.status).to.eq(200);
        cy.wrap(response.body)
          .its("performance")
          .each(expectLooksLikePerformanceData);
      });
    });

    createAggregatorGraphValidationTests(getSuccessGraphPerformanceData);
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
      getDurationGraphPerformanceData({
        timeFrame: "30d",
        jobTypes: ComboJobTypes.TRANSACTIONS,
        aggregators: "mx,sophtron,testAggregatorId",
      }).then((response) => {
        expect(response.status).to.eq(200);
        cy.wrap(response.body)
          .its("performance")
          .each(expectLooksLikePerformanceData);
      });
    });

    createAggregatorGraphValidationTests(getDurationGraphPerformanceData);
  });
});
