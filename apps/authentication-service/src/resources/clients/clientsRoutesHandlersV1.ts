import { Client } from "auth0";
import { Request, Response } from "express";

import {
  createClient,
  deleteClient,
  getClient,
  rotateClientSecret,
} from "@/resources/clients/clientsService";
import { getClientTokenFromRequest } from "@/shared/utils";

export const clientsCreate = async (req: Request, res: Response) => {
  const clientToken = getClientTokenFromRequest(req);

  const clientBody = {
    name: `ucp-${crypto.randomUUID()}`,
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

export const clientsGet = async (req: Request, res: Response) => {
  const clientToken = getClientTokenFromRequest(req);

  try {
    const client: Client = await getClient(clientToken);
    res.json({
      clientId: client.client_id,
      clientSecret: client.client_secret,
    });
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

export const clientsDelete = async (req: Request, res: Response) => {
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

export const clientsRotateSecrets = async (req: Request, res: Response) => {
  const clientToken = getClientTokenFromRequest(req);

  try {
    const client: Client = await rotateClientSecret(clientToken);

    res.json({
      clientId: client.client_id,
      clientSecret: client.client_secret,
    });
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
      res.status(500).json({ message: "Unable to rotate client secret" });
    }
  }
};
