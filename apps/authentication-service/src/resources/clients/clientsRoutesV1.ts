import { Client } from "auth0";
import { Request, Response, Router } from "express";

import { validateAccessToken } from "@/middleware/authMiddleware";
import {
  getClient,
  createClient,
  deleteClient,
} from "@/resources/clients/clientsService";
import { ClientCreateBody } from "@/resources/clients/clientsModel";

const apiVersion = "v1";

export const clientsRoutesV1 = (router: Router): void => {
  router.post(
    "/",
    [validateAccessToken],
    (req: Request<object, object, ClientCreateBody>, res: Response) => {
      const clientToken = (req?.headers?.authorization || "Bearer ").split(
        " ",
      )[1];
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
        .catch(() => {
          res.status(500).send(JSON.stringify("Unable to create client"));
        });
    },
  );

  router.get("/", [validateAccessToken], (req: Request, res: Response) => {
    const clientToken = (req?.headers?.authorization || "Bearer ").split(
      " ",
    )[1];

    void getClient(clientToken)
      .then((client: Client) => {
        res.send(
          JSON.stringify({
            ...client,
          }),
        );
      })
      .catch(() => {
        res.status(500).send(JSON.stringify("Unable to get client"));
      });
  });

  router.delete("/", [validateAccessToken], (req: Request, res: Response) => {
    const clientToken = (req?.headers?.authorization || "Bearer ").split(
      " ",
    )[1];

    void deleteClient(clientToken)
      .then(() => {
        res.send(null);
      })
      .catch(() => {
        res.status(500).send(JSON.stringify("Unable to delete client"));
      });
  });
};
