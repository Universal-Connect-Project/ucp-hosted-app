import { validateAccessToken } from "@/middleware/auth.middleware";
import { Request, Response, Router } from "express";
// import fetch, { Response as FetchResponse } from "node-fetch";

function clientsV1Routes(router: Router): void {
  // const baseAuth0Url = `https://${config.AUTH0_DOMAIN}`;

  router.post(
    "/createClient",
    validateAccessToken,
    (req: Request, res: Response) => {
      const body = req.body as string;

      console.log(body);

      res.send(
        JSON.stringify({
          message: "pong",
        }),
      );
    },
  );

  router.post("/client", validateAccessToken, (req: Request, res: Response) => {
    const body = req.body as string;

    console.log(body);

    res.send(
      JSON.stringify({
        message: "pong",
      }),
    );
  });
}

export default clientsV1Routes;
