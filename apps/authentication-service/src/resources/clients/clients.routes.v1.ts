import { clientCreateSchema } from "@/resources/clients/clients.validation";
import { Client, ClientCreate } from "auth0";
import { Request, Response, Router } from "express";

import { ReqValidate } from "@/middleware/validate.middleware";
import { validateAccessToken } from "@/middleware/auth.middleware";
import { getClient, createClient } from "./clients.service";

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
