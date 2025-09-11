import { EventObject } from "../controllers/eventController";
import { getEvent } from "./storageClient/redis";

import {
  InfluxDB,
  Point,
  QueryApi,
  WriteApi,
} from "@influxdata/influxdb-client";

const url: string = process.env.INFLUX_URL || "http://localhost:8086";
const token: string = process.env.INFLUX_TOKEN || "my-secret-token";

export const INFLUX_ORG = process.env.INFLUX_ORG || "ucp-org";
export const BUCKET =
  process.env.NODE_ENV === "test" ? "testBucket" : "performance";

const client = new InfluxDB({ url, token });
export const queryApi: QueryApi = client.getQueryApi(INFLUX_ORG);
export const writeApi: WriteApi = client.getWriteApi(INFLUX_ORG, BUCKET);

export const influxDBClient = client;

async function writeData(data: {
  jobTypes: string;
  institutionId: string;
  clientId: string;
  aggregatorId: string;
  isSuccess: boolean;
  jobDuration: number;
  recordDuration: boolean;
  connectionId: string;
}): Promise<boolean> {
  try {
    if (data.isSuccess && data.recordDuration) {
      const durationPoint = new Point("durationMetrics")
        .tag("jobTypes", data.jobTypes)
        .tag("institutionId", data.institutionId)
        .tag("clientId", data.clientId)
        .tag("aggregatorId", data.aggregatorId)
        .tag("connectionId", data.connectionId)
        .intField("jobDuration", data.jobDuration);

      writeApi.writePoint(durationPoint);
    }

    const successRatePoint = new Point("successRateMetrics")
      .tag("jobTypes", data.jobTypes)
      .tag("institutionId", data.institutionId)
      .tag("clientId", data.clientId)
      .tag("aggregatorId", data.aggregatorId)
      .tag("connectionId", data.connectionId)
      .intField("isSuccess", data.isSuccess ? 1 : 0);

    writeApi.writePoint(successRatePoint);

    await writeApi.flush();
    console.log("Data written successfully!");
    return true;
  } catch (error) {
    console.error("Error writing to InfluxDB:", error);
    return false;
  }
}

const getTotalDuration = (event: EventObject): number => {
  if (!event.successAt) {
    return 0;
  }
  if (event.durationOverwrite) {
    return event.durationOverwrite;
  }
  return event.successAt - event.startedAt - (event.userInteractionTime || 0);
};

export const recordPerformanceMetric = async (
  event: EventObject,
): Promise<boolean> => {
  if (!event.shouldRecordResult) {
    return true; // Delete the performance object without recording the data
  }

  const jobTypesKey = [...event.jobTypes].sort().join("|");

  const totalDuration = getTotalDuration(event);

  return await writeData({
    jobTypes: jobTypesKey,
    institutionId: event.institutionId,
    clientId: event.clientId,
    aggregatorId: event.aggregatorId,
    isSuccess: !!event.successAt,
    jobDuration: totalDuration,
    recordDuration: event.recordDuration,
    connectionId: event.connectionId,
  });
};

interface PerformanceData {
  connectionId: string;
  jobTypes: string;
  institutionId: string;
  aggregatorId: string;
  isProcessed: boolean;
  shouldRecordResult?: boolean;
  durationMetric?: {
    jobDuration: number;
    timestamp: string;
  };
  successMetric: {
    isSuccess: boolean;
    timestamp: string;
  };
}

interface InfluxQueryResult {
  _time: string;
  _value: number;
  jobTypes: string;
  institutionId: string;
  aggregatorId: string;
  connectionId: string;
}

export const getPerformanceDataByConnectionId = async (
  connectionId: string,
): Promise<PerformanceData | null> => {
  try {
    const redisEvent = (await getEvent(connectionId)) as EventObject;

    if (redisEvent) {
      const jobTypesKey = [...redisEvent.jobTypes].sort().join("|");

      const performanceData: PerformanceData = {
        connectionId,
        jobTypes: jobTypesKey,
        institutionId: redisEvent.institutionId,
        aggregatorId: redisEvent.aggregatorId,
        isProcessed: false,
        shouldRecordResult: redisEvent.shouldRecordResult,
        successMetric: {
          isSuccess: !!redisEvent.successAt,
          timestamp: redisEvent.successAt
            ? new Date(redisEvent.successAt).toISOString()
            : new Date(redisEvent.startedAt).toISOString(),
        },
      };

      if (redisEvent.successAt && redisEvent.recordDuration) {
        const totalDuration = getTotalDuration(redisEvent);
        performanceData.durationMetric = {
          jobDuration: totalDuration,
          timestamp: new Date(redisEvent.successAt).toISOString(),
        };
      }

      return performanceData;
    }

    const successQuery = `
      from(bucket: "${BUCKET}")
      |> range(start: -30d)
      |> filter(fn: (r) => r._measurement == "successRateMetrics")
      |> filter(fn: (r) => r.connectionId == "${connectionId}")
      |> last()
    `;

    const successResults =
      await queryApi.collectRows<InfluxQueryResult>(successQuery);

    if (successResults.length === 0) {
      return null;
    }

    const durationQuery = `
      from(bucket: "${BUCKET}")
      |> range(start: -30d)
      |> filter(fn: (r) => r._measurement == "durationMetrics")
      |> filter(fn: (r) => r.connectionId == "${connectionId}")
      |> last()
    `;

    const durationResults =
      await queryApi.collectRows<InfluxQueryResult>(durationQuery);

    if (successResults.length === 0) {
      return null;
    }

    const successResult = successResults[0];
    const durationResult =
      durationResults.length > 0 ? durationResults[0] : null;

    const performanceData: PerformanceData = {
      connectionId,
      jobTypes: successResult.jobTypes,
      institutionId: successResult.institutionId,
      aggregatorId: successResult.aggregatorId,
      isProcessed: true,
      successMetric: {
        isSuccess: successResult._value === 1,
        timestamp: successResult._time,
      },
    };

    if (durationResult) {
      performanceData.durationMetric = {
        jobDuration: durationResult._value,
        timestamp: durationResult._time,
      };
    }

    return performanceData;
  } catch (error) {
    console.error("Error querying InfluxDB:", error);
    throw error;
  }
};
