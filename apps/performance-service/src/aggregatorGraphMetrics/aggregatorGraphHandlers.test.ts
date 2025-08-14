/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Request, Response } from "express";

import { ComboJobTypes } from "@repo/shared-utils";
import { seedInfluxTestDb, wait } from "../shared/tests/utils";
import {
  getAggregatorSuccessGraphData,
  getAggregatorDurationGraphData,
} from "./aggregatorGraphHandlers";
import { server } from "../shared/tests/testServer";
import { http, HttpResponse } from "msw";
import { INSTITUTION_SERVICE_AGGREGATORS_URL } from "../shared/tests/handlers";

const testAggregator = { duration: 1234, id: "testAggId", name: "testAggId" };
const dataPointFrom28DaysAgoAggregator = {
  duration: 2222,
  id: "olderPointAggId",
  name: "olderPointAggId",
};
const differentJobTypeAggregator = {
  duration: 3333,
  id: "diffJobAggId",
  name: "diffJobAggId",
};

const expectDurationFromAggregator = ({
  aggregatorId,
  duration,
  results,
}: {
  aggregatorId: string;
  duration: number;
  results: {
    performance: [];
  };
}) => {
  expect(results).toEqual(
    expect.objectContaining({
      performance: expect.arrayContaining([
        expect.objectContaining({
          midpoint: expect.any(String),
          start: expect.any(String),
          stop: expect.any(String),
          [aggregatorId]: duration,
        }),
      ]),
    }),
  );
};

const expectResultFromAggregator = ({
  aggregatorId,
  results,
}: {
  aggregatorId: string;
  results: {
    performance: [];
  };
}) => {
  expect(results).toEqual(
    expect.objectContaining({
      performance: expect.arrayContaining([
        expect.objectContaining({
          midpoint: expect.any(String),
          start: expect.any(String),
          stop: expect.any(String),
          [aggregatorId]: 1,
        }),
      ]),
    }),
  );
};

const expectNoResultsFromAggregator = ({
  aggregatorId,
  results,
}: {
  aggregatorId: string;
  results: {
    performance: Record<string, unknown>[];
  };
}) => {
  const [firstPerformance] = results?.performance || [];

  expect(firstPerformance?.[aggregatorId]).toBeUndefined();
};

describe("getAggregatorSuccessGraphData", () => {
  beforeEach(async () => {
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

    server.use(
      http.get(INSTITUTION_SERVICE_AGGREGATORS_URL, () =>
        HttpResponse.json({
          aggregators: [
            testAggregator,
            dataPointFrom28DaysAgoAggregator,
            differentJobTypeAggregator,
          ],
        }),
      ),
    );
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
    expectResultFromAggregator({
      aggregatorId: testAggregator.id,
      results,
    });

    expectNoResultsFromAggregator({
      aggregatorId: dataPointFrom28DaysAgoAggregator.id,
      results,
    });
    expectNoResultsFromAggregator({
      aggregatorId: differentJobTypeAggregator.id,
      results,
    });
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

    expectResultFromAggregator({
      aggregatorId: testAggregator.id,
      results,
    });
    expectResultFromAggregator({
      aggregatorId: dataPointFrom28DaysAgoAggregator.id,
      results,
    });
    expectResultFromAggregator({
      aggregatorId: differentJobTypeAggregator.id,
      results,
    });
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

    expectResultFromAggregator({
      aggregatorId: testAggregator.id,
      results,
    });
    expectResultFromAggregator({
      aggregatorId: dataPointFrom28DaysAgoAggregator.id,
      results,
    });
    expectResultFromAggregator({
      aggregatorId: differentJobTypeAggregator.id,
      results,
    });
  });
});

describe("getAggregatorDurationGraphData", () => {
  beforeEach(async () => {
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

    server.use(
      http.get(INSTITUTION_SERVICE_AGGREGATORS_URL, () =>
        HttpResponse.json({
          aggregators: [
            testAggregator,
            dataPointFrom28DaysAgoAggregator,
            differentJobTypeAggregator,
          ],
        }),
      ),
    );
  });

  it("takes query params and gets duration data", async () => {
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

    await getAggregatorDurationGraphData(req, res);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const results = (res.send as jest.Mock).mock.calls[0][0];

    expectDurationFromAggregator({
      aggregatorId: testAggregator.id,
      duration: testAggregator.duration,
      results,
    });

    expectNoResultsFromAggregator({
      aggregatorId: dataPointFrom28DaysAgoAggregator.id,
      results,
    });
    expectNoResultsFromAggregator({
      aggregatorId: differentJobTypeAggregator.id,
      results,
    });
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

    expectDurationFromAggregator({
      aggregatorId: testAggregator.id,
      duration: testAggregator.duration,
      results,
    });
    expectDurationFromAggregator({
      aggregatorId: dataPointFrom28DaysAgoAggregator.id,
      duration: dataPointFrom28DaysAgoAggregator.duration,
      results,
    });
    expectDurationFromAggregator({
      aggregatorId: differentJobTypeAggregator.id,
      duration: differentJobTypeAggregator.duration,
      results,
    });
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
    expectDurationFromAggregator({
      aggregatorId: testAggregator.id,
      duration: testAggregator.duration,
      results,
    });
    expectDurationFromAggregator({
      aggregatorId: dataPointFrom28DaysAgoAggregator.id,
      duration: dataPointFrom28DaysAgoAggregator.duration,
      results,
    });
    expectDurationFromAggregator({
      aggregatorId: differentJobTypeAggregator.id,
      duration: differentJobTypeAggregator.duration,
      results,
    });
  });
});
