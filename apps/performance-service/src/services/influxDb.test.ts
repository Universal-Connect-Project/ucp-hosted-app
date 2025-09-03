/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { EventObject } from "../controllers/eventController";
import {
  getLatestDataPoint,
  wait,
  seedInfluxTestDb,
} from "../shared/tests/utils";
import {
  recordPerformanceMetric,
  getPerformanceDataByConnectionId,
} from "./influxDb";
import { writeApi, queryApi } from "./influxDb";
import { setEvent } from "./storageClient/redis";

describe("recordPerformanceMetric", () => {
  const event: EventObject = {
    jobTypes: ["jobB", "jobA"],
    institutionId: "inst_123",
    connectionId: "MBR-123",
    pausedAt: null,
    clientId: "client_456",
    aggregatorId: "agg_789",
    startedAt: 1700000000000,
    successAt: 1700000005000,
    userInteractionTime: 2000,
    recordDuration: true,
    shouldRecordResult: true,
  };

  it("records correct duration and success metrics on successful event", async () => {
    const institutionId = `testMetrics-${crypto.randomUUID()}`;
    const result = await recordPerformanceMetric({ ...event, institutionId });
    expect(result).toBe(true);

    await wait(2000);

    const successDataPoint = await getLatestDataPoint(
      "successRateMetrics",
      institutionId,
    );
    expect(successDataPoint).toEqual(
      expect.objectContaining({
        result: "_result",
        table: 0,
        _start: expect.any(String),
        _stop: expect.any(String),
        _time: expect.any(String),
        _value: 1,
        _field: "isSuccess",
        _measurement: "successRateMetrics",
        aggregatorId: "agg_789",
        clientId: "client_456",
        institutionId,
        jobTypes: "jobA|jobB",
      }),
    );

    const durationDataPoint = await getLatestDataPoint(
      "durationMetrics",
      institutionId,
    );
    expect(durationDataPoint).toEqual(
      expect.objectContaining({
        result: "_result",
        table: 0,
        _start: expect.any(String),
        _stop: expect.any(String),
        _time: expect.any(String),
        _value: 3000,
        _field: "jobDuration",
        _measurement: "durationMetrics",
        aggregatorId: "agg_789",
        clientId: "client_456",
        institutionId,
        jobTypes: "jobA|jobB",
      }),
    );
  });

  it("Records success metrics on successful event but not duration when recordDuration is false", async () => {
    const institutionId = `testMetrics-${crypto.randomUUID()}`;
    const result = await recordPerformanceMetric({
      ...event,
      institutionId,
      recordDuration: false,
    });
    expect(result).toBe(true);

    await wait(2000);

    const successDataPoint = await getLatestDataPoint(
      "successRateMetrics",
      institutionId,
    );
    expect(successDataPoint).toEqual(
      expect.objectContaining({
        result: "_result",
        table: 0,
        _start: expect.any(String),
        _stop: expect.any(String),
        _time: expect.any(String),
        _value: 1,
        _field: "isSuccess",
        _measurement: "successRateMetrics",
        aggregatorId: "agg_789",
        clientId: "client_456",
        institutionId,
        jobTypes: "jobA|jobB",
      }),
    );

    const durationDataPoint = await getLatestDataPoint(
      "durationMetrics",
      institutionId,
    );
    expect(durationDataPoint).toBeNull();
  });

  it("records success metrics but not duration metric on an unsuccessful event", async () => {
    const testInstitutionId = `testNoDuration-${crypto.randomUUID()}`;

    const result = await recordPerformanceMetric({
      ...event,
      institutionId: testInstitutionId,
      successAt: undefined,
      shouldRecordResult: true,
    });
    expect(result).toBe(true);

    await wait(2000);

    const successDataPoint = await getLatestDataPoint(
      "successRateMetrics",
      testInstitutionId,
    );
    expect(successDataPoint).toEqual(
      expect.objectContaining({
        result: "_result",
        table: 0,
        _start: expect.any(String),
        _stop: expect.any(String),
        _time: expect.any(String),
        _value: 0,
        _field: "isSuccess",
        _measurement: "successRateMetrics",
        aggregatorId: "agg_789",
        clientId: "client_456",
        institutionId: testInstitutionId,
        jobTypes: "jobA|jobB",
      }),
    );

    const durationDataPoint = await getLatestDataPoint(
      "durationMetrics",
      testInstitutionId,
    );
    expect(durationDataPoint).toBeNull();
  });

  it("should return true without recording metrics when shouldRecordResult is false", async () => {
    const testInstitutionId = `testNoRecord-${crypto.randomUUID()}`;

    const result = await recordPerformanceMetric({
      ...event,
      institutionId: testInstitutionId,
      shouldRecordResult: false,
    });

    expect(result).toBe(true);

    await wait(2000);

    const successDataPoint = await getLatestDataPoint(
      "successRateMetrics",
      testInstitutionId,
    );
    expect(successDataPoint).toBeNull();

    const durationDataPoint = await getLatestDataPoint(
      "durationMetrics",
      testInstitutionId,
    );
    expect(durationDataPoint).toBeNull();
  });

  it("should return false and log an error if writePoint throws", async () => {
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
    jest.spyOn(writeApi, "writePoint").mockImplementation(() => {
      throw new Error("InfluxDB write error");
    });

    const result = await recordPerformanceMetric(event);

    expect(result).toBe(false);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Error writing to InfluxDB:",
      expect.any(Error),
    );
  });
});

describe("getPerformanceDataByConnectionId", () => {
  const connectionId = `test-connection-${crypto.randomUUID()}`;

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should return performance data with both duration and success metrics", async () => {
    await seedInfluxTestDb({
      jobTypes: ["transactions", "identity"],
      institutionId: "test_inst_123",
      clientId: "test_client_456",
      aggregatorId: "test_agg_789",
      connectionId,
      duration: 5000,
      success: true,
      flush: true,
    });

    await wait(2000); // Wait for data to be written

    const result = await getPerformanceDataByConnectionId(connectionId);

    expect(result).toEqual({
      connectionId,
      jobTypes: "identity|transactions",
      institutionId: "test_inst_123",
      aggregatorId: "test_agg_789",
      isProcessed: true,
      durationMetric: {
        jobDuration: 5000,
        timestamp: expect.any(String),
      },
      successMetric: {
        isSuccess: true,
        timestamp: expect.any(String),
      },
    });
  });

  it("should return performance data with only success metrics when no duration data exists", async () => {
    const connectionId2 = `test-connection-no-duration-${crypto.randomUUID()}`;

    await seedInfluxTestDb({
      jobTypes: ["accounts"],
      institutionId: "test_inst_456",
      clientId: "test_client_789",
      aggregatorId: "test_agg_123",
      connectionId: connectionId2,
      duration: undefined,
      success: false,
      flush: true,
    });

    await wait(2000);

    const result = await getPerformanceDataByConnectionId(connectionId2);

    expect(result).toEqual({
      connectionId: connectionId2,
      jobTypes: "accounts",
      institutionId: "test_inst_456",
      aggregatorId: "test_agg_123",
      isProcessed: true,
      successMetric: {
        isSuccess: false,
        timestamp: expect.any(String),
      },
    });

    expect(result?.durationMetric).toBeUndefined();
  });

  it("should return null when no data exists for the connection ID", async () => {
    const nonExistentConnectionId = `non-existent-${crypto.randomUUID()}`;

    const result = await getPerformanceDataByConnectionId(
      nonExistentConnectionId,
    );

    expect(result).toBeNull();
  });

  it("should throw an error and log when InfluxDB query fails", async () => {
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

    const queryRowsSpy = jest
      .spyOn(queryApi, "collectRows")
      .mockImplementation(() => {
        throw new Error("InfluxDB query error");
      });

    try {
      await expect(
        getPerformanceDataByConnectionId("error-connection"),
      ).rejects.toThrow("InfluxDB query error");

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error querying InfluxDB:",
        expect.any(Error),
      );
    } finally {
      queryRowsSpy.mockRestore();
      consoleErrorSpy.mockRestore();
    }
  });

  it("should return performance data from Redis when event exists and is not processed", async () => {
    const connectionId = `redis-connection-${crypto.randomUUID()}`;
    const startedAt = Date.now() - 10000;
    const successAt = Date.now();
    const userInteractionTime = 2000;

    const mockRedisEvent = {
      connectionId,
      jobTypes: ["transactions", "accountNumber"],
      institutionId: "testInstitutionId123",
      aggregatorId: "testAggId456",
      clientId: "testClientId789",
      startedAt,
      userInteractionTime,
      pausedAt: null,
      shouldRecordResult: true,
      successAt,
      recordDuration: true,
    };

    await setEvent(connectionId, mockRedisEvent);

    const result = await getPerformanceDataByConnectionId(connectionId);

    expect(result).toEqual({
      connectionId,
      jobTypes: "accountNumber|transactions",
      institutionId: "testInstitutionId123",
      aggregatorId: "testAggId456",
      isProcessed: false,
      durationMetric: {
        jobDuration: successAt - startedAt - userInteractionTime,
        timestamp: new Date(successAt).toISOString(),
      },
      shouldRecordResult: true,
      successMetric: {
        isSuccess: true,
        timestamp: new Date(successAt).toISOString(),
      },
    });
  });

  it("should return performance data from Redis without duration when recordDuration is false", async () => {
    const connectionId = `redis-connection-no-duration-${crypto.randomUUID()}`;
    const startedAt = Date.now() - 5000;
    const successAt = Date.now();

    const mockRedisEvent = {
      connectionId,
      jobTypes: ["accountOwner"],
      institutionId: "testInstitutionId",
      aggregatorId: "testAggId",
      clientId: "testClientId",
      startedAt,
      userInteractionTime: 0,
      pausedAt: null,
      shouldRecordResult: true,
      successAt,
      recordDuration: false,
    };

    await setEvent(connectionId, mockRedisEvent);

    const result = await getPerformanceDataByConnectionId(connectionId);

    expect(result).toEqual({
      connectionId,
      jobTypes: "accountOwner",
      institutionId: "testInstitutionId",
      aggregatorId: "testAggId",
      isProcessed: false,
      shouldRecordResult: true,
      successMetric: {
        isSuccess: true,
        timestamp: new Date(successAt).toISOString(),
      },
    });

    expect(result?.durationMetric).toBeUndefined();
  });

  it("should return performance data from Redis for ongoing event without success", async () => {
    const connectionId = `redis-connection-ongoing-${crypto.randomUUID()}`;
    const startedAt = Date.now() - 3000;

    const mockRedisEvent = {
      connectionId,
      jobTypes: ["transactions"],
      institutionId: "testInstitutionId",
      aggregatorId: "testAggId",
      clientId: "testClientId",
      startedAt,
      userInteractionTime: 1000,
      pausedAt: null,
      shouldRecordResult: true,
      recordDuration: true,
    };

    await setEvent(connectionId, mockRedisEvent);

    const result = await getPerformanceDataByConnectionId(connectionId);

    expect(result).toEqual({
      connectionId,
      jobTypes: "transactions",
      institutionId: "testInstitutionId",
      aggregatorId: "testAggId",
      isProcessed: false,
      shouldRecordResult: true,
      successMetric: {
        isSuccess: false,
        timestamp: new Date(startedAt).toISOString(),
      },
    });

    expect(result?.durationMetric).toBeUndefined();
  });
});
