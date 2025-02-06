/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Request, Response } from "express";
import {
  createStartEvent,
  updateConnectionPause,
  updateConnectionResume,
  updateSuccessEvent,
} from "./eventController";

import { set as mockSet } from "../__mocks__/redis";
import { EVENT_SUBDIRECTORY, setEvent } from "../services/storageClient/redis";
import { minutesAgo } from "../shared/tests/utils";

const connectionId = "MBR-123";
const expectRedisSetCall = (mockCallIndex: number, valueCheck: jest.Expect) => {
  const mockSetCallArgs = mockSet.mock.calls[mockCallIndex];
  const redisKey = mockSetCallArgs[0]; // First argument (key)
  const redisValue = JSON.parse(mockSetCallArgs[1] as string); // Second argument (parsed JSON)

  expect(redisKey).toBe(`${EVENT_SUBDIRECTORY}:${connectionId}`);

  expect(redisValue).toEqual(valueCheck);
};

describe("eventController", () => {
  describe("createStartEvent", () => {
    it("should add the event to redis and return the event response", async () => {
      const eventBody = {
        jobType: ["aggregate"],
        institutionId: "testInstitutionId",
        aggregatorId: "testAggregatorId",
        clientId: "testClientId",
      };
      const req = {
        params: {
          connectionId,
        },
        body: eventBody,
      } as unknown as Request;
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      } as unknown as Response;

      await createStartEvent(req, res);

      const expectedUpdatedBody = expect.objectContaining({
        connectionId,
        ...eventBody,
        startedAt: expect.any(Number),
      });

      expectRedisSetCall(0, expectedUpdatedBody);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: "Started tracking connection: MBR-123",
        event: expectedUpdatedBody,
      });
    });

    it("should return 400 status and error message when an error is thrown", async () => {
      const req = {
        params: {
          connectionId: "MBR-1234",
        },
        body: {},
      } as unknown as Request;
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      const errorMessage = "Test error";
      jest.spyOn(res, "status").mockImplementationOnce(() => {
        throw new Error(errorMessage);
      });

      await createStartEvent(req, res);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: new Error(errorMessage) });
    });

    it("should return 200 status and message when connection already started", async () => {
      const req = {
        params: {
          connectionId,
        },
        body: {},
      } as unknown as Request;
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      await setEvent(connectionId, {});

      await createStartEvent(req, res);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Connection event already started",
        }),
      );
      expect(mockSet).toHaveBeenCalledTimes(1);
    });
  });

  describe("updateConnectionPause", () => {
    it("should update the redis event with a pausedAt attribute and userInteractionTime of 0", async () => {
      const req = {
        params: {
          connectionId,
        },
      } as unknown as Request;
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      } as unknown as Response;

      await setEvent(connectionId, {});

      await updateConnectionPause(req, res);

      const expectedUpdatedBody = expect.objectContaining({
        pausedAt: expect.any(Number),
        userInteractionTime: 0,
      });

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Connection process paused duration tracking.",
        event: expectedUpdatedBody,
      });

      expectRedisSetCall(1, expectedUpdatedBody);
    });

    it("should return 400 status and error message when an error is thrown", async () => {
      const req = {
        params: {
          connectionId,
        },
      } as unknown as Request;
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      await setEvent(connectionId, {});

      const errorMessage = "Test error";
      jest.spyOn(res, "status").mockImplementationOnce(() => {
        throw new Error(errorMessage);
      });

      await updateConnectionPause(req, res);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: new Error(errorMessage) });
    });

    it("should not update pausedAt if it was already paused", async () => {
      const req = {
        params: {
          connectionId,
        },
      } as unknown as Request;
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      const pausedAtAlreadyTime = Date.now();
      await setEvent(connectionId, {
        pausedAt: pausedAtAlreadyTime,
        userInteractionTime: 0,
      });

      await updateConnectionPause(req, res);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Connection process was already paused. Nothing changed.",
        event: expect.objectContaining({
          pausedAt: pausedAtAlreadyTime,
          userInteractionTime: 0,
        }),
      });
      expect(mockSet).toHaveBeenCalledTimes(1);
    });

    it("should update pausedAt and not change userInteractionTime when paused again", async () => {
      const req = {
        params: {
          connectionId,
        },
      } as unknown as Request;
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      const userInteractionTime = 4000;
      await setEvent(connectionId, {
        pausedAt: null,
        userInteractionTime,
      });

      await updateConnectionPause(req, res);

      const expectedUpdatedBody = expect.objectContaining({
        pausedAt: expect.any(Number),
        userInteractionTime,
      });

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Connection process paused duration tracking.",
        event: expectedUpdatedBody,
      });

      expectRedisSetCall(1, expectedUpdatedBody);
    });
  });

  describe("updateConnectionResume", () => {
    it("should add userInteractionTime and nullify pausedAt and update the redis event", async () => {
      const req = {
        params: {
          connectionId,
        },
      } as unknown as Request;
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      } as unknown as Response;

      await setEvent(connectionId, {
        pausedAt: minutesAgo(3),
        userInteractionTime: 0,
      });

      await updateConnectionResume(req, res);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const jsonResponse = (res.json as jest.Mock).mock.calls[0][0] as {
        event: { userInteractionTime: number };
      };

      const expectedUpdatedBody = expect.objectContaining({
        pausedAt: null,
        userInteractionTime: expect.any(Number),
      });

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Connection process resumed duration tracking.",
        event: expectedUpdatedBody,
      });

      expect(jsonResponse.event.userInteractionTime).toBeGreaterThanOrEqual(
        180000, // 3 minutes
      );

      expectRedisSetCall(1, expectedUpdatedBody);
    });

    it("should do nothing when the connection was not paused", async () => {
      const req = {
        params: {
          connectionId,
        },
      } as unknown as Request;
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      } as unknown as Response;

      await setEvent(connectionId, {
        pausedAt: null,
        userInteractionTime: 0,
      });

      await updateConnectionResume(req, res);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Connection was not paused. Nothing changed.",
        event: expect.objectContaining({
          pausedAt: null,
          userInteractionTime: 0,
        }),
      });

      expect(mockSet).toHaveBeenCalledTimes(1);
    });

    it("should return 400 status and error message when an error is thrown", async () => {
      const req = {
        params: { connectionId },
      } as unknown as Request;
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      const errorMessage = "Test error";
      jest.spyOn(res, "status").mockImplementationOnce(() => {
        throw new Error(errorMessage);
      });

      await updateConnectionResume(req, res);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: new Error(errorMessage) });

      expect(mockSet).not.toHaveBeenCalled();
    });
  });

  describe("updateSuccessEvent", () => {
    it("should set successAt and update redis", async () => {
      const req = {
        params: { connectionId },
      } as unknown as Request;
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      } as unknown as Response;

      await setEvent(connectionId, {});

      await updateSuccessEvent(req, res);

      const expectedUpdatedBody = expect.objectContaining({
        successAt: expect.any(Number),
      });

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Connection was completed successfully.",
        event: expectedUpdatedBody,
      });

      expectRedisSetCall(1, expectedUpdatedBody);
    });

    it("should do nothing if event is already marked successful", async () => {
      const req = {
        params: { connectionId },
      } as unknown as Request;
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      } as unknown as Response;

      await setEvent(connectionId, {
        successAt: Date.now(),
      });

      await updateSuccessEvent(req, res);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Connection was already completed. Nothing changed.",
        event: expect.objectContaining({
          successAt: expect.any(Number),
        }),
      });

      expect(mockSet).toHaveBeenCalledTimes(1);
    });

    it("should return 400 status and error message when an error is thrown", async () => {
      const req = {
        params: { connectionId },
      } as unknown as Request;
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      const errorMessage = "Test error";
      jest.spyOn(res, "status").mockImplementationOnce(() => {
        throw new Error(errorMessage);
      });

      await setEvent(connectionId, {
        successAt: Date.now(),
      });

      await updateSuccessEvent(req, res);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: new Error(errorMessage) });

      expect(mockSet).toHaveBeenCalledTimes(1);
    });
  });
});
