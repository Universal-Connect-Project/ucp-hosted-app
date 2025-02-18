/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { EventObject } from "../controllers/eventController";
import {
  influxQueryResults,
  transformedInstitutionData,
} from "../shared/tests/testData/influx";
import {
  getAndTransformAllInstitutionMetrics,
  recordPerformanceMetric,
} from "./influxDb";
import { queryApi } from "./influxDb";
import * as influxDb from "./influxDb";
import { WriteApi } from "@influxdata/influxdb-client";

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
    const mockWriteApi = {
      writePoint: jest.fn(),
      close: jest.fn().mockResolvedValue(undefined),
    } as unknown as WriteApi;

    jest.spyOn(influxDb, "createNewWriteApi").mockReturnValue(mockWriteApi);

    const result = await recordPerformanceMetric(event);
    expect(result).toBe(true);

    expect(mockWriteApi.writePoint).toHaveBeenCalledTimes(2);

    expect(mockWriteApi.writePoint).toHaveBeenCalledWith(
      expect.objectContaining({
        tags: expect.objectContaining({
          jobTypes: event.jobTypes.sort().join("_"),
          institutionId: event.institutionId,
          clientId: event.clientId,
          aggregatorId: event.aggregatorId,
        }),
        fields: expect.objectContaining({
          jobDuration: "3000i",
        }),
      }),
    );

    expect(mockWriteApi.writePoint).toHaveBeenCalledWith(
      expect.objectContaining({
        fields: expect.objectContaining({ isSuccess: "1i" }),
      }),
    );
  });

  it("records success metrics but not duration metric on an unsuccessful event", async () => {
    const mockWriteApi = {
      writePoint: jest.fn(),
      close: jest.fn().mockResolvedValue(undefined),
    } as unknown as WriteApi;

    jest.spyOn(influxDb, "createNewWriteApi").mockReturnValue(mockWriteApi);

    const result = await recordPerformanceMetric({
      ...event,
      successAt: undefined,
    });
    expect(result).toBe(true);

    expect(mockWriteApi.writePoint).toHaveBeenCalledTimes(1);

    expect(mockWriteApi.writePoint).toHaveBeenCalledWith(
      expect.objectContaining({
        fields: expect.objectContaining({ isSuccess: "0i" }),
      }),
    );
  });

  it("should return false and log an error if writePoint throws", async () => {
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
    const mockWriteApi = {
      writePoint: jest.fn().mockImplementation(() => {
        throw new Error("InfluxDB write error");
      }),
      close: jest.fn().mockResolvedValue(undefined),
    } as unknown as WriteApi;

    jest.spyOn(influxDb, "createNewWriteApi").mockReturnValue(mockWriteApi);

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
    jest.spyOn(queryApi, "collectRows").mockResolvedValue(influxQueryResults);

    const results = await getAndTransformAllInstitutionMetrics();
    expect(results).toEqual(transformedInstitutionData);
  });
});
