import { Request, Response } from "express";
import { setEvent, getEvent } from "../services/storageClient/redis";
import { getAccessTokenFromRequest } from "@repo/backend-utils";
import { jwtDecode } from "jwt-decode";

interface CreateStartRequest {
  jobTypes: string[];
  institutionId: string;
  aggregatorId: string;
  recordDuration?: boolean;
}

export interface EventObject {
  connectionId: string;
  jobTypes: string[];
  institutionId: string;
  aggregatorId: string;
  clientId: string;
  startedAt: number;
  userInteractionTime: number;
  pausedAt: number | null | undefined;
  successAt?: number;
  recordDuration: boolean;
}

export interface DecodedToken {
  azp: string;
}

const getClientIdFromRequest = (req: Request) => {
  const accessToken = getAccessTokenFromRequest(req);
  const decodedToken: DecodedToken = jwtDecode(accessToken);

  return decodedToken.azp;
};

const withClientAccess = (
  handler: (req: Request, res: Response) => Promise<void>,
) => {
  return async (req: Request, res: Response) => {
    const clientId = getClientIdFromRequest(req);
    const { connectionId } = req.params;

    const connection = (await getEvent(connectionId)) as EventObject;

    if (!connection || clientId !== connection.clientId) {
      return res
        .status(400)
        .json({ error: "Unauthorized attempt to modify a connection event" });
    }

    await handler(req, res);
  };
};

export const createStartEvent = async (req: Request, res: Response) => {
  try {
    const clientId = getClientIdFromRequest(req);
    const { connectionId } = req.params;
    const {
      jobTypes,
      institutionId,
      aggregatorId,
      recordDuration = true,
    } = req.body as CreateStartRequest;
    const eventBody = {
      connectionId,
      institutionId,
      aggregatorId,
      clientId,
      jobTypes,
      startedAt: Date.now(),
      recordDuration,
    };
    const eventObj = (await getEvent(connectionId)) as EventObject;
    if (eventObj) {
      return res.status(200).json({
        message: "Connection event already started",
        event: eventObj,
      });
    }

    await setEvent(connectionId, eventBody);

    res.status(201).json({
      message: `Started tracking connection: ${connectionId}`,
      event: eventBody,
    });
  } catch (error) {
    res.status(400).json({ error: error });
  }
};

export const updateConnectionPause = withClientAccess(
  async (req: Request, res: Response) => {
    try {
      const dateNow = Date.now();
      const { connectionId } = req.params;
      const eventObj = (await getEvent(connectionId)) as EventObject;
      if (eventObj.pausedAt) {
        res.status(200).json({
          message: "Connection process was already paused. Nothing changed.",
          event: eventObj,
        });
      } else {
        eventObj.pausedAt = dateNow;
        eventObj.userInteractionTime = eventObj.userInteractionTime ?? 0;
        await setEvent(connectionId, eventObj);
        res.status(200).json({
          message: "Connection process paused duration tracking.",
          event: eventObj,
        });
      }
    } catch (error) {
      res.status(400).json({ error });
    }
  },
);

export const updateConnectionResume = withClientAccess(
  async (req: Request, res: Response) => {
    try {
      const dateNow = Date.now();
      const { connectionId } = req.params;
      const eventObj = (await getEvent(connectionId)) as EventObject;
      if (eventObj?.pausedAt) {
        const pauseDurationMilliseconds = dateNow - eventObj.pausedAt;
        eventObj.userInteractionTime += pauseDurationMilliseconds;
        eventObj.pausedAt = null;

        await setEvent(connectionId, eventObj);
        res.status(200).json({
          message: "Connection process resumed duration tracking.",
          event: eventObj,
        });
      } else {
        res.status(200).json({
          message: "Connection was not paused. Nothing changed.",
          event: eventObj,
        });
      }
    } catch (error) {
      res.status(400).json({ error });
    }
  },
);

export const updateSuccessEvent = withClientAccess(
  async (req: Request, res: Response) => {
    try {
      const dateNow = Date.now();
      const { connectionId } = req.params;
      const eventObj = (await getEvent(connectionId)) as EventObject;
      if (eventObj?.successAt) {
        res.status(200).json({
          message: "Connection was already completed. Nothing changed.",
          event: eventObj,
        });
      } else {
        const updatedObj = { ...eventObj, successAt: dateNow };
        await setEvent(connectionId, updatedObj);
        res.status(200).json({
          message: "Connection was completed successfully.",
          event: updatedObj,
        });
      }
    } catch (error) {
      res.status(400).json({ error });
    }
  },
);
