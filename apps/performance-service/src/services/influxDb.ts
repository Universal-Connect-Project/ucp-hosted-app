import { EventObject } from "../controllers/eventController";

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
}): Promise<boolean> {
  try {
    if (data.isSuccess && data.recordDuration) {
      const durationPoint = new Point("durationMetrics")
        .tag("jobTypes", data.jobTypes)
        .tag("institutionId", data.institutionId)
        .tag("clientId", data.clientId)
        .tag("aggregatorId", data.aggregatorId)
        .intField("jobDuration", data.jobDuration);

      writeApi.writePoint(durationPoint);
    }

    const successRatePoint = new Point("successRateMetrics")
      .tag("jobTypes", data.jobTypes)
      .tag("institutionId", data.institutionId)
      .tag("clientId", data.clientId)
      .tag("aggregatorId", data.aggregatorId)
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

export const recordPerformanceMetric = async (
  event: EventObject,
): Promise<boolean> => {
  const jobTypesKey = [...event.jobTypes].sort().join("|");

  const totalDuration = event?.successAt
    ? event.successAt - event.startedAt - (event.userInteractionTime || 0)
    : 0;

  return await writeData({
    jobTypes: jobTypesKey,
    institutionId: event.institutionId,
    clientId: event.clientId,
    aggregatorId: event.aggregatorId,
    isSuccess: !!event.successAt,
    jobDuration: totalDuration,
    recordDuration: event.recordDuration,
  });
};
