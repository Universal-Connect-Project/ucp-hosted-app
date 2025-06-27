import { ComboJobTypes, TIME_FRAME_ERROR_TEXT } from "@repo/shared-utils";

export const expectLooksLikePerformanceData = (
  item,
  expectedAggregator = "mx",
) => {
  expect(item).to.have.property(expectedAggregator);

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

export const createPerformanceGraphValidationTests = (
  fetchFunction: FetchFunction,
  expectedAggregator?: string,
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

    it("works without any filter params", () => {
      fetchFunction({}).then((response) => {
        expect(response.status).to.eq(200);
        cy.wrap(response.body)
          .its("performance")
          .each((value) =>
            expectLooksLikePerformanceData(value, expectedAggregator),
          );
      });
    });
  });
