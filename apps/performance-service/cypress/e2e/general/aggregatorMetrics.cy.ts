/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { UCP_UI_USER_ACCESS_TOKEN } from "../../shared/constants/accessTokens";
import { createAuthorizationHeader } from "../../shared/utils/authorization";
import {
  startConnectionEventRequest,
  markSuccessfulEventRequest,
  getAggregatorPerformanceMetrics,
} from "../../shared/utils/requests";

describe("Aggreagator Metrics", () => {
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

  it("fails on improper authorization", () => {
    cy.request({
      url: "metrics/aggregators",
      method: "GET",
      failOnStatusCode: false,
      headers: {
        Authorization: createAuthorizationHeader(UCP_UI_USER_ACCESS_TOKEN),
      },
    }).then((response) => {
      expect(response.status).to.eq(401);
    });
  });

  it("fails when timeFrame param is wrong", () => {
    getAggregatorPerformanceMetrics({
      timeFrame: "3d",
    }).then((response) => {
      expect(response.status).to.eq(400);
      expect(response.body).to.deep.eq({
        error: '"timeFrame" must be one of [, 1d, 1w, 30d, 180d, 1y]',
      });
    });
  });

  it("works without timeFrame param", () => {
    getAggregatorPerformanceMetrics({}).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property("testAggregatorId");

      expect(response.body.testAggregatorId).to.have.property("avgSuccessRate");
      expect(response.body.testAggregatorId).to.have.property("avgDuration");
      expect(response.body.testAggregatorId).to.have.property("jobTypes");

      expect(
        response.body.testAggregatorId.jobTypes.transactions,
      ).to.have.property("avgSuccessRate");
      expect(
        response.body.testAggregatorId.jobTypes.transactions,
      ).to.have.property("avgDuration");
    });
  });

  it("works with timeFrame param", () => {
    getAggregatorPerformanceMetrics({
      timeFrame: "1y",
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property("testAggregatorId");

      expect(response.body.testAggregatorId).to.have.property("avgSuccessRate");
      expect(response.body.testAggregatorId).to.have.property("avgDuration");
      expect(response.body.testAggregatorId).to.have.property("jobTypes");

      expect(
        response.body.testAggregatorId.jobTypes.transactions,
      ).to.have.property("avgSuccessRate");
      expect(
        response.body.testAggregatorId.jobTypes.transactions,
      ).to.have.property("avgDuration");
    });
  });
});
