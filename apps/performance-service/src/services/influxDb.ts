import { EventObject } from "../controllers/eventController";

import {
  InfluxDB,
  Point,
  QueryApi,
  WriteApi,
} from "@influxdata/influxdb-client";

const url: string = process.env.INFLUX_URL || "http://localhost:8086";
const token: string = process.env.INFLUX_TOKEN || "my-secret-token";

const ORG = process.env.INFLUX_ORG || "ucp-org";
const BUCKET = process.env.NODE_ENV === "test" ? "testBucket" : "performance";

const client = new InfluxDB({ url, token });
export const queryApi: QueryApi = client.getQueryApi(ORG);
export const writeApi: WriteApi = client.getWriteApi(ORG, BUCKET);

interface EventData {
  institutionId: string;
  jobTypes: string;
  aggregatorId: string;
  successRate: number;
  jobDuration: number;
}

export const TimeFrameAggWindowMap = {
  "1d": "1h",
  "1w": "12h",
  "30d": "1d",
  "180d": "12d",
  "1y": "30d",
};

export type TimeFrame = keyof typeof TimeFrameAggWindowMap;

export async function getAggregatorMetrics({
  timeFrame,
  aggregators,
  jobTypes,
  metric,
}: {
  timeFrame: TimeFrame;
  aggregators?: string | undefined;
  jobTypes?: string | undefined;
  metric: "successRateMetrics" | "durationMetrics";
}) {
  const formattedJobTypes = jobTypes
    ?.split(",")
    .map((jobType) => jobType.split("|").sort().join("|"));
  const jobTypesFilter = formattedJobTypes?.length
    ? `|> filter(fn: (r) => ${formattedJobTypes.map((type) => `r.jobTypes == string(v: "${type}")`).join(" or ")})`
    : "";
  const aggregatorFilter = aggregators?.length
    ? `|> filter(fn: (r) => ${aggregators
        .split(",")
        .map((aggregatorId) => `r.aggregatorId == string(v: "${aggregatorId}")`)
        .join(" or ")})`
    : "";
  const fluxQuery = `
    from(bucket: "${BUCKET}")
      |> range(start: -${timeFrame})
      |> filter(fn: (r) => r._measurement == "${metric}")
      ${aggregatorFilter}
      ${jobTypesFilter}
      |> group(columns: ["aggregatorId"])
      |> aggregateWindow(every: ${TimeFrameAggWindowMap[timeFrame]}, fn: mean, createEmpty: false)
  `;
  const results: AggSuccessInfluxObj[] = await queryApi.collectRows(fluxQuery);

  return transformInfluxGraphMetrics(results);
}

interface AggSuccessInfluxObj {
  result: string;
  _time: Date;
  aggregatorId: string;
  _value: number;
}

const transformInfluxGraphMetrics = (dataPoints: AggSuccessInfluxObj[]) => {
  const aggregatorsPoints: Record<string, { date: Date; value: number }[]> = {};

  dataPoints.forEach((dataPoint) => {
    if (!aggregatorsPoints[dataPoint.aggregatorId]) {
      aggregatorsPoints[dataPoint.aggregatorId] = [];
    }

    aggregatorsPoints[dataPoint.aggregatorId].push({
      date: dataPoint._time,
      value: dataPoint._value,
    });
  });

  return aggregatorsPoints;
};

export async function getAndTransformAllInstitutionMetrics() {
  const fluxQuery = `
    duration = from(bucket: "${BUCKET}")
      |> range(start: -30d)
      |> filter(fn: (r) => r._measurement == "durationMetrics")
      |> group(columns: ["institutionId", "jobTypes", "aggregatorId"])
      |> mean(column: "_value")
      |> rename(columns: {_value: "jobDuration"})

    success = from(bucket: "${BUCKET}")
        |> range(start: -30d)
        |> filter(fn: (r) => r._measurement == "successRateMetrics")
        |> group(columns: ["institutionId", "jobTypes", "aggregatorId"])
        |> mean(column: "_value")
        |> rename(columns: {_value: "successRate"})

    union(tables: [duration, success])
        |> group(columns: ["institutionId", "jobTypes", "aggregatorId"])
        |> reduce(
          identity: {jobDuration: 0.0, successRate: 0.0},
          fn: (r, accumulator) => ({
            jobDuration: if exists r.jobDuration then r.jobDuration else accumulator.jobDuration,
            successRate: if exists r.successRate then r.successRate else accumulator.successRate
          })
        )
    `;

  const results: EventData[] = await queryApi.collectRows(fluxQuery);
  return transformAllInstitutionsToJson(results);
}

interface QueryJobMetrics {
  successRate: Record<string, number>;
  jobDuration: Record<string, number>;
}

type InstitutionMetrics = Record<string, Record<string, QueryJobMetrics>>;

function transformAllInstitutionsToJson(data: EventData[]) {
  const jsonOutput: InstitutionMetrics = {};

  data.forEach((row) => {
    const { institutionId, jobTypes, aggregatorId, successRate, jobDuration } =
      row;

    if (!jsonOutput[institutionId]) {
      jsonOutput[institutionId] = {};
    }
    if (!jsonOutput[institutionId][jobTypes]) {
      jsonOutput[institutionId][jobTypes] = {
        successRate: {},
        jobDuration: {},
      };
    }

    jsonOutput[institutionId][jobTypes].successRate[aggregatorId] = parseFloat(
      (successRate * 100).toFixed(2),
    );

    const jobDurationInSeconds = jobDuration / 1000;
    if (jobDurationInSeconds) {
      jsonOutput[institutionId][jobTypes].jobDuration[aggregatorId] =
        jobDurationInSeconds;
    }
  });

  return jsonOutput;
}

async function writeData(data: {
  jobTypes: string;
  institutionId: string;
  clientId: string;
  aggregatorId: string;
  isSuccess: boolean;
  jobDuration: number;
}): Promise<boolean> {
  try {
    if (data.isSuccess) {
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
  });
};
