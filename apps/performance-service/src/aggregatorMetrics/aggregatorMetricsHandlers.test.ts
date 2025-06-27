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

describe("getAggregatorMetrics", () => {
  beforeAll(async () => {
    await seedInfluxWithAllTimeFrameData();
  });

  const expectedAggregatorMetricsResultsFormat = (results: unknown) => {
    expect(results).toEqual(
      expect.objectContaining({
        mx: expect.objectContaining({
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
        }),
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

    const results = (res.send as jest.Mock).mock.calls[0][0];
    const mxJobDuration = results.mx.avgDuration;

    expect(mxJobDuration).toBeGreaterThan(TEST_DURATION_ONE_WEEK / 1000);
    expect(mxJobDuration).toBeLessThanOrEqual(TEST_DURATION_ONE_MONTH / 1000);

    expectedAggregatorMetricsResultsFormat(results);
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

    await getAggregatorMetrics(req, res);

    const results = (res.send as jest.Mock).mock.calls[0][0];
    expect(
      results[aggregatorWithNoDuration].jobTypes["transactionHistory"],
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

    const results = (res.send as jest.Mock).mock.calls[0][0];
    const mxJobDuration = results.mx.avgDuration;

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

    const oneDayResults = (res.send as jest.Mock).mock.calls[0][0];
    const oneWeekResults = (res.send as jest.Mock).mock.calls[1][0];
    const oneMonthResults = (res.send as jest.Mock).mock.calls[2][0];
    const halfYearResults = (res.send as jest.Mock).mock.calls[3][0];
    const oneYearResults = (res.send as jest.Mock).mock.calls[4][0];

    expect(
      oneDayResults.mx.avgDuration <
        oneWeekResults.mx.avgDuration <
        oneMonthResults.mx.avgDuration <
        halfYearResults.mx.avgDuration <
        oneYearResults.mx.avgDuration,
    ).toBeTruthy();

    expectedAggregatorMetricsResultsFormat(oneDayResults);
    expectedAggregatorMetricsResultsFormat(oneWeekResults);
    expectedAggregatorMetricsResultsFormat(oneMonthResults);
    expectedAggregatorMetricsResultsFormat(halfYearResults);
    expectedAggregatorMetricsResultsFormat(oneYearResults);
  });
});
