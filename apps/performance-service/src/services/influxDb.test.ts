/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { EventObject } from "../controllers/eventController";
import {
  createTestScenarioEvents,
  expectedTransformedInstitutionData,
} from "../shared/tests/testData/influx";
import { getLatestDataPoint, wait } from "../shared/tests/utils";
import {
  getAndTransformAllInstitutionMetrics,
  recordPerformanceMetric,
} from "./influxDb";
import { writeApi } from "./influxDb";

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
        jobTypes: "jobA_jobB",
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
        jobTypes: "jobA_jobB",
      }),
    );
  });

  it("records success metrics but not duration metric on an unsuccessful event", async () => {
    const testInstitutionId = `testNoDuration-${crypto.randomUUID()}`;

    const result = await recordPerformanceMetric({
      ...event,
      institutionId: testInstitutionId,
      successAt: undefined,
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
        jobTypes: "jobA_jobB",
      }),
    );

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

describe("getAndTransformAllInstitutionMetrics", () => {
  it("queries influxdb and transforms the data properly", async () => {
    const testInstitutionId = `bank1-${crypto.randomUUID()}`;
    const testInstitutionId2 = `bank2-${crypto.randomUUID()}`;

    await createTestScenarioEvents(testInstitutionId, testInstitutionId2);

    await wait(2000);

    const results = await getAndTransformAllInstitutionMetrics();
    expect(results).toEqual(
      expect.objectContaining(
        expectedTransformedInstitutionData(
          testInstitutionId,
          testInstitutionId2,
        ),
      ),
    );
  });
});
