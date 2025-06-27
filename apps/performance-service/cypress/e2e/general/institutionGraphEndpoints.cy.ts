import { ComboJobTypes } from "@repo/shared-utils";
import {
  createPerformanceGraphValidationTests,
  expectLooksLikePerformanceData,
} from "@repo/cypress-utils";
import {
  getInstitutionSuccessGraphPerformanceData,
  markSuccessfulEventRequest,
  startConnectionEventRequest,
  testAggregatorId,
  testInstitutionId,
} from "../../shared/utils/requests";

describe("Institution graph endpoints", () => {
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

  describe("Institution success rate graph endpoints", () => {
    it("fails on improper authorization", () => {
      cy.request({
        url: `metrics/institution/${testInstitutionId}/successGraph`,
        method: "GET",
        failOnStatusCode: false,
        headers: {
          Authorization: "Bearer junk",
        },
      }).then((response) => {
        expect(response.status).to.eq(401);
      });
    });

    it("returns an empty array if institutionId is invalid", () => {
      getInstitutionSuccessGraphPerformanceData({
        institutionId: "invalid-id",
      }).then((response) => {
        const body = response.body as { performance: unknown[] };

        expect(body.performance).to.deep.eq([]);
      });
    });

    it("gets institution graph response with valid inputs", () => {
      getInstitutionSuccessGraphPerformanceData({
        aggregators: `mx,sophtron,${testAggregatorId}`,
        institutionId: testInstitutionId,
        jobTypes: ComboJobTypes.TRANSACTIONS,
        timeFrame: "30d",
      }).then((response) => {
        expect(response.status).to.eq(200);
        cy.wrap(response.body)
          .its("performance")
          .each((item) =>
            expectLooksLikePerformanceData(item, testAggregatorId),
          );
      });
    });

    createPerformanceGraphValidationTests(
      (props: object) =>
        getInstitutionSuccessGraphPerformanceData({
          ...props,
          institutionId: testInstitutionId,
        }),
      testAggregatorId,
    );
  });
});
