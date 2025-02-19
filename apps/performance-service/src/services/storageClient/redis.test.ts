import {
  del as mockDel,
  get as mockGet,
  set as mockSet,
  keys as mockKeys,
} from "../../__mocks__/redis";
import {
  del,
  get,
  set,
  beginPollAndProcessEvents,
  setEvent,
  getEvent,
  processEvents,
  EVENT_SUBDIRECTORY,
} from "./redis";
import { clearIntervalAsync } from "set-interval-async";
import { EventObject } from "../../controllers/eventController";
import { minutesAgo } from "../../shared/tests/utils";
import { WriteApi } from "@influxdata/influxdb-client";
import * as influxDb from "../influxDb";
import { ComboJobTypes } from "@repo/shared-utils";

describe("redis", () => {
  beforeEach(() => {
    const mockWriteApi = {
      writePoint: jest.fn(),
      close: jest.fn().mockResolvedValue(undefined),
    } as unknown as WriteApi;

    jest.spyOn(influxDb, "createNewWriteApi").mockReturnValue(mockWriteApi);
  });

  describe("get", () => {
    it("gets a JSON.parsed value from the cache", async () => {
      const values = [
        false,
        "testString",
        { test: true },
        1234,
        null,
        undefined,
      ];
      const key = "key";

      for (const value of values) {
        await set(key, value);

        expect(await get(key)).toEqual(value);
      }
    });
  });

  describe("set", () => {
    it("calls set on the client with EX", async () => {
      const EXPIRATION_TIME = 1000;
      await set("test", "test", { EX: EXPIRATION_TIME });

      expect(mockSet).toHaveBeenCalledWith("test", JSON.stringify("test"), {
        EX: EXPIRATION_TIME,
      });
    });

    it("calls set on the client with no parameters", async () => {
      await set("test", "test");

      expect(mockSet).toHaveBeenCalledWith("test", JSON.stringify("test"), {});
    });
  });

  describe("del", () => {
    it("calls del with the key", async () => {
      await del("test");

      expect(mockDel).toHaveBeenCalledWith("test");
    });
  });

  describe("setEvent", () => {
    it("calls set on the client with event subdirectory", async () => {
      const testValue = { test: "test" };
      await setEvent("test", testValue);

      expect(mockSet).toHaveBeenCalledWith(
        `${EVENT_SUBDIRECTORY}:test`,
        JSON.stringify(testValue),
        {},
      );
    });
  });

  describe("getEvent", () => {
    it("calls get on the client with event subdirectory", async () => {
      const testValue = { a: "b" };

      await setEvent("test", testValue);
      const value = await getEvent("test");

      expect(value).toEqual(testValue);
    });
  });

  describe("beginPollAndProcessEvents", () => {
    it("triggers the process function on an interval", async () => {
      const poller = beginPollAndProcessEvents();

      jest.advanceTimersByTime(
        Number(process.env.POLL_INTERVAL_SECONDS) * 1000 + 1000,
      );

      await clearIntervalAsync(poller);
    });
  });

  describe("processEvents", () => {
    const processingTimeLimitMins =
      Number(process.env.EVENT_PROCESSING_TIME_LIMIT_SECONDS || 900) / 60;

    it("checks redis for items in the event subdirectory", async () => {
      const consoleSpy = jest.spyOn(console, "log").mockImplementation();

      await processEvents();

      expect(mockKeys).toHaveBeenCalledWith(`${EVENT_SUBDIRECTORY}:*`);
      expect(consoleSpy).toHaveBeenCalledWith("Nothing to process.");
    });

    it("processes events that have existed longer than the processing threshold", async () => {
      const connectionEventId = "MBR-123";
      await setEvent(connectionEventId, {
        jobTypes: [ComboJobTypes.TRANSACTIONS],
        startedAt: minutesAgo(processingTimeLimitMins + 5),
        successAt: minutesAgo(processingTimeLimitMins + 1),
      } as EventObject);

      await processEvents();

      expect(mockGet).toHaveBeenCalledWith(
        `${EVENT_SUBDIRECTORY}:${connectionEventId}`,
      );
      expect(mockDel).toHaveBeenCalledWith(
        `${EVENT_SUBDIRECTORY}:${connectionEventId}`,
      );
    });

    it("does not processes events that have existed less than the processing threshold", async () => {
      const connectionEventId = "MBR-123";
      await setEvent(connectionEventId, {
        jobTypes: [ComboJobTypes.TRANSACTIONS],
        startedAt: minutesAgo(processingTimeLimitMins - 3),
        successAt: minutesAgo(processingTimeLimitMins - 2),
      } as EventObject);

      await processEvents();

      expect(mockGet).toHaveBeenCalledWith(
        `${EVENT_SUBDIRECTORY}:${connectionEventId}`,
      );
      expect(mockDel).not.toHaveBeenCalled();
    });
  });
});
