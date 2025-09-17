/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Request, Response } from "express";

import {
  allJobTypeCombinations,
  seedInfluxTestDb,
  seedInfluxWithAllTimeFrameData,
  TEST_DURATION_ONE_MONTH,
  TEST_DURATION_ONE_WEEK,
  wait,
} from "../shared/tests/utils";
import { getAggregatorMetrics } from "./aggregatorMetricsHandlers";
import { randomUUID } from "crypto";
import { TimeFrame } from "../shared/consts/timeFrame";
import { server } from "../shared/tests/testServer";
import { http, HttpResponse } from "msw";
import { INSTITUTION_SERVICE_AGGREGATORS_URL } from "../shared/tests/handlers";
import { testAggregators } from "../shared/tests/testData/aggregators";
import { ComboJobTypes } from "@repo/shared-utils";

type Aggregator = {
  name: string;
  avgSuccessRate: number;
  avgDuration: number;
  jobTypes: Record<string, { avgSuccessRate: number; avgDuration: number }>;
};

type Results = { aggregators: Aggregator[] };

const findAggregatorResultByName = (results: Results, name: string) => {
  return results.aggregators.find(
    (aggregator) => aggregator.name === name,
  ) as Aggregator;
};

const findSophtronResult = (results: Results) => {
  return findAggregatorResultByName(results, "sophtron");
};

const findMxResult = (results: Results) => {
  return findAggregatorResultByName(results, "mx");
};

describe("getAggregatorMetrics", () => {
  describe("not seeded with data", () => {
    it("returns overall aggregator averages as well as specific aggregator averages by job type", async () => {
      await seedInfluxTestDb({
        timestamp: new Date(),
        aggregatorId: "mx",
        jobTypes: [ComboJobTypes.ACCOUNT_NUMBER],
        duration: 1000,
        success: false,
      });
      await seedInfluxTestDb({
        timestamp: new Date(),
        aggregatorId: "mx",
        jobTypes: [ComboJobTypes.ACCOUNT_OWNER],
        duration: 2000,
        success: true,
      });
      await seedInfluxTestDb({
        timestamp: new Date(),
        aggregatorId: "sophtron",
        jobTypes: [ComboJobTypes.ACCOUNT_OWNER],
        duration: 3000,
        success: true,
      });

      await wait(1000); // DB writing needs time to finish before reading

      const req = {
        query: {
          timeFrame: "1d",
        },
      } as unknown as Request;

      const res = {
        send: jest.fn(),
      } as unknown as Response;

      await getAggregatorMetrics(req, res);

      const results = (res.send as jest.Mock).mock.calls[0][0] as Results;
      const mxResult = findMxResult(results);

      expect(mxResult.avgSuccessRate).toBe(50);
      expect(mxResult.avgDuration).toEqual(1.5);
      expect(mxResult.jobTypes[ComboJobTypes.ACCOUNT_NUMBER]).toEqual({
        avgDuration: 1,
        avgSuccessRate: 0,
      });
      expect(mxResult.jobTypes[ComboJobTypes.ACCOUNT_OWNER]).toEqual({
        avgDuration: 2,
        avgSuccessRate: 100,
      });

      const sophtronResult = findSophtronResult(results);
      expect(sophtronResult.avgSuccessRate).toBe(100);
      expect(sophtronResult.avgDuration).toEqual(3);
      expect(sophtronResult.jobTypes[ComboJobTypes.ACCOUNT_OWNER]).toEqual({
        avgDuration: 3,
        avgSuccessRate: 100,
      });
    });
  });

  describe("seeded with all time frame data", () => {
    beforeEach(async () => {
      await seedInfluxWithAllTimeFrameData();
    });

    const expectedAggregatorMetricsResultsFormat = (results: Results) => {
      const mxResult = findMxResult(results);

      expect(mxResult).toEqual(
        expect.objectContaining({
          avgSuccessRate: expect.any(Number),
          avgDuration: expect.any(Number),
          jobTypes: expect.objectContaining(
            allJobTypeCombinations.reduce((acc, jobType) => {
              return {
                ...acc,
                [jobType]: expect.objectContaining({
                  avgSuccessRate: expect.any(Number),
                  avgDuration: expect.any(Number),
                }),
              };
            }, {}),
          ),
          logo: expect.any(String),
          name: expect.any(String),
        }),
      );
    };

    it('gets expected results format and uses default 30 days time frame when blank ("") is passed', async () => {
      const req = {
        query: {
          timeFrame: "",
        },
      } as unknown as Request;

      const res = {
        send: jest.fn(),
      } as unknown as Response;

      await getAggregatorMetrics(req, res);

      const result = (res.send as jest.Mock).mock.calls[0][0] as Results;
      const mxResult = findMxResult(result);
      const mxJobDuration = mxResult.avgDuration;

      expect(mxJobDuration).toBeGreaterThan(TEST_DURATION_ONE_WEEK / 1000);
      expect(mxJobDuration).toBeLessThanOrEqual(TEST_DURATION_ONE_MONTH / 1000);

      expectedAggregatorMetricsResultsFormat(result);
    });

    it("gets an aggregator in the results even when it has no duration data", async () => {
      const req = {
        query: {
          timeFrame: "",
        },
      } as unknown as Request;

      const res = {
        send: jest.fn(),
      } as unknown as Response;

      const aggregatorWithNoDuration = randomUUID();
      await seedInfluxTestDb({
        timestamp: new Date(),
        aggregatorId: aggregatorWithNoDuration,
        jobTypes: ["transactionHistory"],
        success: false,
        duration: undefined,
      });

      await wait(1000); // DB writing needs time to finish before reading

      server.use(
        http.get(INSTITUTION_SERVICE_AGGREGATORS_URL, () =>
          HttpResponse.json({
            aggregators: [
              ...testAggregators,
              { name: aggregatorWithNoDuration },
            ],
          }),
        ),
      );

      await getAggregatorMetrics(req, res);

      const results = (res.send as jest.Mock).mock.calls[0][0] as Results;

      const aggregatorWithNoDurationResults = results.aggregators.find(
        (aggregator) => aggregator.name === aggregatorWithNoDuration,
      ) as Aggregator;

      expect(
        aggregatorWithNoDurationResults.jobTypes["transactionHistory"],
      ).toEqual(
        expect.objectContaining({
          avgSuccessRate: 0,
          avgDuration: undefined,
        }),
      );

      expectedAggregatorMetricsResultsFormat(results);
    });

    it("gets expected results format and uses default 30 days time frame when nothing is passed", async () => {
      const req = {
        query: {},
      } as unknown as Request;

      const res = {
        send: jest.fn(),
      } as unknown as Response;

      await getAggregatorMetrics(req, res);

      const results = (res.send as jest.Mock).mock.calls[0][0] as Results;
      const mxJobDuration = findMxResult(results).avgDuration;

      expect(mxJobDuration).toBeGreaterThan(TEST_DURATION_ONE_WEEK / 1000);
      expect(mxJobDuration).toBeLessThanOrEqual(TEST_DURATION_ONE_MONTH / 1000);

      expectedAggregatorMetricsResultsFormat(results);
    });

    it("gets bigger averages for each time frame as designed by the seeded data", async () => {
      const createRequest = (timeFrame: TimeFrame) => {
        return {
          query: {
            timeFrame,
          },
        } as unknown as Request;
      };

      const res = {
        send: jest.fn(),
      } as unknown as Response;

      await getAggregatorMetrics(createRequest("1d"), res);
      await getAggregatorMetrics(createRequest("1w"), res);
      await getAggregatorMetrics(createRequest("30d"), res);
      await getAggregatorMetrics(createRequest("180d"), res);
      await getAggregatorMetrics(createRequest("1y"), res);

      const oneDayResults = (res.send as jest.Mock).mock.calls[0][0] as Results;
      const oneWeekResults = (res.send as jest.Mock).mock
        .calls[1][0] as Results;
      const oneMonthResults = (res.send as jest.Mock).mock
        .calls[2][0] as Results;
      const halfYearResults = (res.send as jest.Mock).mock
        .calls[3][0] as Results;
      const oneYearResults = (res.send as jest.Mock).mock
        .calls[4][0] as Results;

      const oneDayMxResult = findMxResult(oneDayResults);
      const oneWeekMxResult = findMxResult(oneWeekResults);
      const oneMonthMxResult = findMxResult(oneMonthResults);
      const halfYearMxResult = findMxResult(halfYearResults);
      const oneYearMxResult = findMxResult(oneYearResults);

      expect(
        oneDayMxResult.avgDuration < oneWeekMxResult.avgDuration &&
          oneWeekMxResult.avgDuration < oneMonthMxResult.avgDuration &&
          oneMonthMxResult.avgDuration < halfYearMxResult.avgDuration &&
          halfYearMxResult.avgDuration < oneYearMxResult.avgDuration,
      ).toBeTruthy();

      expectedAggregatorMetricsResultsFormat(oneDayResults);
      expectedAggregatorMetricsResultsFormat(oneWeekResults);
      expectedAggregatorMetricsResultsFormat(oneMonthResults);
      expectedAggregatorMetricsResultsFormat(halfYearResults);
      expectedAggregatorMetricsResultsFormat(oneYearResults);
    }, 10000);
  });
});
