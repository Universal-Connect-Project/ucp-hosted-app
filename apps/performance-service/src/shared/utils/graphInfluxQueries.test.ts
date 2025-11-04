import { ComboJobTypes } from "@repo/shared-utils";
import {
  seedInfluxTestDb,
  seedInfluxWithAllTimeFrameData,
  shuffleArray,
  testInstitutionId,
  wait,
} from "../tests/utils";
import { getGraphMetrics } from "./graphInfluxQueries";
import { GraphMetricsResponse } from "@repo/shared-utils";
import { testAggregatorsWithIndexes } from "../tests/testData/aggregators";
import { server } from "../tests/testServer";
import { http, HttpResponse } from "msw";
import { INSTITUTION_SERVICE_AGGREGATORS_URL } from "../tests/handlers";
import intersection from "lodash.intersection";

const getNowWithSomeForgiveness = () => Date.now() + 5000;

const testDataPoints = ({
  data,
  expectedBucketDuration,
  expectedNumberOfBuckets,
  shouldAllowOneHourDiscrepancy,
}: {
  data: GraphMetricsResponse;
  expectedBucketDuration: number;
  expectedNumberOfBuckets: number[];
  shouldAllowOneHourDiscrepancy?: boolean;
}) => {
  const { performance } = data;

  const expectedBucketDurations = shouldAllowOneHourDiscrepancy
    ? [
        expectedBucketDuration,
        expectedBucketDuration - 60 * 60 * 1000,
        expectedBucketDuration + 60 * 60 * 1000,
      ]
    : [expectedBucketDuration];

  const nowWithSomeForgiveness = getNowWithSomeForgiveness();

  expect(expectedNumberOfBuckets).toContain(performance.length);

  performance.slice(1, performance.length - 2).forEach(({ start, stop }) => {
    const bucketDuration = new Date(stop).getTime() - new Date(start).getTime();

    expect(expectedBucketDurations).toContain(bucketDuration);
  });

  const lastPerformance = performance[performance.length - 1];

  const start = new Date(lastPerformance.start).getTime();
  const stop = new Date(lastPerformance.stop).getTime();
  const midpoint = new Date(lastPerformance.midpoint).getTime();

  expect(start).toBeLessThan(nowWithSomeForgiveness);
  expect(stop).toBeLessThan(nowWithSomeForgiveness);
  expect(midpoint).toBeLessThan(stop);
  expect(midpoint).toBeGreaterThan(start);
};

const expectAggregators = ({
  aggregatorsToExpect,
  aggregators,
}: {
  aggregatorsToExpect: string[];
  aggregators: { id: string }[];
}) => {
  expect(aggregators.length).toEqual(aggregatorsToExpect.length);

  expect(
    intersection(
      aggregators.map(({ id }) => id),
      aggregatorsToExpect,
    ),
  ).toHaveLength(aggregatorsToExpect.length);
};

describe("getGraphMetrics", () => {
  beforeEach(async () => {
    await seedInfluxWithAllTimeFrameData();
  });

  describe("institution id options", () => {
    it("gets nothing when institutionId is invalid", async () => {
      const successData = await getGraphMetrics({
        institutionId: "invalidInstitutionId",
        timeFrame: "1d",
        metric: "successRateMetrics",
      });
      const durationData = await getGraphMetrics({
        institutionId: "invalidInstitutionId",
        timeFrame: "1d",
        metric: "durationMetrics",
      });

      expect(successData).toEqual({
        aggregators: testAggregatorsWithIndexes,
        performance: [],
      });
      expect(durationData).toEqual({
        aggregators: testAggregatorsWithIndexes,
        performance: [],
      });
    });

    it("returns data when the institutionId is valid", async () => {
      const successData = await getGraphMetrics({
        institutionId: testInstitutionId,
        timeFrame: "1d",
        metric: "successRateMetrics",
      });
      const durationData = await getGraphMetrics({
        institutionId: testInstitutionId,
        timeFrame: "1d",
        metric: "durationMetrics",
      });

      expect(successData.performance.length).toBeGreaterThan(0);
      expect(durationData.performance.length).toBeGreaterThan(0);
    });
  });

  describe("time frame options", () => {
    it("gets hourly averages when getting 1 day of performance metrics", async () => {
      const successData = await getGraphMetrics({
        timeFrame: "1d",
        metric: "successRateMetrics",
      });

      const durationData = await getGraphMetrics({
        timeFrame: "1d",
        metric: "durationMetrics",
      });

      testDataPoints({
        data: successData,
        expectedBucketDuration: 60 * 60 * 1000,
        expectedNumberOfBuckets: [25],
      });
      testDataPoints({
        data: durationData,
        expectedBucketDuration: 60 * 60 * 1000,
        expectedNumberOfBuckets: [25],
      });
    });

    it("gets half day averages when getting 1 week of performance metrics", async () => {
      const successData = await getGraphMetrics({
        timeFrame: "1w",
        metric: "successRateMetrics",
      });

      const durationData = await getGraphMetrics({
        timeFrame: "1w",
        metric: "durationMetrics",
      });

      testDataPoints({
        data: successData,
        expectedBucketDuration: 12 * 60 * 60 * 1000,
        expectedNumberOfBuckets: [15],
        shouldAllowOneHourDiscrepancy: true,
      });
      testDataPoints({
        data: durationData,
        expectedBucketDuration: 12 * 60 * 60 * 1000,
        expectedNumberOfBuckets: [15],
        shouldAllowOneHourDiscrepancy: true,
      });
    });

    it("gets daily averages over 30 days of performance metrics", async () => {
      const successData = await getGraphMetrics({
        timeFrame: "30d",
        metric: "successRateMetrics",
      });

      const durationData = await getGraphMetrics({
        timeFrame: "30d",
        metric: "durationMetrics",
      });

      testDataPoints({
        data: successData,
        expectedBucketDuration: 24 * 60 * 60 * 1000,
        expectedNumberOfBuckets: [31],
        shouldAllowOneHourDiscrepancy: true,
      });

      testDataPoints({
        data: durationData,
        expectedBucketDuration: 24 * 60 * 60 * 1000,
        expectedNumberOfBuckets: [31],
        shouldAllowOneHourDiscrepancy: true,
      });
    });

    it("gets 12 day averages over 180 days of performance metrics", async () => {
      const successData = await getGraphMetrics({
        timeFrame: "180d",
        metric: "successRateMetrics",
      });

      const durationData = await getGraphMetrics({
        timeFrame: "180d",
        metric: "durationMetrics",
      });

      testDataPoints({
        data: successData,
        expectedBucketDuration: 12 * 24 * 60 * 60 * 1000,
        expectedNumberOfBuckets: [16],
        shouldAllowOneHourDiscrepancy: true,
      });
      testDataPoints({
        data: durationData,
        expectedBucketDuration: 12 * 24 * 60 * 60 * 1000,
        expectedNumberOfBuckets: [16],
        shouldAllowOneHourDiscrepancy: true,
      });
    });

    it("gets 30 day averages over 1 year of performance metrics", async () => {
      const successData = await getGraphMetrics({
        timeFrame: "1y",
        metric: "successRateMetrics",
      });

      const durationData = await getGraphMetrics({
        timeFrame: "1y",
        metric: "durationMetrics",
      });

      testDataPoints({
        data: successData,
        expectedBucketDuration: 30 * 24 * 60 * 60 * 1000,
        expectedNumberOfBuckets: [13, 14],
        shouldAllowOneHourDiscrepancy: true,
      });
      testDataPoints({
        data: durationData,
        expectedBucketDuration: 30 * 24 * 60 * 60 * 1000,
        expectedNumberOfBuckets: [13, 14],
        shouldAllowOneHourDiscrepancy: true,
      });
    });
  });

  describe("jobType options", () => {
    it("gets nothing when jobType is invalid", async () => {
      const successData = await getGraphMetrics({
        jobTypes: "invalidJobType",
        timeFrame: "1d",
        metric: "successRateMetrics",
      });
      const durationData = await getGraphMetrics({
        jobTypes: "invalidJobType",
        timeFrame: "1d",
        metric: "durationMetrics",
      });

      expect(successData).toEqual({
        aggregators: testAggregatorsWithIndexes,
        performance: [],
      });
      expect(durationData).toEqual({
        aggregators: testAggregatorsWithIndexes,
        performance: [],
      });
    });

    const shuffledJobTypeCombinations = Object.values(ComboJobTypes)
      .reduce<string[][]>(
        (subsets, jobType) =>
          subsets.concat(subsets.map((set) => [...set, jobType])),
        [[]],
      )
      .filter((set) => set.length > 0)
      .map(shuffleArray)
      .map((items) => items.join("|"));

    shuffledJobTypeCombinations.forEach((jobTypes) => {
      it(`gets data from valid jobTypes: ${jobTypes}`, async () => {
        const successData = await getGraphMetrics({
          jobTypes,
          timeFrame: "1d",
          metric: "successRateMetrics",
        });
        const durationData = await getGraphMetrics({
          jobTypes,
          timeFrame: "1d",
          metric: "durationMetrics",
        });

        expect(successData.performance.length).toBeGreaterThan(0);
        expect(durationData.performance.length).toBeGreaterThan(0);
      });
    });

    it("gets data when no job types in params", async () => {
      const successData = await getGraphMetrics({
        timeFrame: "1d",
        metric: "successRateMetrics",
      });
      const durationData = await getGraphMetrics({
        timeFrame: "1d",
        metric: "durationMetrics",
      });

      expect(successData.performance.length).toBeGreaterThan(0);
      expect(durationData.performance.length).toBeGreaterThan(0);
    });

    it("gets expected values from specific job types", async () => {
      const uniqueAggregatorId = `agg-${crypto.randomUUID()}`;

      await seedInfluxTestDb({
        duration: 1000,
        jobTypes: [ComboJobTypes.ACCOUNT_NUMBER],
        aggregatorId: uniqueAggregatorId,
        success: true,
      });
      await seedInfluxTestDb({
        duration: 1000,
        jobTypes: [ComboJobTypes.ACCOUNT_NUMBER, ComboJobTypes.TRANSACTIONS],
        aggregatorId: uniqueAggregatorId,
        success: false,
      });
      await seedInfluxTestDb({
        duration: 1000,
        jobTypes: [ComboJobTypes.TRANSACTIONS],
        aggregatorId: uniqueAggregatorId,
        success: false,
      });
      await seedInfluxTestDb({
        duration: 1000,
        jobTypes: [ComboJobTypes.TRANSACTIONS],
        aggregatorId: uniqueAggregatorId,
        success: true,
      });

      await wait(1500); // DB writing needs time to finish before reading

      const expectValue = ({
        data,
        value,
      }: {
        data: GraphMetricsResponse;
        value: number;
      }) => {
        expect(data.performance).toContainEqual(
          expect.objectContaining({
            [uniqueAggregatorId]: value,
          }),
        );
      };

      server.use(
        http.get(INSTITUTION_SERVICE_AGGREGATORS_URL, () =>
          HttpResponse.json({
            aggregators: [
              {
                id: uniqueAggregatorId,
                name: uniqueAggregatorId,
              },
            ],
          }),
        ),
      );

      const accountNumberData = await getGraphMetrics({
        jobTypes: ComboJobTypes.ACCOUNT_NUMBER,
        timeFrame: "1d",
        aggregators: uniqueAggregatorId,
        metric: "successRateMetrics",
      });

      expectValue({ data: accountNumberData, value: 1 });

      const comboJobData = await getGraphMetrics({
        jobTypes: [
          ComboJobTypes.TRANSACTIONS,
          ComboJobTypes.ACCOUNT_NUMBER,
        ].join("|"),
        aggregators: uniqueAggregatorId,
        timeFrame: "1d",
        metric: "successRateMetrics",
      });

      expectValue({ data: comboJobData, value: 0 });

      const transactionsData = await getGraphMetrics({
        jobTypes: ComboJobTypes.TRANSACTIONS,
        aggregators: uniqueAggregatorId,
        timeFrame: "1d",
        metric: "successRateMetrics",
      });

      expectValue({ data: transactionsData, value: 0.5 });
    });
  });

  describe("aggregator options", () => {
    const aggId1 = "testAgg1";
    const aggId2 = "testAgg2";

    beforeEach(async () => {
      await seedInfluxTestDb({
        duration: 1000,
        aggregatorId: aggId1,
      });
      await seedInfluxTestDb({
        duration: 1000,
        aggregatorId: aggId2,
      });

      await wait(1500);

      server.use(
        http.get(INSTITUTION_SERVICE_AGGREGATORS_URL, () =>
          HttpResponse.json({
            aggregators: [
              { id: aggId1, name: aggId1 },
              { id: aggId2, name: aggId2 },
            ],
          }),
        ),
      );
    });

    it("gets nothing with a non-existent aggregator", async () => {
      const successData = await getGraphMetrics({
        aggregators: "noAggregator",
        timeFrame: "1d",
        metric: "successRateMetrics",
      });
      const durationData = await getGraphMetrics({
        aggregators: "noAggregator",
        timeFrame: "1d",
        metric: "durationMetrics",
      });

      expect(successData).toEqual({
        aggregators: [],
        performance: [],
      });
      expect(durationData).toEqual({
        aggregators: [],
        performance: [],
      });
    });

    it("gets single aggregator data", async () => {
      const successData = await getGraphMetrics({
        aggregators: aggId1,
        timeFrame: "1d",
        metric: "successRateMetrics",
      });
      const durationData = await getGraphMetrics({
        aggregators: aggId1,
        timeFrame: "1d",
        metric: "durationMetrics",
      });

      const expectDataOnlyFromFirstAggregator = (
        data: GraphMetricsResponse,
      ) => {
        data.performance.forEach((point) => {
          expect(point).toHaveProperty(aggId1);
          expect(point).not.toHaveProperty(aggId2);
        });
      };

      const aggregatorsToExpect = [aggId1];
      expectAggregators({
        aggregatorsToExpect,
        aggregators: successData.aggregators,
      });
      expectAggregators({
        aggregatorsToExpect,
        aggregators: durationData.aggregators,
      });

      expectDataOnlyFromFirstAggregator(successData);
      expectDataOnlyFromFirstAggregator(durationData);
    });

    const expectDataFromBothAggregators = (data: GraphMetricsResponse) => {
      data.performance.forEach((point) => {
        expect(point).toHaveProperty(aggId1);
        expect(point).toHaveProperty(aggId2);
      });
    };

    it("gets combined aggregator data", async () => {
      const successData = await getGraphMetrics({
        aggregators: `${aggId1},${aggId2}`,
        timeFrame: "1d",
        metric: "successRateMetrics",
      });
      const durationData = await getGraphMetrics({
        aggregators: `${aggId1},${aggId2}`,
        timeFrame: "1d",
        metric: "durationMetrics",
      });

      const aggregatorsToExpect = [aggId1, aggId2];

      expectAggregators({
        aggregatorsToExpect,
        aggregators: successData.aggregators,
      });
      expectAggregators({
        aggregatorsToExpect,
        aggregators: durationData.aggregators,
      });

      expectDataFromBothAggregators(successData);
      expectDataFromBothAggregators(durationData);
    });

    it("gets all aggregator data when none passed in", async () => {
      const successData = await getGraphMetrics({
        timeFrame: "1d",
        metric: "successRateMetrics",
      });
      const durationData = await getGraphMetrics({
        timeFrame: "1d",
        metric: "durationMetrics",
      });

      const aggregatorsToExpect = [aggId1, aggId2];
      expectAggregators({
        aggregatorsToExpect,
        aggregators: successData.aggregators,
      });
      expectAggregators({
        aggregatorsToExpect,
        aggregators: durationData.aggregators,
      });

      expectDataFromBothAggregators(successData);
      expectDataFromBothAggregators(durationData);
    });
  });
});
