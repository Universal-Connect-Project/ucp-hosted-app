import { ComboJobTypes } from "@repo/shared-utils";
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

    it("fails when timeFrame param is wrong", () => {
      getSuccessGraphPerformanceData({
        timeFrame: "3d",
        jobTypes: ComboJobTypes.TRANSACTIONS,
        aggregators: "mx,sophtron",
      }).then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body).to.deep.eq({
          error: '"timeFrame" must be one of [, 1d, 1w, 30d, 180d, 1y]',
        });
      });
    });

    it("fails when jobType param is wrong", () => {
      getSuccessGraphPerformanceData({
        timeFrame: "30d",
        jobTypes: "invalidJobType",
        aggregators: "mx,sophtron",
      }).then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body).to.deep.eq({
          error:
            '"jobTypes" contains invalid values. Valid values include: [accountNumber, accountOwner, transactions, transactionHistory] or any combination of these joined by |',
        });
      });
    });

    it("allows any aggregator but returns an empty array when aggregator is invalid", () => {
      getSuccessGraphPerformanceData({
        aggregators: "nonexistant",
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.deep.eq({ performance: [] });
      });
    });

    it("allows combined JobTypes in any order", () => {
      getSuccessGraphPerformanceData({
        timeFrame: "30d",
        jobTypes: `${ComboJobTypes.TRANSACTIONS}|${ComboJobTypes.ACCOUNT_NUMBER},${ComboJobTypes.TRANSACTIONS}`,
        aggregators: "mx,sophtron,testAggregatorId",
      }).then((response) => {
        expect(response.status).to.eq(200);
        cy.wrap(response.body)
          .its("performance")
          .each(expectLooksLikePerformanceData);
      });
    });

    it("works without any filter params", () => {
      getSuccessGraphPerformanceData({}).then((response) => {
        expect(response.status).to.eq(200);
        cy.wrap(response.body)
          .its("performance")
          .each(expectLooksLikePerformanceData);
      });
    });
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

    it("fails when timeFrame param is wrong", () => {
      getDurationGraphPerformanceData({
        timeFrame: "3d",
        jobTypes: ComboJobTypes.TRANSACTIONS,
        aggregators: "mx,sophtron",
      }).then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body).to.deep.eq({
          error: '"timeFrame" must be one of [, 1d, 1w, 30d, 180d, 1y]',
        });
      });
    });

    it("fails when jobType param is wrong", () => {
      getDurationGraphPerformanceData({
        timeFrame: "30d",
        jobTypes: "invalidJobType",
        aggregators: "mx,sophtron",
      }).then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body).to.deep.eq({
          error:
            '"jobTypes" contains invalid values. Valid values include: [accountNumber, accountOwner, transactions, transactionHistory] or any combination of these joined by |',
        });
      });
    });

    it("allows any aggregator but returns an empty array when aggregator is invalid", () => {
      getDurationGraphPerformanceData({
        aggregators: "nonexistant",
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.deep.eq({ performance: [] });
      });
    });

    it("allows combined JobTypes in any order", () => {
      getDurationGraphPerformanceData({
        timeFrame: "30d",
        jobTypes: `${ComboJobTypes.TRANSACTIONS}|${ComboJobTypes.ACCOUNT_NUMBER},${ComboJobTypes.TRANSACTIONS}`,
        aggregators: "mx,sophtron,testAggregatorId",
      }).then((response) => {
        expect(response.status).to.eq(200);
        cy.wrap(response.body)
          .its("performance")
          .each(expectLooksLikePerformanceData);
      });
    });

    it("works without any filter params", () => {
      getDurationGraphPerformanceData({}).then((response) => {
        expect(response.status).to.eq(200);
        cy.wrap(response.body)
          .its("performance")
          .each(expectLooksLikePerformanceData);
      });
    });
  });
});
