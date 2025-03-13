import "../dotEnv";
import { validateAccessToken } from "@repo/backend-utils";
import { AUTH0_WIDGET_AUDIENCE } from "@repo/shared-utils";
import { NextFunction } from "express";
import { getEvent } from "../services/storageClient/redis";
import { Request, Response } from "express";
import {
  EventObject,
  getClientIdFromRequest,
} from "../controllers/eventController";

export const validateWidgetAudience = validateAccessToken({
  audience: AUTH0_WIDGET_AUDIENCE,
  auth0Domain: process.env.AUTH0_DOMAIN as string,
});

export const ERROR_MESSAGES = {
  CONNECTION_REQUIRED: "connectionId is required",
  CONNECTION_NOT_FOUND: "Connection not found",
  UNAUTHORIZED_CLIENT: "Unauthorized attempt to modify a connection event",
};

export async function validateConnectionId(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { connectionId } = req.params;

  if (!connectionId) {
    return res.status(400).json({ error: ERROR_MESSAGES.CONNECTION_REQUIRED });
  }

  const connectionExists = await getEvent(connectionId);

  if (!connectionExists) {
    return res.status(400).json({ error: ERROR_MESSAGES.CONNECTION_NOT_FOUND });
  }

  next();
}

export async function validateClientAccess(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const clientId = getClientIdFromRequest(req);
  const { connectionId } = req.params;

  const connection = (await getEvent(connectionId)) as EventObject;

  if (clientId !== connection?.clientId) {
    return res.status(400).json({ error: ERROR_MESSAGES.UNAUTHORIZED_CLIENT });
  }

  next();
}
