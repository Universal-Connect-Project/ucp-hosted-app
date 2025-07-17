import "../dotEnv";
import { validateAccessToken } from "@repo/backend-utils";
import {
  AUTH0_CLIENT_AUDIENCE,
  AUTH0_WIDGET_AUDIENCE,
} from "@repo/shared-utils";
import { NextFunction } from "express";
import { getEvent } from "../services/storageClient/redis";
import { Request, Response } from "express";

export const validateUIAudience = validateAccessToken({
  audience: AUTH0_CLIENT_AUDIENCE,
  auth0Domain: process.env.AUTH0_DOMAIN as string,
});

export const validateWidgetAudience = validateAccessToken({
  audience: AUTH0_WIDGET_AUDIENCE,
  auth0Domain: process.env.AUTH0_DOMAIN as string,
});

export async function validateConnectionId(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { connectionId } = req.params;

  const connectionExists = await getEvent(connectionId);

  if (!connectionExists) {
    return res.status(400).json({ error: "Connection not found" });
  }

  next();
}
