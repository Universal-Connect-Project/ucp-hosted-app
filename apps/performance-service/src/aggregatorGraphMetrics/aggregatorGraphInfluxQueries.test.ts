/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { ComboJobTypes } from "@repo/shared-utils";
import {
  seedInfluxTestDb,
  seedInfluxWithAllTimeFrameData,
  shuffleArray,
  wait,
} from "../shared/tests/utils";
import { getAggregatorGraphMetrics } from "./aggregatorGraphInfluxQueries";

describe("getAggregatorGraphMetrics", () => {
  const nowWithSomeForgiveness = Date.now() + 10000;

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

      const expectHourlyDataPoints = (
        data: Record<
          string,
          {
            date: Date;
            value: number;
          }[]
        >,
      ) => {
        const dates = data.mx.map((entry) => new Date(entry.date).getHours());
        expect(new Set(dates).size).toBeGreaterThanOrEqual(23);

        data.mx.forEach((entry) => {
          const twentyFourHoursAgo = Date.now() - 24 * 60 * 60 * 1000;
          const timestamp = new Date(entry.date).getTime();
          expect(timestamp).toBeGreaterThanOrEqual(twentyFourHoursAgo);
          expect(timestamp).toBeLessThanOrEqual(nowWithSomeForgiveness);
        });
      };

      expectHourlyDataPoints(successData);
      expectHourlyDataPoints(durationData);
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

      const expectBiDailyDataPoints = (
        data: Record<
          string,
          {
            date: Date;
            value: number;
          }[]
        >,
      ) => {
        const now = Date.now();
        const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;

        const timestamps = data.mx.map((entry) =>
          new Date(entry.date).getTime(),
        );

        timestamps.forEach((timestamp) => {
          expect(timestamp).toBeGreaterThanOrEqual(oneWeekAgo);
          expect(timestamp).toBeLessThanOrEqual(nowWithSomeForgiveness);
        });

        const biDailyPeriods = new Set(
          data.mx.map((entry) => {
            const dateObj = new Date(entry.date);
            const day = dateObj.toISOString().split("T")[0];
            const period = Math.floor(dateObj.getHours() / 12);
            return `${day}-${period}`;
          }),
        );

        expect(biDailyPeriods.size).toBeGreaterThanOrEqual(13);
      };

      expectBiDailyDataPoints(successData);
      expectBiDailyDataPoints(durationData);
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

      const expectDailyDataPoints = (
        data: Record<
          string,
          {
            date: Date;
            value: number;
          }[]
        >,
      ) => {
        const now = Date.now();
        const oneMonthAgo = now - 30 * 24 * 60 * 60 * 1000;

        const dailyDays = new Set(
          data.mx.map((entry) => {
            const dateObj = new Date(entry.date);
            return dateObj.toISOString().split("T")[0];
          }),
        );

        expect(dailyDays.size).toBeGreaterThanOrEqual(29);

        data.mx.forEach((entry) => {
          const timestamp = new Date(entry.date).getTime();
          expect(timestamp).toBeGreaterThanOrEqual(oneMonthAgo);
          expect(timestamp).toBeLessThanOrEqual(nowWithSomeForgiveness);
        });
      };

      expectDailyDataPoints(successData);
      expectDailyDataPoints(durationData);
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

      const expectTwelveDayDataPoints = (
        data: Record<
          string,
          {
            date: Date;
            value: number;
          }[]
        >,
      ) => {
        const now = Date.now();
        const oneHundredEightyDaysAgo = now - 180 * 24 * 60 * 60 * 1000;

        const twelveDayIntervals = data.mx.map((entry) => {
          const dateObj = new Date(entry.date);
          return dateObj.toISOString().split("T")[0];
        });

        const sortedDates = twelveDayIntervals.sort();

        for (let i = 1; i < sortedDates.length - 1; i++) {
          const previousDate = new Date(sortedDates[i - 1]);
          const currentDate = new Date(sortedDates[i]);
          const dayDifference =
            (currentDate.getTime() - previousDate.getTime()) /
            (24 * 60 * 60 * 1000);
          expect(dayDifference).toBe(12);
        }

        data.mx.forEach((entry) => {
          const timestamp = new Date(entry.date).getTime();
          expect(timestamp).toBeGreaterThanOrEqual(oneHundredEightyDaysAgo);
          expect(timestamp).toBeLessThanOrEqual(nowWithSomeForgiveness);
        });

        expect(sortedDates.length).toBeGreaterThanOrEqual(Math.floor(180 / 12));
      };

      expectTwelveDayDataPoints(successData);
      expectTwelveDayDataPoints(durationData);
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

      const expect30DayDataPoints = (
        data: Record<
          string,
          {
            date: Date;
            value: number;
          }[]
        >,
      ) => {
        const now = Date.now();
        const oneYearAgo = now - 365 * 24 * 60 * 60 * 1000;

        const thirtyDayIntervals = data.mx.map((entry) => {
          const dateObj = new Date(entry.date);
          return dateObj.toISOString().split("T")[0];
        });

        const sortedDates = thirtyDayIntervals.sort();

        for (let i = 1; i < sortedDates.length - 1; i++) {
          const previousDate = new Date(sortedDates[i - 1]);
          const currentDate = new Date(sortedDates[i]);
          const dayDifference =
            (currentDate.getTime() - previousDate.getTime()) /
            (24 * 60 * 60 * 1000);
          expect(dayDifference).toBe(30);
        }

        data.mx.forEach((entry) => {
          const timestamp = new Date(entry.date).getTime();
          expect(timestamp).toBeGreaterThanOrEqual(oneYearAgo);
          expect(timestamp).toBeLessThanOrEqual(nowWithSomeForgiveness);
        });

        expect(sortedDates.length).toBeGreaterThanOrEqual(Math.floor(365 / 30));
      };

      expect30DayDataPoints(successData);
      expect30DayDataPoints(durationData);
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

      expect(successData).toEqual({});
      expect(durationData).toEqual({});
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

        expect(successData.mx.length).toBeGreaterThan(0);
        expect(durationData.mx.length).toBeGreaterThan(0);
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

      expect(successData.mx.length).toBeGreaterThan(0);
      expect(durationData.mx.length).toBeGreaterThan(0);
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

      await wait(1000); // DB writing needs time to finish before reading

      const accountNumberData = await getAggregatorGraphMetrics({
        jobTypes: ComboJobTypes.ACCOUNT_NUMBER,
        timeFrame: "1d",
        aggregators: uniqueAggregatorId,
        metric: "successRateMetrics",
      });

      expect(accountNumberData[uniqueAggregatorId]).toEqual([
        expect.objectContaining({
          date: expect.any(String),
          value: 1,
        }),
      ]);

      const comboJobData = await getAggregatorGraphMetrics({
        jobTypes: [
          ComboJobTypes.TRANSACTIONS,
          ComboJobTypes.ACCOUNT_NUMBER,
        ].join("|"),
        aggregators: uniqueAggregatorId,
        timeFrame: "1d",
        metric: "successRateMetrics",
      });

      expect(comboJobData[uniqueAggregatorId]).toEqual([
        expect.objectContaining({
          date: expect.any(String),
          value: 0,
        }),
      ]);

      const transactionsData = await getAggregatorGraphMetrics({
        jobTypes: ComboJobTypes.TRANSACTIONS,
        aggregators: uniqueAggregatorId,
        timeFrame: "1d",
        metric: "successRateMetrics",
      });

      expect(transactionsData[uniqueAggregatorId]).toEqual([
        expect.objectContaining({
          date: expect.any(String),
          value: 0.5,
        }),
      ]);
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

      expect(successData).toEqual({});
      expect(durationData).toEqual({});
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

      expect(successData[aggId1].length).toBeGreaterThan(0);
      expect(durationData[aggId1].length).toBeGreaterThan(0);
      expect(successData[aggId2]).toBeUndefined();
      expect(durationData[aggId2]).toBeUndefined();
      expect(successData.mx).toBeUndefined();
      expect(durationData.mx).toBeUndefined();
    });

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

      expect(successData[aggId1].length).toBeGreaterThan(0);
      expect(durationData[aggId1].length).toBeGreaterThan(0);
      expect(successData[aggId2].length).toBeGreaterThan(0);
      expect(durationData[aggId2].length).toBeGreaterThan(0);
      expect(successData.mx).toBeUndefined();
      expect(durationData.mx).toBeUndefined();
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

      expect(successData[aggId1].length).toBeGreaterThan(0);
      expect(durationData[aggId1].length).toBeGreaterThan(0);
      expect(successData[aggId2].length).toBeGreaterThan(0);
      expect(durationData[aggId2].length).toBeGreaterThan(0);
      expect(successData.mx.length).toBeGreaterThan(0);
      expect(durationData.mx.length).toBeGreaterThan(0);
    });
  });
});
