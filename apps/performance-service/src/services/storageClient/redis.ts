import { setIntervalAsync } from "set-interval-async";
import "../../dotEnv";
import { createClient } from "redis";
import { EventObject } from "../../controllers/eventController";
import { recordPerformanceMetric } from "../influxDb";

export const EVENT_SUBDIRECTORY = "event";

const redisClient = createClient({
  url: process.env.UPSTASH_REDIS_URL || process.env.REDIS_SERVER,
  ...(process.env.REDIS_ENABLE_TLS && {
    socket: {
      tls: true,
      rejectUnauthorized: false,
    },
  }),
});

export const get = async (key: string) => {
  try {
    const ret = await redisClient.get(key);
    return JSON.parse(`${ret}`) as object;
  } catch {
    console.error("Failed to get value from Redis");
  }
};

export const set = async (key: string, value: unknown, params: object = {}) => {
  await redisClient.set(key, JSON.stringify(value), params);
};

export const del = async (key: string) => {
  try {
    await redisClient.del(key);
  } catch {
    console.error("Failed to delete value in Redis");
  }
};

export const setEvent = async (key: string, value: object) => {
  await set(`${EVENT_SUBDIRECTORY}:${key}`, value);
};

export const getEvent = async (key: string) => {
  return await get(`${EVENT_SUBDIRECTORY}:${key}`);
};

export const beginPollAndProcessEvents = () => {
  return setIntervalAsync(
    async () => processEvents(),
    Number(process.env.POLL_INTERVAL_SECONDS || 30) * 1000,
  );
};

export const processEvents = async () => {
  console.log("Polling Redis for event processing...");

  const eventKeys = await redisClient.keys(`${EVENT_SUBDIRECTORY}:*`);
  if (!eventKeys.length) {
    console.log("Nothing to process.");
    return;
  }

  const now = Date.now();

  for (const key of eventKeys) {
    const data = (await get(key)) as EventObject;
    if (data == null) continue;

    const ageSeconds = (now - data.startedAt) / 1000;

    if (ageSeconds >= Number(process.env.EVENT_PROCESSING_TIME_LIMIT_SECONDS)) {
      console.log(`Processing key "${key}" (age: ${ageSeconds}s)`);

      const processedEvent = await recordPerformanceMetric(data);

      if (processedEvent) {
        await del(key);
        console.log(`Key "${key}" deleted after processing.`);
      } else {
        console.log("Data is not writing to Influx");
      }
    }
  }
};

redisClient
  .connect()
  .then(() => {
    console.log(
      "Redis connection established with server: " + process.env.REDIS_SERVER,
    );
  })
  .catch((reason) => {
    console.error(
      `Failed to connect to redis server at ${process.env.REDIS_SERVER}: ` +
        reason,
    );
    console.log("No redis connection");
  });
