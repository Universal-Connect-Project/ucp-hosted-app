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
  } catch (reason) {
    if (typeof reason === "string" && reason === "User already has a client") {
      res.status(400).send("User already has a client");
    } else {
      res.status(500).send(JSON.stringify("Unable to create client"));
    }
  }
};

export const clientsGetV1 = async (req: Request, res: Response) => {
  const clientToken = getClientTokenFromRequest(req);

  try {
    const client: Client = await getClient(clientToken);
    res.json(client);
  } catch (reason) {
    if (reason instanceof Error && reason.message === "Not Found") {
      res.status(404).send(JSON.stringify("Client not found"));
    } else {
      res.status(500).send(JSON.stringify("Unable to get client"));
    }
  }
};

export const clientsDeleteV1 = async (req: Request, res: Response) => {
  const clientToken = getClientTokenFromRequest(req);

  try {
    await deleteClient(clientToken);
    res.send(null);
  } catch (reason) {
    res.status(500).send(JSON.stringify("Unable to delete client"));
  }
};
