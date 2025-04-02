import { InfluxDB, Point } from "@influxdata/influxdb-client";
import "dotenv/config";

const url = process.env.INFLUX_URL || "http://localhost:8086";
const token = process.env.INFLUX_TOKEN || "my-secret-token";

const ORG = process.env.INFLUX_ORG || "ucp-org";
const BUCKET = "performance";

const client = new InfluxDB({ url, token });
export const writeApi = client.getWriteApi(ORG, BUCKET);

const getRandomNumber = (min: number, max: number): number =>
  Math.floor(Math.random() * (max - min + 1)) + min;
const getRandomTimestamp = () => {
  const now = Date.now();
  const oneMonthAgo = now - 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds
  const randomTime = new Date(
    oneMonthAgo + Math.random() * (now - oneMonthAgo),
  );
  return randomTime;
};

const jobTypes = [
  "transactions",
  "accountNumber",
  "accountOwner",
  "transactionHistory",
];
const aggregatorIds = ["mx", "sophtron", "finicity"];
const clientIds = ["ClientA", "ClientB"];
const institutionIds = [
  "5e498f60-3496-4299-96ed-f8eb328ae8af",
  "7a909e62-98b6-4a34-8725-b2a6a63e830a",
  "aeab64a9-7a78-4c5f-bd27-687f3c8b8492",
  "4c1b2595-a5aa-41a1-a2c6-f6caa1e226a6",
  "d20bf4b6-ca19-41c6-a3f8-79801fab379b",
  "cd27ed3b-f81c-4fa9-94a9-039a9f534c7b",
  "ed625b3a-cd81-4aa8-a6f6-2d8321ea47b0",
];

const createPoints = async (): Promise<void> => {
  for (let i = 0; i < institutionIds.length; i++) {
    const jobType = jobTypes[i % jobTypes.length];
    const aggregator = aggregatorIds[i % aggregatorIds.length];
    const client = clientIds[i % clientIds.length];
    const institutionId = institutionIds[i];
    const duration = getRandomNumber(10, 200);
    const timestamp = getRandomTimestamp();
    const success = getRandomNumber(0, 1);

    const durationPoint = new Point("durationMetrics")
      .tag("jobTypes", jobType)
      .tag("institutionId", institutionId)
      .tag("clientId", client)
      .tag("aggregatorId", aggregator)
      .intField("jobDuration", duration * 1000)
      .timestamp(timestamp);

    writeApi.writePoint(durationPoint);

    const successRatePoint = new Point("successRateMetrics")
      .tag("jobTypes", jobType)
      .tag("institutionId", institutionId)
      .tag("clientId", client)
      .tag("aggregatorId", aggregator)
      .intField("isSuccess", success)
      .timestamp(timestamp);

    writeApi.writePoint(successRatePoint);

    console.log("points", durationPoint, successRatePoint);
  }

  await writeApi.flush();
};

createPoints()
  .then(() => {
    console.log("Finished adding seed data to influx");
  })
  .catch(() => {
    console.error("Failed to write seed data to influx");
  });
