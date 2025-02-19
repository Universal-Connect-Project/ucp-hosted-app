/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Request, Response } from "express";
import {
  createStartEvent,
  updateConnectionPause,
  updateConnectionResume,
  updateSuccessEvent,
} from "./eventController";

import { getEvent } from "../services/storageClient/redis";
import { ComboJobTypes } from "@repo/shared-utils";

const connectionId = "MBR-123";

const mockRequest = {
  params: {
    connectionId,
  },
  body: {},
} as unknown as Request;

const preCheckMockResponse = {
  status: jest.fn().mockReturnThis(),
  json: jest.fn(),
} as unknown as Response;

const expectRedisEventToEqual = async (
  connectionId: string,
  valueCheck: jest.Expect | undefined,
) => {
  const event = await getEvent(connectionId);
  expect(event).toEqual(valueCheck);
};

describe("eventController", () => {
  describe("createStartEvent", () => {
    it("should add the event to redis and return the event response", async () => {
      const eventBody = {
        jobTypes: [ComboJobTypes.TRANSACTIONS],
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

      await expectRedisEventToEqual(connectionId, expectedUpdatedBody);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: "Started tracking connection: MBR-123",
        event: expectedUpdatedBody,
      });
    });

    it("should return 400 status and error message when an error is thrown", async () => {
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      const errorMessage = "Test error";
      jest.spyOn(res, "status").mockImplementationOnce(() => {
        throw new Error(errorMessage);
      });

      await createStartEvent(mockRequest, res);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: new Error(errorMessage) });
    });

    it("should return 200 status and message when connection already started", async () => {
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      await createStartEvent(mockRequest, preCheckMockResponse);
      await createStartEvent(mockRequest, res);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Connection event already started",
        }),
      );

      await expectRedisEventToEqual(
        connectionId,
        expect.objectContaining({
          startedAt: expect.any(Number),
        }),
      );
    });
  });

  describe("updateConnectionPause", () => {
    it("should update the redis event with a pausedAt attribute and userInteractionTime of 0", async () => {
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      } as unknown as Response;

      await createStartEvent(mockRequest, res);

      await updateConnectionPause(mockRequest, res);

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

      await expectRedisEventToEqual(connectionId, expectedUpdatedBody);
    });

    it("should return 400 status and error message when an error is thrown", async () => {
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      await createStartEvent(mockRequest, res);

      const errorMessage = "Test error";
      jest.spyOn(res, "status").mockImplementationOnce(() => {
        throw new Error(errorMessage);
      });

      await updateConnectionPause(mockRequest, res);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: new Error(errorMessage) });
    });

    it("should not update pausedAt if it was already paused", async () => {
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      const pausedAtAlreadyTime = Date.now();
      await createStartEvent(mockRequest, preCheckMockResponse);
      await updateConnectionPause(mockRequest, preCheckMockResponse);

      jest.advanceTimersByTime(3000);

      await updateConnectionPause(mockRequest, res);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Connection process was already paused. Nothing changed.",
        event: expect.objectContaining({
          pausedAt: pausedAtAlreadyTime,
          userInteractionTime: 0,
        }),
      });
    });

    it("should update pausedAt and not change userInteractionTime when paused again", async () => {
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      const userInteractionTime = 3000;

      await createStartEvent(mockRequest, preCheckMockResponse);
      await updateConnectionPause(mockRequest, preCheckMockResponse);
      jest.advanceTimersByTime(userInteractionTime);
      await updateConnectionResume(mockRequest, preCheckMockResponse);

      await updateConnectionPause(mockRequest, res);

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

      await expectRedisEventToEqual(connectionId, expectedUpdatedBody);
    });
  });

  describe("updateConnectionResume", () => {
    it("should add userInteractionTime and nullify pausedAt and update the redis event", async () => {
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      } as unknown as Response;

      const threeMinutes = 180000;

      await createStartEvent(mockRequest, preCheckMockResponse);
      await updateConnectionPause(mockRequest, preCheckMockResponse);
      jest.advanceTimersByTime(threeMinutes);

      await updateConnectionResume(mockRequest, res);

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
        threeMinutes,
      );

      await expectRedisEventToEqual(connectionId, expectedUpdatedBody);
    });

    it("should do nothing when the connection was not paused", async () => {
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      } as unknown as Response;

      await createStartEvent(mockRequest, preCheckMockResponse);

      await updateConnectionResume(mockRequest, res);

      const expectedBody = expect.objectContaining({
        connectionId,
        startedAt: expect.any(Number),
      });

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Connection was not paused. Nothing changed.",
        event: expectedBody,
      });

      await expectRedisEventToEqual(connectionId, expectedBody);
    });

    it("should return 400 status and error message when an error is thrown", async () => {
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      const errorMessage = "Test error";
      jest.spyOn(res, "status").mockImplementationOnce(() => {
        throw new Error(errorMessage);
      });

      await updateConnectionResume(mockRequest, res);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: new Error(errorMessage) });

      await expectRedisEventToEqual(connectionId, undefined);
    });
  });

  describe("updateSuccessEvent", () => {
    it("should set successAt and update redis", async () => {
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      } as unknown as Response;

      await createStartEvent(mockRequest, preCheckMockResponse);

      await updateSuccessEvent(mockRequest, res);

      const expectedUpdatedBody = expect.objectContaining({
        successAt: expect.any(Number),
      });

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Connection was completed successfully.",
        event: expectedUpdatedBody,
      });

      await expectRedisEventToEqual(connectionId, expectedUpdatedBody);
    });

    it("should do nothing if event is already marked successful", async () => {
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      } as unknown as Response;

      await createStartEvent(mockRequest, preCheckMockResponse);
      await updateSuccessEvent(mockRequest, preCheckMockResponse);

      await updateSuccessEvent(mockRequest, res);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Connection was already completed. Nothing changed.",
        event: expect.objectContaining({
          successAt: expect.any(Number),
        }),
      });
    });

    it("should return 400 status and error message when an error is thrown", async () => {
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      const errorMessage = "Test error";
      jest.spyOn(res, "status").mockImplementationOnce(() => {
        throw new Error(errorMessage);
      });

      await createStartEvent(mockRequest, preCheckMockResponse);

      await updateSuccessEvent(mockRequest, res);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: new Error(errorMessage) });
    });
  });
});
