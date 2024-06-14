import { Client } from "auth0";
import { Request, Response, Router } from "express";

import { validateAccessToken } from "@/middleware/auth.middleware";
import { getClient } from "./clients.service";

const clientsRoutesV1 = (router: Router): void => {
  router.get("/:id", validateAccessToken, (req: Request, res: Response) => {
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
        console.log("Error", error);
        res.send(
          JSON.stringify({
            message: error.message,
          }),
        );
      });
  });

  router.post("/", validateAccessToken, (req: Request, res: Response) => {
    const body = req.body as string;

    console.log(body);

    res.send(
      JSON.stringify({
        message: "coming soon...(client post)",
      }),
    );
  });
};

export default clientsRoutesV1;
