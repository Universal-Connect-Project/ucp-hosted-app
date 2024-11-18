import { Client } from "auth0";
import { Request, Response } from "express";

import envs from "../../config";
import {
  createClient,
  deleteClient,
  getClient,
  rotateClientSecret,
} from "../../resources/clients/clientsService";
import { getClientTokenFromRequest } from "../../shared/utils";

const handleError = (
  res: Response,
  error: Error | string,
  resourceName: string = "Resource",
  response500Message: string = "Internal server error",
  errorMessageCheck: string = "",
  response400Message: string = "Bad request",
) => {
  if (
    typeof error === "string" &&
    error.toUpperCase() === errorMessageCheck.toUpperCase()
  ) {
    res.status(400).json({ message: response400Message });
  } else if (
    typeof error === "string" &&
    error.toUpperCase().includes("NOT FOUND")
  ) {
    res.status(404).json({ message: `${resourceName} not found` });
  } else if (
    error instanceof Error &&
    error.message.toUpperCase().includes("TOO MANY REQUESTS")
  ) {
    res.status(429).json({ message: "Rate limit exceeded" });
  } else {
    res.status(500).json({ message: response500Message });
  }
};

export const clientsCreate = async (req: Request, res: Response) => {
  const clientToken = getClientTokenFromRequest(req);

  const clientBody = {
    name: `${envs.ENV === "test" ? "_test" : "ucp"}-${crypto.randomUUID()}`,
    client_metadata: {
      created_via: `ucp-api-v1`,
    },
  };

  try {
    const client: Client = await createClient(clientToken, clientBody);
    res.json({
      clientId: client.client_id,
      clientSecret: client.client_secret,
    });
  } catch (error) {
    handleError(
      res,
      error as Error,
      "User",
      "Unable to create keys",
      "user already has a client", // <-- Must match Auth0's error message
      "User already has keys",
    );
  }
};

export const clientsGet = async (req: Request, res: Response) => {
  const clientToken = getClientTokenFromRequest(req);

  try {
    const client: Client = await getClient(clientToken);
    res.json({
      clientId: client.client_id,
      clientSecret: client.client_secret,
    });
  } catch (error) {
    handleError(res, error as Error, "Keys", "Unable to get keys");
  }
};

export const clientsDelete = async (req: Request, res: Response) => {
  const clientToken = getClientTokenFromRequest(req);

  try {
    const response = await deleteClient(clientToken);
    res.send(response);
  } catch (error) {
    handleError(res, error as Error, "Keys", "Unable to delete keys");
  }
};

export const clientsRotateSecrets = async (req: Request, res: Response) => {
  const clientToken = getClientTokenFromRequest(req);

  try {
    const client: Client = await rotateClientSecret(clientToken);

    res.json({
      clientId: client.client_id,
      clientSecret: client.client_secret,
    });
  } catch (error) {
    handleError(res, error as Error, "Keys", "Unable to rotate keys");
  }
};
