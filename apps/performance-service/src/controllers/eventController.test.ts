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
import { createFakeAccessToken } from "../shared/tests/utils";

const connectionId = "MBR-123";

const mockRequest = {
  params: {
    connectionId,
  },
  headers: {
    authorization: createFakeAccessToken(),
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
    it("should add the event to redis and return the event response with recordDuration defaulting to true", async () => {
      const clientId = "testClientId";
      const eventBody = {
        jobTypes: [ComboJobTypes.TRANSACTIONS],
        institutionId: "testInstitutionId",
        aggregatorId: "testAggregatorId",
      };
      const req = {
        params: {
          connectionId,
        },
        headers: {
          authorization: createFakeAccessToken(clientId),
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
        clientId,
        startedAt: expect.any(Number),
        recordDuration: true,
        shouldRecordResult: true,
      });

      await expectRedisEventToEqual(connectionId, expectedUpdatedBody);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: "Started tracking connection: MBR-123",
        event: expectedUpdatedBody,
      });
    });

    it("should add the event to redis and return the event response with recordDuration set to false", async () => {
      const clientId = "testClientId";
      const eventBody = {
        jobTypes: [ComboJobTypes.TRANSACTIONS],
        institutionId: "testInstitutionId",
        aggregatorId: "testAggregatorId",
        recordDuration: false,
      };
      const req = {
        params: {
          connectionId,
        },
        headers: {
          authorization: createFakeAccessToken(clientId),
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
        clientId,
        startedAt: expect.any(Number),
        recordDuration: false,
        shouldRecordResult: true,
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
          shouldRecordResult: true,
        }),
      );
    });
  });

  describe("updateConnectionPause", () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    it("should return 400 without proper client access", async () => {
      await createStartEvent(mockRequest, preCheckMockResponse);

      const req = {
        params: {
          connectionId,
        },
        headers: {
          authorization: createFakeAccessToken("differentClientId"),
        },
      } as unknown as Request;

      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      } as unknown as Response;

      await updateConnectionPause(req, res);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Unauthorized attempt to modify a connection event",
      });
    });

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
        shouldRecordResult: true,
      });

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Connection process paused duration tracking.",
        event: expectedUpdatedBody,
      });

      await expectRedisEventToEqual(connectionId, expectedUpdatedBody);
    });

    it("should update shouldRecordResult status even when already paused", async () => {
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      } as unknown as Response;

      const req = {
        ...mockRequest,
        body: { shouldRecordResult: false },
      } as unknown as Request;

      await createStartEvent(req, preCheckMockResponse);

      const pauseReq = {
        ...mockRequest,
      } as unknown as Request;

      await updateConnectionPause(pauseReq, preCheckMockResponse);
      // Confirm that shouldRecordResult doesn't default to true
      await expectRedisEventToEqual(
        connectionId,
        expect.objectContaining({
          shouldRecordResult: false,
        }),
      );

      const updateReq = {
        ...mockRequest,
        body: { shouldRecordResult: true },
      } as unknown as Request;

      await updateConnectionPause(updateReq, res);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message:
          "Connection process was already paused. But shouldRecordResult updated.",
        event: expect.objectContaining({
          shouldRecordResult: true,
        }),
      });
    });

    it("should not update shouldRecordResult from true to false when already paused", async () => {
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      } as unknown as Response;

      await createStartEvent(mockRequest, preCheckMockResponse);
      await updateConnectionPause(mockRequest, preCheckMockResponse);

      const updateReq = {
        ...mockRequest,
        body: { shouldRecordResult: false },
      } as unknown as Request;

      await updateConnectionPause(updateReq, res);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Connection process was already paused. Nothing changed.",
        event: expect.objectContaining({
          shouldRecordResult: true,
        }),
      });
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
          shouldRecordResult: true,
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
        shouldRecordResult: true,
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
    it("should return 400 without proper client access", async () => {
      await createStartEvent(mockRequest, preCheckMockResponse);

      const req = {
        params: {
          connectionId,
        },
        headers: {
          authorization: createFakeAccessToken("differentClientId"),
        },
      } as unknown as Request;

      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      } as unknown as Response;

      await updateConnectionResume(req, res);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Unauthorized attempt to modify a connection event",
      });
    });

    it("should add userInteractionTime and nullify pausedAt and update the redis event", async () => {
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      } as unknown as Response;

      const threeMinutes = 180000;

      const req = {
        ...mockRequest,
        body: {
          shouldRecordResult: false,
        },
      } as unknown as Request;

      await createStartEvent(req, preCheckMockResponse);
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
        shouldRecordResult: false, // Confirm that shouldRecordResult doesn't default to true on pause and resume events
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

    it("should update shouldRecordResult to true when resuming", async () => {
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      } as unknown as Response;

      const req = {
        ...mockRequest,
        body: {
          shouldRecordResult: false,
        },
      } as unknown as Request;

      await createStartEvent(req, preCheckMockResponse);
      await updateConnectionPause(mockRequest, preCheckMockResponse);

      const updateReq = {
        ...mockRequest,
        body: { shouldRecordResult: true },
      } as unknown as Request;

      await updateConnectionResume(updateReq, res);

      const expectedUpdatedBody = expect.objectContaining({
        pausedAt: null,
        shouldRecordResult: true,
      });

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Connection process resumed duration tracking.",
        event: expectedUpdatedBody,
      });

      await expectRedisEventToEqual(connectionId, expectedUpdatedBody);
    });

    it("should not update shouldRecordResult from true to false when resuming", async () => {
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      } as unknown as Response;

      await createStartEvent(mockRequest, preCheckMockResponse);
      await updateConnectionPause(mockRequest, preCheckMockResponse);

      const updateReq = {
        ...mockRequest,
        body: { shouldRecordResult: false },
      } as unknown as Request;

      await updateConnectionResume(updateReq, res);

      const expectedUpdatedBody = expect.objectContaining({
        pausedAt: null,
        shouldRecordResult: true,
      });

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Connection process resumed duration tracking.",
        event: expectedUpdatedBody,
      });

      await expectRedisEventToEqual(connectionId, expectedUpdatedBody);
    });

    it("should update shouldRecordResult status even when not paused", async () => {
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      } as unknown as Response;

      const req = {
        ...mockRequest,
        body: {
          shouldRecordResult: false,
        },
      } as unknown as Request;

      await createStartEvent(req, preCheckMockResponse);

      const updateReq = {
        ...mockRequest,
        body: { shouldRecordResult: true },
      } as unknown as Request;

      await updateConnectionResume(updateReq, res);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Connection was not paused. But shouldRecordResult updated.",
        event: expect.objectContaining({
          shouldRecordResult: true,
        }),
      });
    });

    it("should not update shouldRecordResult from true to false when not paused", async () => {
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      } as unknown as Response;

      await createStartEvent(mockRequest, preCheckMockResponse);

      const updateReq = {
        ...mockRequest,
        body: { shouldRecordResult: false },
      } as unknown as Request;

      await updateConnectionResume(updateReq, res);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Connection was not paused. Nothing changed.",
        event: expect.objectContaining({
          shouldRecordResult: true,
        }),
      });
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
        shouldRecordResult: true,
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

      await createStartEvent(mockRequest, preCheckMockResponse);

      jest.spyOn(res, "status").mockImplementationOnce(() => {
        throw new Error(errorMessage);
      });

      await updateConnectionResume(mockRequest, res);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: new Error(errorMessage) });
    });
  });

  describe("updateSuccessEvent", () => {
    it("should return 400 without proper client access", async () => {
      await createStartEvent(mockRequest, preCheckMockResponse);

      const req = {
        params: {
          connectionId,
        },
        headers: {
          authorization: createFakeAccessToken("differentClientId"),
        },
      } as unknown as Request;

      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      } as unknown as Response;

      await updateSuccessEvent(req, res);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Unauthorized attempt to modify a connection event",
      });
    });

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
