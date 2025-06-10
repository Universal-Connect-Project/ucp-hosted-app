import {
  ComboJobTypes,
  JOB_TYPES_ERROR_TEXT,
  TIME_FRAME_ERROR_TEXT,
} from "@repo/shared-utils";

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

interface FetchFunctionParams {
  timeFrame?: string;
  jobTypes?: string;
  aggregators?: string;
}

interface FetchFunctionResponse {
  status: number;
  body: any;
}

type FetchFunction = (
  params: FetchFunctionParams,
) => Cypress.Chainable<FetchFunctionResponse>;

export const createAggregatorGraphValidationTests = (
  fetchFunction: FetchFunction,
) =>
  describe("aggregator graph validation tests", () => {
    it("fails when timeFrame param is wrong", () => {
      fetchFunction({
        timeFrame: "3d",
        jobTypes: ComboJobTypes.TRANSACTIONS,
        aggregators: "mx,sophtron",
      }).then((response: FetchFunctionResponse) => {
        expect(response.status).to.eq(400);
        expect(response.body).to.deep.eq({
          error: TIME_FRAME_ERROR_TEXT,
        });
      });
    });

    it("fails when jobType param is wrong", () => {
      fetchFunction({
        timeFrame: "30d",
        jobTypes: "invalidJobType",
        aggregators: "mx,sophtron",
      }).then((response: FetchFunctionResponse) => {
        expect(response.status).to.eq(400);
        expect(response.body).to.deep.eq({
          error: JOB_TYPES_ERROR_TEXT,
        });
      });
    });

    it("allows any aggregator but returns an empty array when aggregator is invalid", () => {
      fetchFunction({
        aggregators: "nonexistant",
      }).then((response: FetchFunctionResponse) => {
        expect(response.status).to.eq(200);
        expect(response.body.performance).to.deep.eq([]);
      });
    });

    it("allows combined JobTypes in any order", () => {
      fetchFunction({
        timeFrame: "30d",
        jobTypes: `${ComboJobTypes.TRANSACTIONS}|${ComboJobTypes.ACCOUNT_NUMBER},${ComboJobTypes.TRANSACTIONS}`,
        aggregators: "mx,sophtron,testAggregatorId",
      }).then((response: FetchFunctionResponse) => {
        expect(response.status).to.eq(200);
        cy.wrap(response.body)
          .its("performance")
          .each(expectLooksLikePerformanceData);
      });
    });

    it("works without any filter params", () => {
      fetchFunction({}).then((response) => {
        expect(response.status).to.eq(200);
        cy.wrap(response.body)
          .its("performance")
          .each(expectLooksLikePerformanceData);
      });
    });
  });
