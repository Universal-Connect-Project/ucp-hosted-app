import { Request, Response } from "express";
import { queryApi } from "../services/influxDb";
import {
  createTestScenarioEvents,
  expectedTransformedInstitutionData,
} from "../shared/tests/testData/influx";
import {
  getAggregatorDurationGraphData,
  getAggregatorSuccessGraphData,
  getPerformanceRoutingJson,
} from "./metricsController";
import { seedInfluxTestDb, wait } from "../shared/tests/utils";
import { ComboJobTypes } from "@repo/shared-utils";

describe("getPerformanceRoutingJson", () => {
  it("queries influxdb and transforms the data properly", async () => {
    const req = {
      params: {},
    } as unknown as Request;

    const res = {
      send: jest.fn(),
    } as unknown as Response;

    const testInstitutionId = `bank1-${crypto.randomUUID()}`;
    const testInstitutionId2 = `bank2-${crypto.randomUUID()}`;

    await createTestScenarioEvents(testInstitutionId, testInstitutionId2);
    await wait(2000);

    await getPerformanceRoutingJson(req, res);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const results = (res.send as jest.Mock).mock.calls[0][0];
    expect(results).toEqual(
      expect.objectContaining(
        expectedTransformedInstitutionData(
          testInstitutionId,
          testInstitutionId2,
        ),
      ),
    );
  });

  it("returns 400 and an error on failure", async () => {
    const req = {
      params: {},
    } as unknown as Request;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    const errorMessage = "Test error";
    jest.spyOn(queryApi, "collectRows").mockImplementationOnce(() => {
      throw new Error(errorMessage);
    });

    await getPerformanceRoutingJson(req, res);

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: new Error(errorMessage) });
  });
});

describe("getAggregatorSuccessGraphData", () => {
  const testAggregatorId = "testAggId";
  const dataPointFrom28DaysAgoAggregator = "olderPointAggId";
  const differentJobTypeAggregator = "diffJobAggId";

  beforeAll(async () => {
    await seedInfluxTestDb({
      aggregatorId: testAggregatorId,
    });
    await seedInfluxTestDb({
      aggregatorId: dataPointFrom28DaysAgoAggregator,
      timestamp: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000),
    });
    await seedInfluxTestDb({
      aggregatorId: differentJobTypeAggregator,
      jobTypes: [ComboJobTypes.ACCOUNT_NUMBER],
    });
  });

  it("takes query params and gets success data", async () => {
    const req = {
      query: {
        timeFrame: "1d",
        aggregators: testAggregatorId,
        jobTypes: ComboJobTypes.TRANSACTIONS,
      },
    } as unknown as Request;

    const res = {
      send: jest.fn(),
    } as unknown as Response;

    await getAggregatorSuccessGraphData(req, res);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const results = (res.send as jest.Mock).mock.calls[0][0];
    expect(results).toEqual(
      expect.objectContaining({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        [testAggregatorId]: expect.arrayContaining([
          expect.objectContaining({
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            date: expect.any(String),
            value: 1,
          }),
        ]),
      }),
    );

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(results[dataPointFrom28DaysAgoAggregator]).toBeUndefined();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(results[differentJobTypeAggregator]).toBeUndefined();
  });

  it("uses default query params when none passed (30 days, all job types, all aggregators)", async () => {
    const req = {
      query: {},
    } as unknown as Request;

    const res = {
      send: jest.fn(),
    } as unknown as Response;

    await getAggregatorSuccessGraphData(req, res);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const results = (res.send as jest.Mock).mock.calls[0][0];
    expect(results).toEqual(
      expect.objectContaining({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        [testAggregatorId]: expect.arrayContaining([
          expect.objectContaining({
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            date: expect.any(String),
            value: 1,
          }),
        ]),
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        [dataPointFrom28DaysAgoAggregator]: expect.arrayContaining([
          expect.objectContaining({
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            date: expect.any(String),
            value: 1,
          }),
        ]),
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        [differentJobTypeAggregator]: expect.arrayContaining([
          expect.objectContaining({
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            date: expect.any(String),
            value: 1,
          }),
        ]),
      }),
    );
  });
});

describe("getAggregatorDurationGraphData", () => {
  const testAggregatorId = "testAggId";
  const dataPointFrom28DaysAgoAggregator = "olderPointAggId";
  const differentJobTypeAggregator = "diffJobAggId";

  beforeAll(async () => {
    await seedInfluxTestDb({
      aggregatorId: testAggregatorId,
    });
    await seedInfluxTestDb({
      aggregatorId: dataPointFrom28DaysAgoAggregator,
      timestamp: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000),
    });
    await seedInfluxTestDb({
      aggregatorId: differentJobTypeAggregator,
      jobTypes: [ComboJobTypes.ACCOUNT_NUMBER],
    });
  });

  it("takes query params and gets duration data", async () => {
    const req = {
      query: {
        timeFrame: "1d",
        aggregators: testAggregatorId,
        jobTypes: ComboJobTypes.TRANSACTIONS,
      },
    } as unknown as Request;

    const res = {
      send: jest.fn(),
    } as unknown as Response;

    await getAggregatorDurationGraphData(req, res);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const results = (res.send as jest.Mock).mock.calls[0][0];
    expect(results).toEqual(
      expect.objectContaining({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        [testAggregatorId]: expect.arrayContaining([
          expect.objectContaining({
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            date: expect.any(String),
            value: 10000000,
          }),
        ]),
      }),
    );

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(results[dataPointFrom28DaysAgoAggregator]).toBeUndefined();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(results[differentJobTypeAggregator]).toBeUndefined();
  });

  it("uses default query params when none passed (30 days, all job types, all aggregators)", async () => {
    const req = {
      query: {},
    } as unknown as Request;

    const res = {
      send: jest.fn(),
    } as unknown as Response;

    await getAggregatorDurationGraphData(req, res);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const results = (res.send as jest.Mock).mock.calls[0][0];
    expect(results).toEqual(
      expect.objectContaining({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        [testAggregatorId]: expect.arrayContaining([
          expect.objectContaining({
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            date: expect.any(String),
            value: 10000000,
          }),
        ]),
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        [dataPointFrom28DaysAgoAggregator]: expect.arrayContaining([
          expect.objectContaining({
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            date: expect.any(String),
            value: 10000000,
          }),
        ]),
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        [differentJobTypeAggregator]: expect.arrayContaining([
          expect.objectContaining({
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            date: expect.any(String),
            value: 10000000,
          }),
        ]),
      }),
    );
  });
});
