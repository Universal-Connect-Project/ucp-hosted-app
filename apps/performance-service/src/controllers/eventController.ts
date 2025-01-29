import { Request, Response } from "express";

export const createStartEvent = (req: Request, res: Response) => {
  try {
    // TODO: interact with Redis to create Event with the required fields
    res.status(201).json({ message: "TODO: implement start in next ticket" });
  } catch (error) {
    res.status(400).json({ error: error });
  }
};

export const updateConnectionPause = (req: Request, res: Response) => {
  try {
    // TODO: interact with Redis to update event to track when user interaction is happening
    // so we can remove time spent by the user when collecting the duration metric
    res
      .status(200)
      .json({ message: "TODO: implement update challenge in next ticket" });
  } catch (error) {
    res.status(400).json({ error: error });
  }
};

export const updateConnectionResume = (req: Request, res: Response) => {
  try {
    // TODO: interact with Redis to update event to track when user interaction is happening
    // so we can remove time spent by the user when collecting the duration metric
    res
      .status(200)
      .json({ message: "TODO: implement challenge resumed in next ticket" });
  } catch (error) {
    res.status(400).json({ error: error });
  }
};

export const updateSuccessEvent = (req: Request, res: Response) => {
  try {
    // TODO: interact with Redis to get all fields and the time between start and now minus
    // time spent in mfa to get duration then send the data to the time series database
    // and clear the redis object.
    res
      .status(200)
      .json({ message: "TODO: implement success event in next ticket" });
  } catch (error) {
    res.status(400).json({ error: error });
  }
};
