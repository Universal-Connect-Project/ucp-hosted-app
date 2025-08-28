import { Point } from "@influxdata/influxdb-client";
import {
  influxDBClient,
  INFLUX_ORG,
  queryApi,
  writeApi,
} from "../../services/influxDb";
import { ComboJobTypes } from "@repo/shared-utils";
import { DeleteAPI } from "@influxdata/influxdb-client-apis";

const deleteApi = new DeleteAPI(influxDBClient);

export const minutesAgo = (minutes: number): number =>
  Date.now() - minutes * 60 * 1000;

export const wait = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const shuffleArray = (array: string[]): string[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

const testBucketName = "testBucket";

export const clearInfluxData = async () => {
  const start = "1970-01-01T00:00:00Z"; // Unix epoch
  const stop = new Date().toISOString(); // Current time

  try {
    await deleteApi.postDelete({
      org: INFLUX_ORG,
      bucket: testBucketName,
      body: {
        start,
        stop,
      },
    });
  } catch (error) {
    console.error("Error clearing bucket:", error);
  }
};

export const testInstitutionId = "testInstitution";

export const createFakeAccessToken = (clientId: string = "test") => {
  const headers = {
    alg: "RS256",
    typ: "JWT",
    kid: "l0NUw2KQif_eSkGv73Qk3",
  };
  const payload = {
    iss: "https://auth-staging.universalconnectproject.org/",
    sub: "U1S5r5EQ9bPqXD5ai6769u9oi63BD1S2@clients",
    aud: "ucp-widget-interactions",
    iat: 1741816827,
    exp: 1741903227,
    scope: "read:widget-endpoints write:widget-endpoints",
    gty: "client-credentials",
    azp: clientId,
    permissions: ["read:widget-endpoints", "write:widget-endpoints"],
  };
  const publicKey = {
    e: "AQAB",
    kty: "RSA",
    n: "fake-key",
  };
  const jwt = [
    btoa(JSON.stringify(headers)),
    btoa(JSON.stringify(payload)),
    btoa(JSON.stringify(publicKey)),
  ].join(".");

  return `Bearer ${jwt}`;
};

export async function getLatestDataPoint(
  measurement: string,
  institutionId: string,
) {
  const fluxQuery = `
    from(bucket: "${testBucketName}")
      |> range(start: -5m)
      |> filter(fn: (r) => r._measurement == "${measurement}")
      |> filter(fn: (r) => r.institutionId == "${institutionId}")
      |> group(columns: [])
      |> last()
  `;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let result: any = null;

  return new Promise((resolve, reject) => {
    queryApi.queryRows(fluxQuery, {
      next(row, tableMeta) {
        result = tableMeta.toObject(row);
      },
      error(error) {
        reject(error);
      },
      complete() {
        resolve(result);
      },
    });
  });
}

interface SeedInfluxTestDbParams {
  jobTypes?: string[];
  institutionId?: string;
  clientId?: string;
  aggregatorId?: string;
  connectionId?: string;
  duration?: number | undefined;
  timestamp?: Date;
  success?: boolean;
  flush?: boolean;
}

export const seedInfluxTestDb = async ({
  jobTypes = ["transactions"],
  institutionId = testInstitutionId,
  clientId = "testClient",
  aggregatorId = "mx",
  connectionId = "testConnection",
  duration,
  timestamp = new Date(),
  success = true,
  flush = true,
}: SeedInfluxTestDbParams) => {
  const jobType = jobTypes.sort().join("|");

  if (duration) {
    const durationPoint = new Point("durationMetrics")
      .tag("jobTypes", jobType)
      .tag("institutionId", institutionId)
      .tag("clientId", clientId)
      .tag("aggregatorId", aggregatorId)
      .tag("connectionId", connectionId)
      .intField("jobDuration", duration)
      .timestamp(timestamp);

    writeApi.writePoint(durationPoint);
  }

  const successRatePoint = new Point("successRateMetrics")
    .tag("jobTypes", jobType)
    .tag("institutionId", institutionId)
    .tag("clientId", clientId)
    .tag("aggregatorId", aggregatorId)
    .tag("connectionId", connectionId)
    .intField("isSuccess", success ? 1 : 0)
    .timestamp(timestamp);

  writeApi.writePoint(successRatePoint);

  if (flush) {
    await writeApi.flush();
  }
};

export const TEST_DURATION_ONE_DAY = 500;
export const TEST_DURATION_ONE_WEEK = 1000;
export const TEST_DURATION_ONE_MONTH = 2000;
export const TEST_DURATION_HALF_YEAR = 2500;
export const TEST_DURATION_ONE_YEAR = 3000;

export const allJobTypeCombinations: string[] = Object.values(ComboJobTypes)
  .reduce<string[][]>(
    (subsets, jobType) =>
      subsets.concat(subsets.map((set) => [...set, jobType])),
    [[]],
  )
  .filter((set) => set.length > 0)
  .flatMap((jobTypes) => jobTypes.sort().join("|"));

export const seedInfluxWithAllTimeFrameData = async () => {
  const now = new Date();

  function getDuration(timestamp: Date) {
    const diffMs = now.getTime() - timestamp.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    const diffDays = diffHours / 24;

    if (diffHours <= 24) return TEST_DURATION_ONE_DAY;
    if (diffDays <= 7) return TEST_DURATION_ONE_WEEK;
    if (diffDays <= 30) return TEST_DURATION_ONE_MONTH;
    if (diffDays <= 180) return TEST_DURATION_HALF_YEAR;

    return TEST_DURATION_ONE_YEAR; // Default for anything older
  }

  // Last 25 hours - Every 30 minutes
  for (let i = 0; i <= 25 * 2; i++) {
    const timestamp = new Date(now);
    const jobTypes = allJobTypeCombinations[i % allJobTypeCombinations.length];
    const success =
      jobTypes === "accountOwner|transactionHistory" ? false : true;
    timestamp.setMinutes(now.getMinutes() - i * 30);
    await seedInfluxTestDb({
      timestamp,
      jobTypes: jobTypes.split("|"),
      success,
      duration: getDuration(timestamp),
      flush: false,
    });
  }

  // Last 8 days - Every 6 hours
  for (let i = 1; i <= 8 * 4; i++) {
    const timestamp = new Date(now);
    timestamp.setHours(now.getHours() - i * 6);
    await seedInfluxTestDb({
      timestamp,
      duration: getDuration(timestamp),
      flush: false,
    });
  }

  // Last 31 days - Every 12 hours
  for (let i = 1; i <= 31 * 2; i++) {
    const timestamp = new Date(now);
    timestamp.setHours(now.getHours() - i * 12);
    const duration = getDuration(timestamp);
    await seedInfluxTestDb({ timestamp, duration, flush: false });
  }

  // Last 180 days - Every 6 days
  for (let i = 1; i <= 180 / 6; i++) {
    const timestamp = new Date(now);
    timestamp.setDate(now.getDate() - i * 6);
    const duration = getDuration(timestamp);
    await seedInfluxTestDb({ timestamp, duration, flush: false });
  }

  // Last 1 year (365 days) - Every 15 days
  for (let i = 1; i <= 365 / 15; i++) {
    const timestamp = new Date(now);
    timestamp.setDate(now.getDate() - i * 15);
    const duration = getDuration(timestamp);
    await seedInfluxTestDb({ timestamp, duration, flush: false });
  }

  await writeApi.flush();
  await wait(1000);
};
