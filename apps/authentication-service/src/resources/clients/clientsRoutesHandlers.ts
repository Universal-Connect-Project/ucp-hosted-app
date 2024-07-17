import { Client } from "auth0";
import { Request, Response } from "express";

import { ClientCreateBody } from "@/resources/clients/clientsModel";
import {
  createClient,
  deleteClient,
  getClient,
} from "@/resources/clients/clientsService";
import { getClientTokenFromRequest } from "@/shared/utils";

const apiVersion = "v1";

export const routeClientCreate = (
  req: Request<object, object, ClientCreateBody>,
  res: Response,
) => {
  const clientToken = getClientTokenFromRequest(
    req as Request<object, object, never>,
  );

  const client = {
    name: `ucp-${crypto.randomUUID()}`,
    client_metadata: {
      created_via: `api-${apiVersion}`,
    },
  };

  void createClient(clientToken, client)
    .then((client: Client) => {
      res.send(
        JSON.stringify({
          ...client,
        }),
      );
    })
    .catch((reason) => {
      if (
        typeof reason === "string" &&
        reason === "User already has a client"
      ) {
        res.status(400).send(JSON.stringify(reason));
      } else {
        res.status(500).send(JSON.stringify(reason));
      }
    });
};

export const routeClientGet = (req: Request, res: Response) => {
  const clientToken = getClientTokenFromRequest(
    req as Request<object, object, never>,
  );

  void getClient(clientToken)
    .then((client: Client) => {
      res.send(
        JSON.stringify({
          ...client,
        }),
      );
    })
    .catch((reason) => {
      if (reason instanceof Error && reason.message === "Not Found") {
        res.status(404).send(JSON.stringify("Client not found"));
      } else {
        res.status(500).send(JSON.stringify("Unable to get client"));
      }
    });
};

export const routeClientDelete = (req: Request, res: Response) => {
  const clientToken = getClientTokenFromRequest(
    req as Request<object, object, never>,
  );

  void deleteClient(clientToken)
    .then(() => {
      res.send(null);
    })
    .catch(() => {
      res.status(500).send(JSON.stringify("Unable to delete client"));
    });
};
