import { ComboJobTypes } from "@repo/shared-utils";
import {
  createPerformanceGraphValidationTests,
  expectPerformanceResults,
} from "../../shared/utils/aggregatorGraphValidation";
import {
  getInstitutionDurationGraphPerformanceData,
  getInstitutionSuccessGraphPerformanceData,
  markSuccessfulEventRequest,
  startConnectionEventRequest,
  testAggregatorId,
  testInstitutionId,
} from "../../shared/utils/requests";

const createInstitutionGraphTests = ({
  fetchFunction,
  metric,
}: {
  fetchFunction: typeof getInstitutionDurationGraphPerformanceData;
  metric: string;
}) =>
  describe(`Institution ${metric} graph endpoints`, () => {
    it("fails on improper authorization", () => {
      cy.request({
        url: `metrics/institution/${testInstitutionId}/${metric}Graph`,
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
      fetchFunction({
        institutionId: "invalid-id",
      }).then((response) => {
        const body = response.body as { performance: unknown[] };

        expect(body.performance).to.deep.eq([]);
      });
    });

    it("gets institution graph response with valid inputs", () => {
      fetchFunction({
        aggregators: `mx,sophtron,${testAggregatorId}`,
        institutionId: testInstitutionId,
        jobTypes: ComboJobTypes.TRANSACTIONS,
        timeFrame: "30d",
      }).then(expectPerformanceResults);
    });

    createPerformanceGraphValidationTests((props: object) =>
      fetchFunction({
        ...props,
        institutionId: testInstitutionId,
      }),
    );
  });

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

  createInstitutionGraphTests({
    fetchFunction: getInstitutionDurationGraphPerformanceData,
    metric: "duration",
  });

  createInstitutionGraphTests({
    fetchFunction: getInstitutionSuccessGraphPerformanceData,
    metric: "success",
  });
});
