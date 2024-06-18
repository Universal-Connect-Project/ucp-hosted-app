import { clientCreateSchema } from "@/resources/clients/clientsValidation";
import { Client, ClientCreate } from "auth0";
import { Request, Response, Router } from "express";

import { ReqValidate } from "@/middleware/validateMiddleware";
import { validateAccessToken } from "@/middleware/authMiddleware";
import {
  getClient,
  createClient,
  deleteClient,
} from "@/resources/clients/clientsService";

const apiVersion = "v1";

const clientsRoutesV1 = (router: Router): void => {
  router.get("/:id", [validateAccessToken], (req: Request, res: Response) => {
    const clientId: string = req.params.id;

    void getClient(clientId)
      .then((client: Client | Error) => {
        res.send(
          JSON.stringify({
            ...client,
          }),
        );
      })
      .catch((error: Error) => {
        res.send(
          JSON.stringify({
            message: error.message,
          }),
        );
      });
  });

  router.delete(
    "/:id",
    [validateAccessToken],
    (req: Request, res: Response) => {
      const clientId: string = req.params.id;

      void deleteClient(clientId)
        .then((client: Client | Error) => {
          res.send(
            JSON.stringify({
              ...client,
            }),
          );
        })
        .catch((error: Error) => {
          res.send(
            JSON.stringify({
              message: error.message,
            }),
          );
        });
    },
  );

  router.post(
    "/",
    [validateAccessToken, ReqValidate.body(clientCreateSchema)],
    (req: Request<object, object, ClientCreate>, res: Response) => {
      const body = {
        ...req.body,
        client_metadata: {
          created_via: `api-${apiVersion}`,
        },
      };

      void createClient(body)
        .then((client: Client | Error) => {
          res.send(
            JSON.stringify({
              ...client,
            }),
          );
        })
        .catch((error: Error) => {
          res.send(
            JSON.stringify({
              message: error.message,
            }),
          );
        });
    },
  );
};

export default clientsRoutesV1;
