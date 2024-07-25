import { Client } from "auth0";
import { Request, Response } from "express";

import {
  createClient,
  deleteClient,
  getClient,
} from "@/resources/clients/clientsService";
import { getClientTokenFromRequest } from "@/shared/utils";

export const clientsCreateV1 = async (req: Request, res: Response) => {
  const clientToken = getClientTokenFromRequest(req);

  const clientBody = {
    name: `ucp-${crypto.randomUUID()}`,
    client_metadata: {
      created_via: `ucp-api-v1`,
    },
  };

  try {
    const client: Client = await createClient(clientToken, clientBody);
    res.json(client);
  } catch (error) {
    if (
      typeof error === "string" &&
      error.toUpperCase() === "USER ALREADY HAS A CLIENT"
    ) {
      res.status(400).json({ message: "User already has a client" });
    } else if (
      error instanceof Error &&
      error.message.toUpperCase().includes("TOO MANY REQUESTS")
    ) {
      res.status(429).json({ message: "Rate limit exceeded" });
    } else {
      res.status(500).json({ message: "Unable to create client" });
    }
  }
};

export const clientsGetV1 = async (req: Request, res: Response) => {
  const clientToken = getClientTokenFromRequest(req);

  try {
    const client: Client = await getClient(clientToken);
    res.json(client);
  } catch (error) {
    if (
      typeof error === "string" &&
      error.toUpperCase().includes("NOT FOUND")
    ) {
      res.status(404).json({ message: "Client not found" });
    } else if (
      error instanceof Error &&
      error.message.toUpperCase().includes("TOO MANY REQUESTS")
    ) {
      res.status(429).json({ message: "Rate limit exceeded" });
    } else {
      res.status(500).json({ message: "Unable to get client" });
    }
  }
};

export const clientsDeleteV1 = async (req: Request, res: Response) => {
  const clientToken = getClientTokenFromRequest(req);

  try {
    const response = await deleteClient(clientToken);
    res.send(response);
  } catch (error) {
    if (
      typeof error === "string" &&
      error.toUpperCase().includes("NOT FOUND")
    ) {
      res.status(404).json({ message: "Client not found" });
    } else if (
      error instanceof Error &&
      error.message.toUpperCase().includes("TOO MANY REQUESTS")
    ) {
      res.status(429).json({ message: "Rate limit exceeded" });
    } else {
      res.status(500).json({ message: "Unable to delete client" });
    }
  }
};
