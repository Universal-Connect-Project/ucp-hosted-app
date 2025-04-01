/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Request, Response } from "express";

import { ComboJobTypes } from "@repo/shared-utils";
import { seedInfluxTestDb, wait } from "../shared/tests/utils";
import {
  getAggregatorSuccessGraphData,
  getAggregatorDurationGraphData,
} from "./aggregatorGraphHandlers";

const testAggregator = { id: "testAggId", duration: 1234 };
const dataPointFrom28DaysAgoAggregator = {
  id: "olderPointAggId",
  duration: 2222,
};
const differentJobTypeAggregator = { id: "diffJobAggId", duration: 3333 };

describe("getAggregatorSuccessGraphData", () => {
  beforeAll(async () => {
    await seedInfluxTestDb({
      aggregatorId: testAggregator.id,
      duration: testAggregator.duration,
    });
    await seedInfluxTestDb({
      aggregatorId: dataPointFrom28DaysAgoAggregator.id,
      duration: dataPointFrom28DaysAgoAggregator.duration,
      timestamp: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000),
    });
    await seedInfluxTestDb({
      aggregatorId: differentJobTypeAggregator.id,
      duration: differentJobTypeAggregator.duration,
      jobTypes: [ComboJobTypes.ACCOUNT_NUMBER],
    });

    await wait(1500);
  });

  it("takes query params and gets success data", async () => {
    const req = {
      query: {
        timeFrame: "1d",
        aggregators: testAggregator.id,
        jobTypes: ComboJobTypes.TRANSACTIONS,
      },
    } as unknown as Request;

    const res = {
      send: jest.fn(),
    } as unknown as Response;

    await getAggregatorSuccessGraphData(req, res);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const results = (res.send as jest.Mock).mock.calls[0][0];
    expect(results).toEqual(
      expect.objectContaining({
        [testAggregator.id]: expect.arrayContaining([
          expect.objectContaining({
            date: expect.any(String),
            value: 1,
          }),
        ]),
      }),
    );

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(results[dataPointFrom28DaysAgoAggregator.id]).toBeUndefined();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(results[differentJobTypeAggregator.id]).toBeUndefined();
  });

  it("uses default query params when none passed (30 days, all job types, all aggregators)", async () => {
    const req = {
      query: {},
    } as unknown as Request;

    const res = {
      send: jest.fn(),
    } as unknown as Response;

    await getAggregatorSuccessGraphData(req, res);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const results = (res.send as jest.Mock).mock.calls[0][0];
    expect(results).toEqual(
      expect.objectContaining({
        [testAggregator.id]: expect.arrayContaining([
          expect.objectContaining({
            date: expect.any(String),
            value: 1,
          }),
        ]),
        [dataPointFrom28DaysAgoAggregator.id]: expect.arrayContaining([
          expect.objectContaining({
            date: expect.any(String),
            value: 1,
          }),
        ]),
        [differentJobTypeAggregator.id]: expect.arrayContaining([
          expect.objectContaining({
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

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const results = (res.send as jest.Mock).mock.calls[0][0];
    expect(results).toEqual(
      expect.objectContaining({
        [testAggregator.id]: expect.arrayContaining([
          expect.objectContaining({
            date: expect.any(String),
            value: 1,
          }),
        ]),
        [dataPointFrom28DaysAgoAggregator.id]: expect.arrayContaining([
          expect.objectContaining({
            date: expect.any(String),
            value: 1,
          }),
        ]),
        [differentJobTypeAggregator.id]: expect.arrayContaining([
          expect.objectContaining({
            date: expect.any(String),
            value: 1,
          }),
        ]),
      }),
    );
  });
});

describe("getAggregatorDurationGraphData", () => {
  beforeAll(async () => {
    await seedInfluxTestDb({
      aggregatorId: testAggregator.id,
      duration: testAggregator.duration,
    });
    await seedInfluxTestDb({
      aggregatorId: dataPointFrom28DaysAgoAggregator.id,
      duration: dataPointFrom28DaysAgoAggregator.duration,
      timestamp: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000),
    });
    await seedInfluxTestDb({
      aggregatorId: differentJobTypeAggregator.id,
      duration: differentJobTypeAggregator.duration,
      jobTypes: [ComboJobTypes.ACCOUNT_NUMBER],
    });

    await wait(1500);
  });

  it("takes query params and gets duration data", async () => {
    const req = {
      query: {
        timeFrame: "1d",
        aggregators: testAggregator,
        jobTypes: ComboJobTypes.TRANSACTIONS,
      },
    } as unknown as Request;

    const res = {
      send: jest.fn(),
    } as unknown as Response;

    await getAggregatorDurationGraphData(req, res);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const results = (res.send as jest.Mock).mock.calls[0][0];
    expect(results).toEqual(
      expect.objectContaining({
        [testAggregator.id]: expect.arrayContaining([
          expect.objectContaining({
            date: expect.any(String),
            value: testAggregator.duration,
          }),
        ]),
      }),
    );

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(results[dataPointFrom28DaysAgoAggregator.id]).toBeUndefined();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(results[differentJobTypeAggregator.id]).toBeUndefined();
  });

  it("uses default query params when none passed (30 days, all job types, all aggregators)", async () => {
    const req = {
      query: {},
    } as unknown as Request;

    const res = {
      send: jest.fn(),
    } as unknown as Response;

    await getAggregatorDurationGraphData(req, res);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const results = (res.send as jest.Mock).mock.calls[0][0];
    expect(results).toEqual(
      expect.objectContaining({
        [testAggregator.id]: expect.arrayContaining([
          expect.objectContaining({
            date: expect.any(String),
            value: testAggregator.duration,
          }),
        ]),
        [dataPointFrom28DaysAgoAggregator.id]: expect.arrayContaining([
          expect.objectContaining({
            date: expect.any(String),
            value: dataPointFrom28DaysAgoAggregator.duration,
          }),
        ]),
        [differentJobTypeAggregator.id]: expect.arrayContaining([
          expect.objectContaining({
            date: expect.any(String),
            value: differentJobTypeAggregator.duration,
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

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const results = (res.send as jest.Mock).mock.calls[0][0];
    expect(results).toEqual(
      expect.objectContaining({
        [testAggregator.id]: expect.arrayContaining([
          expect.objectContaining({
            date: expect.any(String),
            value: testAggregator.duration,
          }),
        ]),
        [dataPointFrom28DaysAgoAggregator.id]: expect.arrayContaining([
          expect.objectContaining({
            date: expect.any(String),
            value: dataPointFrom28DaysAgoAggregator.duration,
          }),
        ]),
        [differentJobTypeAggregator.id]: expect.arrayContaining([
          expect.objectContaining({
            date: expect.any(String),
            value: differentJobTypeAggregator.duration,
          }),
        ]),
      }),
    );
  });
});
