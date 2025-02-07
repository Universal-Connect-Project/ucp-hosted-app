import { Request, Response } from "express";
import { setEvent, getEvent } from "../services/storageClient/redis";

interface CreateStartRequest {
  jobType: string[];
  institutionId: string;
  aggregatorId: string;
  clientId: string;
}

export interface EventObject {
  connectionId: string;
  jobType: string[];
  institutionId: string;
  aggregatorId: string;
  clientId: string;
  startedAt: number;
  userInteractionTime: number;
  pausedAt: number | null | undefined;
  successAt: number;
}

export const createStartEvent = async (req: Request, res: Response) => {
  try {
    const { connectionId } = req.params;
    const { jobType, institutionId, aggregatorId, clientId } =
      req.body as CreateStartRequest;
    const eventBody = {
      connectionId,
      institutionId,
      aggregatorId,
      clientId,
      jobType,
      startedAt: Date.now(),
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

export const updateConnectionPause = async (req: Request, res: Response) => {
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
};

export const updateConnectionResume = async (req: Request, res: Response) => {
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
};

export const updateSuccessEvent = async (req: Request, res: Response) => {
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
};
