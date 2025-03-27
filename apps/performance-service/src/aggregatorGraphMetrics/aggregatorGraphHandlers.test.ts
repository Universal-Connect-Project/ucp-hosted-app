import { Request, Response } from "express";

import { ComboJobTypes } from "@repo/shared-utils";
import { seedInfluxTestDb } from "../shared/tests/utils";
import {
  getAggregatorSuccessGraphData,
  getAggregatorDurationGraphData,
} from "./aggregatorGraphHandlers";

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

  it('uses default query params when blank ("") is passed (30 days, all job types, all aggregators)', async () => {
    const req = {
      query: {
        jobTypes: "",
        aggregators: "",
        timeFrame: "",
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

  it('uses default query params when blank ("") is passed (30 days, all job types, all aggregators)', async () => {
    const req = {
      query: {
        jobTypes: "",
        aggregators: "",
        timeFrame: "",
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
