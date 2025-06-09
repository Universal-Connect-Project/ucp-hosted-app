import { ComboJobTypes } from "@repo/shared-utils";
import {
  seedInfluxTestDb,
  seedInfluxWithAllTimeFrameData,
  shuffleArray,
  wait,
} from "../shared/tests/utils";
import { getAggregatorGraphMetrics } from "./aggregatorGraphInfluxQueries";
import { GraphMetricsResponse } from "@repo/backend-utils";

const getNowWithSomeForgiveness = () => Date.now() + 5000;

const testDataPoints = ({
  data,
  expectedBucketDuration,
  expectedNumberOfBuckets,
  shouldAllowOneHourDiscrepancy,
}: {
  data: GraphMetricsResponse;
  expectedBucketDuration: number;
  expectedNumberOfBuckets: number;
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

  expect(performance.length).toEqual(expectedNumberOfBuckets);

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

describe("getAggregatorGraphMetrics", () => {
  beforeAll(async () => {
    await seedInfluxWithAllTimeFrameData();
  });

  describe("time frame options", () => {
    it("gets hourly averages when getting 1 day of performance metrics", async () => {
      const successData = await getAggregatorGraphMetrics({
        timeFrame: "1d",
        metric: "successRateMetrics",
      });

      const durationData = await getAggregatorGraphMetrics({
        timeFrame: "1d",
        metric: "durationMetrics",
      });

      testDataPoints({
        data: successData,
        expectedBucketDuration: 60 * 60 * 1000,
        expectedNumberOfBuckets: 25,
      });
      testDataPoints({
        data: durationData,
        expectedBucketDuration: 60 * 60 * 1000,
        expectedNumberOfBuckets: 25,
      });
    });

    it("gets half day averages when getting 1 week of performance metrics", async () => {
      const successData = await getAggregatorGraphMetrics({
        timeFrame: "1w",
        metric: "successRateMetrics",
      });

      const durationData = await getAggregatorGraphMetrics({
        timeFrame: "1w",
        metric: "durationMetrics",
      });

      testDataPoints({
        data: successData,
        expectedBucketDuration: 12 * 60 * 60 * 1000,
        expectedNumberOfBuckets: 15,
      });
      testDataPoints({
        data: durationData,
        expectedBucketDuration: 12 * 60 * 60 * 1000,
        expectedNumberOfBuckets: 15,
      });
    });

    it("gets daily averages over 30 days of performance metrics", async () => {
      const successData = await getAggregatorGraphMetrics({
        timeFrame: "30d",
        metric: "successRateMetrics",
      });

      const durationData = await getAggregatorGraphMetrics({
        timeFrame: "30d",
        metric: "durationMetrics",
      });

      testDataPoints({
        data: successData,
        expectedBucketDuration: 24 * 60 * 60 * 1000,
        expectedNumberOfBuckets: 31,
      });

      testDataPoints({
        data: durationData,
        expectedBucketDuration: 24 * 60 * 60 * 1000,
        expectedNumberOfBuckets: 31,
      });
    });

    it("gets 12 day averages over 180 days of performance metrics", async () => {
      const successData = await getAggregatorGraphMetrics({
        timeFrame: "180d",
        metric: "successRateMetrics",
      });

      const durationData = await getAggregatorGraphMetrics({
        timeFrame: "180d",
        metric: "durationMetrics",
      });

      testDataPoints({
        data: successData,
        expectedBucketDuration: 12 * 24 * 60 * 60 * 1000,
        expectedNumberOfBuckets: 16,
        shouldAllowOneHourDiscrepancy: true,
      });
      testDataPoints({
        data: durationData,
        expectedBucketDuration: 12 * 24 * 60 * 60 * 1000,
        expectedNumberOfBuckets: 16,
        shouldAllowOneHourDiscrepancy: true,
      });
    });

    it("gets 30 day averages over 1 year of performance metrics", async () => {
      const successData = await getAggregatorGraphMetrics({
        timeFrame: "1y",
        metric: "successRateMetrics",
      });

      const durationData = await getAggregatorGraphMetrics({
        timeFrame: "1y",
        metric: "durationMetrics",
      });

      testDataPoints({
        data: successData,
        expectedBucketDuration: 30 * 24 * 60 * 60 * 1000,
        expectedNumberOfBuckets: 13,
        shouldAllowOneHourDiscrepancy: true,
      });
      testDataPoints({
        data: durationData,
        expectedBucketDuration: 30 * 24 * 60 * 60 * 1000,
        expectedNumberOfBuckets: 13,
        shouldAllowOneHourDiscrepancy: true,
      });
    });
  });

  describe("jobType options", () => {
    it("gets nothing when jobType is invalid", async () => {
      const successData = await getAggregatorGraphMetrics({
        jobTypes: "invalidJobType",
        timeFrame: "1d",
        metric: "successRateMetrics",
      });
      const durationData = await getAggregatorGraphMetrics({
        jobTypes: "invalidJobType",
        timeFrame: "1d",
        metric: "durationMetrics",
      });

      expect(successData).toEqual({ performance: [] });
      expect(durationData).toEqual({ performance: [] });
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
        const successData = await getAggregatorGraphMetrics({
          jobTypes,
          timeFrame: "1d",
          metric: "successRateMetrics",
        });
        const durationData = await getAggregatorGraphMetrics({
          jobTypes,
          timeFrame: "1d",
          metric: "durationMetrics",
        });

        expect(successData.performance.length).toBeGreaterThan(0);
        expect(durationData.performance.length).toBeGreaterThan(0);
      });
    });

    it("gets data when no job types in params", async () => {
      const successData = await getAggregatorGraphMetrics({
        timeFrame: "1d",
        metric: "successRateMetrics",
      });
      const durationData = await getAggregatorGraphMetrics({
        timeFrame: "1d",
        metric: "durationMetrics",
      });

      expect(successData.performance.length).toBeGreaterThan(0);
      expect(durationData.performance.length).toBeGreaterThan(0);
    });

    it("gets expected values from specific job types", async () => {
      const uniqueAggregatorId = `agg-${crypto.randomUUID()}`;

      await seedInfluxTestDb({
        jobTypes: [ComboJobTypes.ACCOUNT_NUMBER],
        aggregatorId: uniqueAggregatorId,
        success: true,
      });
      await seedInfluxTestDb({
        jobTypes: [ComboJobTypes.ACCOUNT_NUMBER, ComboJobTypes.TRANSACTIONS],
        aggregatorId: uniqueAggregatorId,
        success: false,
      });
      await seedInfluxTestDb({
        jobTypes: [ComboJobTypes.TRANSACTIONS],
        aggregatorId: uniqueAggregatorId,
        success: false,
      });
      await seedInfluxTestDb({
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

      const accountNumberData = await getAggregatorGraphMetrics({
        jobTypes: ComboJobTypes.ACCOUNT_NUMBER,
        timeFrame: "1d",
        aggregators: uniqueAggregatorId,
        metric: "successRateMetrics",
      });

      expectValue({ data: accountNumberData, value: 1 });

      const comboJobData = await getAggregatorGraphMetrics({
        jobTypes: [
          ComboJobTypes.TRANSACTIONS,
          ComboJobTypes.ACCOUNT_NUMBER,
        ].join("|"),
        aggregators: uniqueAggregatorId,
        timeFrame: "1d",
        metric: "successRateMetrics",
      });

      expectValue({ data: comboJobData, value: 0 });

      const transactionsData = await getAggregatorGraphMetrics({
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

    beforeAll(async () => {
      await seedInfluxTestDb({
        aggregatorId: aggId1,
      });
      await seedInfluxTestDb({
        aggregatorId: aggId2,
      });

      await wait(1500);
    });

    it("gets nothing with an non-existant aggregator", async () => {
      const successData = await getAggregatorGraphMetrics({
        aggregators: "noAggregator",
        timeFrame: "1d",
        metric: "successRateMetrics",
      });
      const durationData = await getAggregatorGraphMetrics({
        jobTypes: "noAggregator",
        timeFrame: "1d",
        metric: "durationMetrics",
      });

      expect(successData).toEqual({ performance: [] });
      expect(durationData).toEqual({ performance: [] });
    });

    it("gets single aggregator data", async () => {
      const successData = await getAggregatorGraphMetrics({
        aggregators: aggId1,
        timeFrame: "1d",
        metric: "successRateMetrics",
      });
      const durationData = await getAggregatorGraphMetrics({
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
      const successData = await getAggregatorGraphMetrics({
        aggregators: `${aggId1},${aggId2}`,
        timeFrame: "1d",
        metric: "successRateMetrics",
      });
      const durationData = await getAggregatorGraphMetrics({
        aggregators: `${aggId1},${aggId2}`,
        timeFrame: "1d",
        metric: "durationMetrics",
      });

      expectDataFromBothAggregators(successData);
      expectDataFromBothAggregators(durationData);
    });

    it("gets all aggregator data when none passed in", async () => {
      const successData = await getAggregatorGraphMetrics({
        timeFrame: "1d",
        metric: "successRateMetrics",
      });
      const durationData = await getAggregatorGraphMetrics({
        timeFrame: "1d",
        metric: "durationMetrics",
      });

      expectDataFromBothAggregators(successData);
      expectDataFromBothAggregators(durationData);
    });
  });
});
